package handler

import (
	"database/sql"
	"net/http"

	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

func RoomHandler(c *gin.Context) {
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

	room, users, err := repository.GetRoomByID(roomID, userID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "ルームが存在しません"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"room_id":    room.RoomID,
		"created_at": room.CreatedAt,
		"expires_at": room.ExpiresAt,
		"users":      users,
	})
}
