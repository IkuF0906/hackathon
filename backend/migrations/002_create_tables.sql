CREATE TABLE matching_queue (
    id         SERIAL PRIMARY KEY,
    user_id    UUID NOT NULL REFERENCES users(id),
    joined_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE room_users (
    id      SERIAL PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES rooms(id),
    user_id UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id    UUID NOT NULL REFERENCES rooms(id),
    user_id    UUID NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cards (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL
);

CREATE TABLE room_cards (
    id          SERIAL PRIMARY KEY,
    room_id     UUID NOT NULL REFERENCES rooms(id),
    sender_id   UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    card_id     UUID NOT NULL REFERENCES cards(id),
    received_at TIMESTAMP DEFAULT NOW()
);