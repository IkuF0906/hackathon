package repository

import (
	"time"
)

func JoinMatchingQueue(userID string) error {
	_, err := DB.Exec(
		"INSERT INTO matching_queue (user_id) VALUES ($1)",
		userID,
	)
	return err
}

func LeaveMatchingQueue(userID string) error {
	_, err := DB.Exec(
		"DELETE FROM matching_queue WHERE user_id = $1",
		userID,
	)
	return err
}

func IsInMatchingQueue(userID string) (bool, error) {
	var count int
	err := DB.QueryRow(
		"SELECT COUNT(*) FROM matching_queue WHERE user_id = $1", userID,
	).Scan(&count)
	return count > 0, err
}

func FindMatch(userID string) (string, error) {
	var matchedUserID string
	err := DB.QueryRow(
		"SELECT user_id FROM matching_queue WHERE user_id != $1 LIMIT 1",
		userID,
	).Scan(&matchedUserID)
	return matchedUserID, err
}

func CreateRoom(userID1 string, userID2 string) (string, error) {
	var roomID string
	expiresAt := time.Now().Add(5 * time.Minute)
	err := DB.QueryRow(
		"INSERT INTO rooms (expires_at) VALUES ($1) RETURNING id",
		expiresAt,
	).Scan(&roomID)
	if err != nil {
		return "", err
	}

	_, err = DB.Exec(
		"INSERT INTO room_users (room_id, user_id) VALUES ($1, $2), ($1, $3)",
		roomID, userID1, userID2,
	)
	return roomID, err
}

func DeleteFromMatchingQueue(userID string) error {
	_, err := DB.Exec(
		"DELETE FROM matching_queue WHERE user_id = $1", userID,
	)
	return err
}
