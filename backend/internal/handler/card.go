package handler

import (
	"database/sql"
	"net/http"

	"backend/internal/model"
	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

func CardHandler(c *gin.Context) {
	userID := c.GetString("userID")

	switch c.FullPath() {
	case "/cards":
		if c.Request.Method == "GET" {
			getCards(c, userID)
		} else {
			createCard(c, userID)
		}
	case "/cards/:card_id":
		updateCard(c, userID)
	case "/rooms/:room_id/card":
		if c.Request.Method == "POST" {
			sendCard(c, userID)
		} else {
			getReceivedCard(c, userID)
		}
	case "/users/me/received-cards":
		getReceivedCards(c, userID)
	}
}

func getCards(c *gin.Context, userID string) {
	cards, err := repository.GetCardsByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if cards == nil {
		cards = []model.Card{}
	}
	c.JSON(http.StatusOK, cards)
}

func createCard(c *gin.Context, userID string) {
	var input struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	card, err := repository.CreateCard(userID, input.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, card)
}

func updateCard(c *gin.Context, userID string) {
	cardID := c.Param("card_id")

	var input struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	card, err := repository.UpdateCard(cardID, userID, input.Content)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "カードが存在しません"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, card)
}

func DeleteCard(c *gin.Context) {
	userID := c.GetString("userID")
	cardID := c.Param("card_id")

	err := repository.DeleteCard(cardID, userID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "カードが存在しません"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func sendCard(c *gin.Context, userID string) {
	roomID := c.Param("room_id")

	var input struct {
		CardID string `json:"card_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.CardID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	// ルームの参加者か確認
	isMember, err := repository.IsRoomMember(roomID, userID)
	if err != nil || !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "ルームの参加者ではありません"})
		return
	}

	// 相手のuserIDを取得
	members, err := repository.GetRoomMembers(roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var receiverID string
	for _, m := range members {
		if m != userID {
			receiverID = m
		}
	}

	if err := repository.SendCard(roomID, userID, receiverID, input.CardID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func getReceivedCard(c *gin.Context, userID string) {
	roomID := c.Param("room_id")

	card, err := repository.GetReceivedCardByRoomID(roomID, userID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "まだカードが送られていません"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, card)
}

func getReceivedCards(c *gin.Context, userID string) {
	cards, err := repository.GetReceivedCards(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if cards == nil {
		cards = []model.ReceivedCard{}
	}
	c.JSON(http.StatusOK, cards)
}
