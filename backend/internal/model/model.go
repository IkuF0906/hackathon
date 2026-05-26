package model

type User struct {
	ID       string `json:"user_id"`
	Name     string `json:"name"`
	Mail     string `json:"mail"`
	Password string `json:"-"` //レスポンスにパスワード情報を含めるべきではない
	Birthday string `json:"birthday"`
}

type Attribute struct {
	ID        int    `json:"id"`
	UserID    string `json:"user_id"`
	Attribute string `json:"attribute"`
}

type Card struct {
	CardID  string `json:"card_id"`
	UserID  string `json:"user_id"`
	Content string `json:"content"`
}

type Room struct {
	RoomID    string `json:"room_id"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}

type Message struct {
	MessageID string `json:"message_id"`
	RoomID    string `json:"room_id"`
	UserID    string `json:"user_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

type RoomUser struct {
	UserID string `json:"user_id"`
	Name   string `json:"name"`
}

type ReceivedCard struct {
	CardID     string `json:"card_id"`
	Content    string `json:"content"`
	ReceivedAt string `json:"received_at"`
}
