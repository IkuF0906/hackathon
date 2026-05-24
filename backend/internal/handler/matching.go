package handler

import (
	"database/sql"
	"net/http"

	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

func MatchingHandler(c *gin.Context) {
	userID := c.GetString("userID")

	if c.Request.Method == "DELETE" {
		// マッチングキャンセル
		if err := repository.LeaveMatchingQueue(userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusNoContent)
		return
	}

	// すでにキューに参加しているか確認
	inQueue, err := repository.IsInMatchingQueue(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if inQueue {
		c.JSON(http.StatusConflict, gin.H{"error": "すでにキュー参加中です"})
		return
	}

	// マッチング相手を探す
	matchedUserID, err := repository.FindMatch(userID)
	if err == sql.ErrNoRows {
		// 相手がいないのでキューに追加して待機
		if err := repository.JoinMatchingQueue(userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusAccepted, gin.H{"status": "waiting"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// マッチング成立 → ルームを作成
	_, err = repository.CreateRoom(userID, matchedUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 両者をキューから削除
	repository.DeleteFromMatchingQueue(userID)
	repository.DeleteFromMatchingQueue(matchedUserID)

	c.JSON(http.StatusAccepted, gin.H{"status": "waiting"})
}
