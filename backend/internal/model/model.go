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
