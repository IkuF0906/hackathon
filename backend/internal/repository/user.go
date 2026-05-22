package repository

import (
	"backend/internal/model"
	"database/sql"
)

var DB *sql.DB

func GetUserByID(userID int) (model.User, error) {
	var user model.User
	err := DB.QueryRow("SELECT name, mail, birthday FROM users WHERE id = $1", userID).
		Scan(&user.Name, &user.Mail, &user.Birthday)
	return user, err
}
