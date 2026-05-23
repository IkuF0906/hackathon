package repository

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq" //PostgreSQLのドライバ
)

var DB *sql.DB

func InitDB() error {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	var err error
	DB, err = sql.Open("postgres", dsn) // DB接続の準備
	if err != nil {
		return err
	}

	err = DB.Ping() //接続可能か確認
	if err != nil {
		return err
	}

	return nil
}
