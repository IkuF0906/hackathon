package handler

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	waitingUsers []*WaitingUser
	waitingMutex sync.Mutex
	rooms        = make(map[string][]*Client)
	roomsMutex   sync.Mutex
	upgrader     = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

// 構造体
type WaitingUser struct {
	Conn       *websocket.Conn
	UserID     string
	Attributes []string
}

type Client struct {
	Conn   *websocket.Conn
	RoomID string
	UserID string
}
