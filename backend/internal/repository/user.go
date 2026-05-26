package repository

import (
	"backend/internal/model"
	"time"
)

func CreateUser(user model.User, hashedPassword string) (string, error) {
	var userID string
	err := DB.QueryRow(
		"INSERT INTO users (name, mail, password, birthday) VALUES ($1, $2, $3, $4) RETURNING id",
		user.Name, user.Mail, hashedPassword, user.Birthday,
	).Scan(&userID)
	return userID, err
}

func GetUserByID(userID string) (model.User, error) {
	var user model.User
	var birthday time.Time
	err := DB.QueryRow(
		"SELECT id, name, mail, birthday FROM users WHERE id = $1", userID,
	).Scan(&user.ID, &user.Name, &user.Mail, &birthday)
	user.Birthday = birthday.Format("2006-01-02")
	return user, err
}

func GetUserByMail(mail string) (model.User, error) {
	var user model.User
	err := DB.QueryRow(
		"SELECT id, name, mail, password, birthday FROM users WHERE mail = $1", mail,
	).Scan(&user.ID, &user.Name, &user.Mail, &user.Password, &user.Birthday)
	return user, err
}

func UpdateUserName(userID string, name string) error {
	_, err := DB.Exec(
		"UPDATE users SET name = $1 WHERE id = $2",
		name, userID,
	)
	return err
}

func GetAttributesByUserID(userID string) ([]string, error) {
	rows, err := DB.Query(
		"SELECT attribute FROM attributes WHERE user_id = $1", userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attributes []string
	for rows.Next() {
		var attribute string
		if err := rows.Scan(&attribute); err != nil {
			return nil, err
		}
		attributes = append(attributes, attribute)
	}
	return attributes, nil
}

func CreateAttributes(userID string, attributes []string) error {
	for _, attribute := range attributes {
		_, err := DB.Exec(
			"INSERT INTO attributes (user_id, attribute) VALUES ($1, $2)",
			userID, attribute,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func DeleteAttributesByUserID(userID string) error {
	_, err := DB.Exec(
		"DELETE FROM attributes WHERE user_id = $1", userID,
	)
	return err
}
