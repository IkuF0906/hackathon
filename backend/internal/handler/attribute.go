package handler

import (
	"net/http"

	"backend/internal/repository"

	"github.com/gin-gonic/gin"
)

func UpdateAttributes(c *gin.Context) {
	userID := c.GetString("userID")

	var input struct {
		Attributes []string `json:"attributes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}
	if len(input.Attributes) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	// 既存の属性を全削除して新しい属性を追加
	if err := repository.DeleteAttributesByUserID(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := repository.CreateAttributes(userID, input.Attributes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"attributes": input.Attributes,
	})
}
