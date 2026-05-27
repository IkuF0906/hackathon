-- Active: 1779035263776@@127.0.0.1@5432@asatomo
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR(255) NOT NULL,
    mail      VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    birthday  DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attributes (
    id        SERIAL PRIMARY KEY,
    user_id   UUID NOT NULL REFERENCES users(id),
    attribute VARCHAR(255) NOT NULL
);

CREATE TABLE refresh_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id),
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);