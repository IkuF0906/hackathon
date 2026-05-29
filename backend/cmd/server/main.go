package main

import (
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("C:/Project/hackathon/backend/.env"); err != nil {
		fmt.Println("envの読み込みエラー:", err)
	}
	fmt.Println("DB_HOST:", os.Getenv("DB_HOST"))
	fmt.Println("DB_PORT:", os.Getenv("DB_PORT"))

	repository.InitDB() //DB接続
	if err := repository.InitDB(); err != nil {
		panic(err) // エラー内容が表示される
	}

	r := gin.Default() //Ginのルーターっ作成
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Refresh-Token"},
		AllowCredentials: true,
	}))

	//wsで認証
	r.GET("/ws/matching", handler.WsMatchingHandler)
	r.GET("/ws/rooms/:room_id", handler.WsMessageHandler)

	// 認証不要
	auth := r.Group("/auth")
	auth.POST("/register", handler.SignUp)
	auth.POST("/login", handler.Login)
	auth.POST("/logout", handler.Logout)

	// 認証必要
	api := r.Group("/", middleware.Auth())
	api.GET("/users/me", handler.GetProfile)
	api.PUT("/users/me", handler.UpdateProfile)
	api.PUT("/users/me/attributes", handler.UpdateAttributes)
	api.POST("/matching/join", handler.MatchingHandler)
	api.DELETE("/matching/join", handler.MatchingHandler)
	api.GET("/rooms/:room_id", handler.RoomHandler)
	api.GET("/rooms/:room_id/messages", handler.MessageHandler)
	api.POST("/rooms/:room_id/messages", handler.MessageHandler)
	api.GET("/cards", handler.CardHandler)
	api.POST("/cards", handler.CardHandler)
	api.PUT("/cards/:card_id", handler.CardHandler)
	api.DELETE("/cards/:card_id", handler.DeleteCard)
	api.POST("/rooms/:room_id/card", handler.CardHandler)
	api.GET("/rooms/:room_id/card", handler.CardHandler)
	api.GET("/users/me/received-cards", handler.CardHandler)

	r.Run(":8080")
}
