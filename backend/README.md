**バックエンド**
```bash
cd backend/cmd/server
go run main.go
```

### 環境変数

`backend/config/.env` を作成してください：
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=asatomo

## バックエンドのフォルダ構造
backend/
├── cmd/server/      # エントリーポイント
├── internal/
│   ├── handler/     # HTTPハンドラ（APIの実装）
│   ├── middleware/  # JWT認証
│   ├── model/       # 構造体定義
│   └── repository/  # DB操作
├── config/          # 環境変数
├── migrations/      # DBのテーブル定義
└── pkg/utils/       # 共通処理（トークン生成など）

## API一覧

| メソッド | URL | 説明 | 認証 |
|---|---|---|---|
| POST | /auth/register | ユーザー登録 | 不要 |
| POST | /auth/login | ログイン | 不要 |
| POST | /auth/logout | ログアウト | 不要 |
| GET | /users/me | プロフィール取得 | 必要 |
| PUT | /users/me | プロフィール更新 | 必要 |
| PUT | /users/me/attributes | 属性更新 | 必要 |
| POST | /matching/join | マッチング参加 | 必要 |
| DELETE | /matching/join | マッチングキャンセル | 必要 |
| GET | /rooms/:room_id | ルーム情報取得 | 必要 |
| GET | /rooms/:room_id/messages | メッセージ履歴取得 | 必要 |
| POST | /rooms/:room_id/messages | メッセージ送信 | 必要 |
| GET | /cards | カード一覧取得 | 必要 |
| POST | /cards | カード作成 | 必要 |
| PUT | /cards/:card_id | カード編集 | 必要 |
| DELETE | /cards/:card_id | カード削除 | 必要 |
| POST | /rooms/:room_id/card | カード送信 | 必要 |
| GET | /rooms/:room_id/card | もらったカード取得 | 必要 |
| GET | /users/me/received-cards | カードコレクション | 必要 |
| WS | /ws/matching | マッチング通知 | 必要 |
| WS | /ws/rooms/:room_id | チャットリアルタイム通信 | 必要 |