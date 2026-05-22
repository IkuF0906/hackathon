package config

import "os"

var (
	JwtSecret  = os.Getenv("JWT_SECRET")
	DBHost     = os.Getenv("DB_HOST")
	DBUser     = os.Getenv("DB_USER")
	DBPassword = os.Getenv("DB_PASSWORD")
	DBName     = os.Getenv("DB_NAME")
	DBPort     = os.Getenv("DB_PORT")
)
