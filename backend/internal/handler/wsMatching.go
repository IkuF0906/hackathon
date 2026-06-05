package handler

import (
	"backend/internal/repository"
	"backend/pkg/utils"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

func WsMatchingHandler(c *gin.Context) {

	tokenString := c.Query("token")
	userID, err := utils.ParseToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証エラー"})
		return
	}

	rows, _ := repository.DB.Query("SELECT attribute FROM attributes WHERE user_id = $1", userID)

	var attributes []string
	for rows.Next() {
		var attr string
		rows.Scan(&attr)
		attributes = append(attributes, attr)
	}
	rows.Close()
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	waitingUser := &WaitingUser{Conn: conn, UserID: userID, Attributes: attributes}

	waitingMutex.Lock()
	var matched *WaitingUser
	var matchedIndex int
	maxMatch := 0

	for i, u := range waitingUsers {
		matchCount := 0
		for _, attr := range attributes {
			for _, uAttr := range u.Attributes {
				if attr == uAttr {
					matchCount++
				}
			}
		}
		if matchCount > maxMatch {
			maxMatch = matchCount
			matched = u
			matchedIndex = i
		}
	}

	if maxMatch == 0 {
		matched = nil
	}

	if matched != nil {
		waitingUsers = append(waitingUsers[:matchedIndex], waitingUsers[matchedIndex+1:]...)
	}

	if matched == nil {
		waitingUsers = append(waitingUsers, waitingUser)
		waitingMutex.Unlock()
		conn.WriteMessage(websocket.TextMessage, []byte(`{"status":"waiting"}`))

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				waitingMutex.Lock()
				for i, u := range waitingUsers {
					if u.UserID == userID {
						waitingUsers = append(waitingUsers[:i], waitingUsers[i+1:]...)
						break
					}
				}
				waitingMutex.Unlock()
				break
			}
		}
	} else {
		waitingMutex.Unlock()

		if err := matched.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			waitingMutex.Lock()
			waitingUsers = append(waitingUsers, waitingUser)
			waitingMutex.Unlock()
			conn.WriteMessage(websocket.TextMessage, []byte(`{"status":"waiting"}`))
			return
		}

<<<<<<< Updated upstream
		var roomID int
		repository.DB.QueryRow("INSERT INTO rooms DEFAULT VALUES RETURNING id").Scan(&roomID)
		
		var username1 string
		var username2 string
		repository.DB.QueryRow("SELECT name FROM users WHERE id=$1", userID).Scan(&username1)
		repository.DB.QueryRow("SELECT name FROM users WHERE id=$1", matched.UserID).Scan(&username2)

		msg := fmt.Sprintf(
			`{"status":"matched","room_id":%d,"name_1":"%s","name_2":"%s"}`,
			roomID,
			username1,
			username2,
		)
=======
		var roomID string
		err := repository.DB.QueryRow(
			"INSERT INTO rooms (expires_at) VALUES ($1) RETURNING id",
			time.Now().Add(5*time.Minute),
		).Scan(&roomID)

		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte(`{"status":"error"}`))
			return
		}

		// room_usersにも追加
		repository.DB.Exec(
			"INSERT INTO room_users (room_id, user_id) VALUES ($1, $2), ($1, $3)",
			roomID, userID, matched.UserID,
		)

		msg := fmt.Sprintf(`{"status":"matched","room_id":"%s"}`, roomID)
>>>>>>> Stashed changes
		matched.Conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.WriteMessage(websocket.TextMessage, []byte(msg))

		go func() {
			time.Sleep(5 * time.Minute)
			repository.DB.Exec("DELETE FROM rooms WHERE id = $1", roomID)
		}()
	}
}
