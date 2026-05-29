package handler

import (
	"fmt"
	"net/http"
	"time"

	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func SignUp(c *gin.Context) {
	var input struct {
		Name       string   `json:"name"`
		Mail       string   `json:"mail"`
		Password   string   `json:"password"`
		Birthday   string   `json:"birthday"`
		Attributes []string `json:"attributes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	_, err := repository.GetUserByMail(input.Mail)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "メールアドレスが既に登録済みです"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user := model.User{
		Name:     input.Name,
		Mail:     input.Mail,
		Birthday: input.Birthday,
	}

	userID, err := repository.CreateUser(user, string(hashedPassword))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// attributesを保存
	if len(input.Attributes) > 0 {
		if err := repository.CreateAttributes(userID, input.Attributes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	accessToken, err := utils.GenerateAccessToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = repository.SaveRefreshToken(userID, refreshToken, time.Now().Add(30*24*time.Hour))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user_id":       userID,
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func Login(c *gin.Context) {

	var input struct {
		Mail     string `json:"mail"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "入力値が不正です"})
		return
	}

	fmt.Println("input.Mail:", input.Mail)         // 追加
	fmt.Println("input.Password:", input.Password) // 追加

	user, err := repository.GetUserByMail(input.Mail)
	if err != nil {
		fmt.Println("GetUserByMail error:", err) // 追加
		c.JSON(http.StatusUnauthorized, gin.H{"error": "メールアドレスまたはパスワードが不正です"})
		return
	}

	fmt.Println("user.Password:", user.Password) // 追加

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		fmt.Println("bcrypt error:", err) // 追加
		c.JSON(http.StatusUnauthorized, gin.H{"error": "メールアドレスまたはパスワードが不正です"})
		return
	}

	accessToken, err := utils.GenerateAccessToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = repository.SaveRefreshToken(user.ID, refreshToken, time.Now().Add(30*24*time.Hour))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user_id":       user.ID,
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}

func Logout(c *gin.Context) {
	refreshToken := c.GetHeader("Refresh-Token")
	if refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証エラー"})
		return
	}

	if err := repository.DeleteRefreshToken(refreshToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
