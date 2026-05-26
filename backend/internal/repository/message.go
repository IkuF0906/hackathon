package repository

import (
	"backend/internal/model"
	"time"
)

func GetMessagesByRoomID(roomID string) ([]model.Message, error) {
	rows, err := DB.Query(
		"SELECT id, room_id, user_id, content, created_at FROM messages WHERE room_id = $1 ORDER BY created_at ASC",
		roomID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []model.Message
	for rows.Next() {
		var m model.Message
		var createdAt time.Time
		if err := rows.Scan(&m.MessageID, &m.RoomID, &m.UserID, &m.Content, &createdAt); err != nil {
			return nil, err
		}
		m.CreatedAt = createdAt.Format(time.RFC3339)
		messages = append(messages, m)
	}
	return messages, nil
}

func CreateMessage(roomID string, userID string, content string) (model.Message, error) {
	var m model.Message
	var createdAt time.Time
	err := DB.QueryRow(
		"INSERT INTO messages (room_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, room_id, user_id, content, created_at",
		roomID, userID, content,
	).Scan(&m.MessageID, &m.RoomID, &m.UserID, &m.Content, &createdAt)
	m.CreatedAt = createdAt.Format(time.RFC3339)
	return m, err
}

func IsRoomExpired(roomID string) (bool, error) {
	var count int
	err := DB.QueryRow(
		"SELECT COUNT(*) FROM rooms WHERE id = $1 AND expires_at < NOW()",
		roomID,
	).Scan(&count)
	return count > 0, err
}
