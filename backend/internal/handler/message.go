package handler

import (
	"database/sql"
	"net/http"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

func MessageHandler(c *gin.Context) {
	userID := c.GetString("userID")
	roomID := c.Param("room_id")

	// ルームの参加者か確認
	isMember, err := repository.IsRoomMember(roomID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "ルームの参加者ではありません"})
		return
	}

	if c.Request.Method == "GET" {
		// メッセージ履歴取得
		messages, err := repository.GetMessagesByRoomID(roomID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if messages == nil {
			messages = []model.Message{}
		}
		c.JSON(http.StatusOK, messages)
		return
	}

	// メッセージ送信
	var input struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}
	if utils.ContainsNGWord(input.Content) {
		c.JSON(http.StatusForbidden, gin.H{"error": "公序良俗に反するメッセージです"})
		return
	}
	if utils.ContainsURL(input.Content) {
		c.JSON(http.StatusForbidden, gin.H{"error": "URLの送信は禁止されています"})
		return
	}

	// ルームの有効期限確認
	expired, err := repository.IsRoomExpired(roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if expired {
		c.JSON(http.StatusGone, gin.H{"error": "ルームの有効期限が切れています"})
		return
	}

	message, err := repository.CreateMessage(roomID, userID, input.Content)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ルームが存在しません"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, message)
}
