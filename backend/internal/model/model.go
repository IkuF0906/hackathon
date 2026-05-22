package model

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Mail     string `json:"mail"`
	Password string `json:"password"`
	Birthday string `json:"birthday"`
}

type Attribute struct {
	Attribute string
	UserID    int
}

type Card struct {
	CardID int
	UserID int
}
