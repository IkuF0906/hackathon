package repository

import (
	"backend/internal/model"
	"time"
)

func GetRoomByID(roomID string, userID string) (model.Room, []model.RoomUser, error) {
	var room model.Room
	var createdAt, expiresAt time.Time

	err := DB.QueryRow(
		"SELECT id, created_at, expires_at FROM rooms WHERE id = $1",
		roomID,
	).Scan(&room.RoomID, &createdAt, &expiresAt)
	if err != nil {
		return room, nil, err
	}

	room.CreatedAt = createdAt.Format(time.RFC3339)
	room.ExpiresAt = expiresAt.Format(time.RFC3339)

	// ルームの参加者を取得
	rows, err := DB.Query(
		"SELECT u.id, u.name FROM users u JOIN room_users ru ON u.id = ru.user_id WHERE ru.room_id = $1",
		roomID,
	)
	if err != nil {
		return room, nil, err
	}
	defer rows.Close()

	var users []model.RoomUser
	for rows.Next() {
		var u model.RoomUser
		if err := rows.Scan(&u.UserID, &u.Name); err != nil {
			return room, nil, err
		}
		users = append(users, u)
	}

	return room, users, nil
}

func IsRoomMember(roomID string, userID string) (bool, error) {
	var count int
	err := DB.QueryRow(
		"SELECT COUNT(*) FROM room_users WHERE room_id = $1 AND user_id = $2",
		roomID, userID,
	).Scan(&count)
	return count > 0, err
}
