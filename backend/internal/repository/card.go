package repository

import (
	"backend/internal/model"
	"database/sql"
	"time"
)

func GetCardsByUserID(userID string) ([]model.Card, error) {
	rows, err := DB.Query(
		"SELECT id, user_id, content FROM cards WHERE user_id = $1",
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []model.Card
	for rows.Next() {
		var card model.Card
		if err := rows.Scan(&card.CardID, &card.UserID, &card.Content); err != nil {
			return nil, err
		}
		cards = append(cards, card)
	}
	return cards, nil
}

func CreateCard(userID string, content string) (model.Card, error) {
	var card model.Card
	err := DB.QueryRow(
		"INSERT INTO cards (user_id, content) VALUES ($1, $2) RETURNING id, user_id, content",
		userID, content,
	).Scan(&card.CardID, &card.UserID, &card.Content)
	return card, err
}

func UpdateCard(cardID string, userID string, content string) (model.Card, error) {
	var card model.Card
	err := DB.QueryRow(
		"UPDATE cards SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING id, user_id, content",
		content, cardID, userID,
	).Scan(&card.CardID, &card.UserID, &card.Content)
	return card, err
}

func DeleteCard(cardID string, userID string) error {
	result, err := DB.Exec(
		"DELETE FROM cards WHERE id = $1 AND user_id = $2",
		cardID, userID,
	)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func SendCard(roomID string, senderID string, receiverID string, cardID string) error {
	_, err := DB.Exec(
		"INSERT INTO room_cards (room_id, sender_id, receiver_id, card_id) VALUES ($1, $2, $3, $4)",
		roomID, senderID, receiverID, cardID,
	)
	return err
}

func GetReceivedCardByRoomID(roomID string, userID string) (model.Card, error) {
	var card model.Card
	err := DB.QueryRow(
		`SELECT c.id, c.content FROM cards c 
         JOIN room_cards rc ON c.id = rc.card_id 
         WHERE rc.room_id = $1 AND rc.receiver_id = $2`,
		roomID, userID,
	).Scan(&card.CardID, &card.Content)
	return card, err
}

func GetReceivedCards(userID string) ([]model.ReceivedCard, error) {
	rows, err := DB.Query(
		`SELECT c.id, c.content, rc.received_at FROM cards c 
         JOIN room_cards rc ON c.id = rc.card_id 
         WHERE rc.receiver_id = $1 ORDER BY rc.received_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []model.ReceivedCard
	for rows.Next() {
		var card model.ReceivedCard
		var receivedAt time.Time
		if err := rows.Scan(&card.CardID, &card.Content, &receivedAt); err != nil {
			return nil, err
		}
		card.ReceivedAt = receivedAt.Format(time.RFC3339)
		cards = append(cards, card)
	}
	return cards, nil
}

func GetRoomMembers(roomID string) ([]string, error) {
	rows, err := DB.Query(
		"SELECT user_id FROM room_users WHERE room_id = $1",
		roomID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []string
	for rows.Next() {
		var userID string
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		members = append(members, userID)
	}
	return members, nil
}
