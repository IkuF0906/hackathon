package handler

import (
	"backend/internal/model"
	"backend/internal/repository"
	"backend/pkg/utils"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

func WsMessageHandler(c *gin.Context) {

	tokenString := c.Query("token")
	userID, err := utils.ParseToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証エラー"})
		return
	}

	roomID := c.Param("room_id")

	var userName string
	repository.DB.QueryRow("SELECT name FROM users WHERE id = $1", userID).Scan(&userName)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	client := &Client{Conn: conn, RoomID: roomID, UserID: userID}

	roomsMutex.Lock()
	rooms[roomID] = append(rooms[roomID], client)
	roomsMutex.Unlock()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// NGワード
		if utils.ContainsNGWord(string(msg)) {
			conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"error", "error_title": "NGワードを検知", "error_reason":"あなたのメッセージからNGワードを検知したため、"}`))

			errorMsg := []byte(`{"type":"error","error_title": "NGワードを検知", "error_reason":"相手のメッセージからNGワードを検知したため、"}`)
			roomsMutex.Lock()
			for _, cl := range rooms[roomID] {
				cl.Conn.WriteMessage(websocket.TextMessage, errorMsg)
			}
			roomsMutex.Unlock()
			continue
		}

		// URL
		if utils.ContainsURL(string(msg)) {
			conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"error","error_title": "URLを検知", "error_reason":"あなたのメッセージからURLを検知したため、"}`))

			errorMsg := []byte(`{"type":"error","error_title": "URLを検知", "error_reason":"相手のメッセージからURLを検知したため、"}`)
			roomsMutex.Lock()
			for _, cl := range rooms[roomID] {
				cl.Conn.WriteMessage(websocket.TextMessage, errorMsg)
			}
			roomsMutex.Unlock()
			continue
		}

		message := model.Message{UserName: userName, UserID: userID, RoomID: roomID, Content: string(msg)}
		jsonMsg, _ := json.Marshal(message)

		repository.DB.Exec(
			"INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3)",
			roomID, userID, string(msg),
		)

		roomsMutex.Lock()
		for _, cl := range rooms[roomID] {
			cl.Conn.WriteMessage(websocket.TextMessage, jsonMsg)
		}
		roomsMutex.Unlock()
	}

	roomsMutex.Lock()
	clients := rooms[roomID]
	for i, cl := range clients {
		if cl == client {
			rooms[roomID] = append(clients[:i], clients[i+1:]...)
			break
		}
	}
	for _, cl := range rooms[roomID] {
		cl.Conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"left"}`))
	}
	roomsMutex.Unlock()
}
