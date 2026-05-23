package repository

import (
	"time"
)

func SaveRefreshToken(userID string, token string, expiresAt time.Time) error {
	_, err := DB.Exec(
		"INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
		userID, token, expiresAt,
	)
	return err
}

func DeleteRefreshToken(token string) error {
	_, err := DB.Exec(
		"DELETE FROM refresh_tokens WHERE token = $1", token,
	)
	return err
}

func GetRefreshToken(token string) (string, time.Time, error) {
	var userID string
	var expiresAt time.Time
	err := DB.QueryRow(
		"SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1", token,
	).Scan(&userID, &expiresAt)
	return userID, expiresAt, err
}
