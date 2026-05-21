package main

import (
	"database/sql"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
)

var db *sql.DB //sqlへの接続を管理する奴
var jwtSecret = os.Getenv("JWT_SECRET")

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Mail     string `json:"mail"`
	Password string `json:"password"`
	Birthday string `json:"birthday"`
}

type Attribute struct {
	Attribute string
	UserID    int
}

type Card struct {
	CardID int
	UserID int
}

func getProfile(c *gin.Context) { //プロフィール取得
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(401, gin.H{"error": "認証エラー"}) //headerが空の場合には返す
		return
	}
	tokenString := strings.TrimPrefix(authHeader, "Bearer ") //Bearerがついている場合に取り除く

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	}) //jwt.Tokenとerrorがそれぞれ引数で、その2つを返り値としてTokenとerrorに返す.それをParseで処理してtokenとerrに返す
	if err != nil || !token.Valid { //エラーが存在するか、トークンが偽造されている場合にエラーではじく
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証エラー"})
		return
	}
	claims := token.Claims.(jwt.MapClaims) //JWTのtokenからmap形式で値を取り出す
	userID := int(claims["id"].(float64))  //claimsのidから値を取り出す。デフォでfloat64型なので取り出したのちにintに変える

	var user User
	err = db.QueryRow("SELECT name,mail,birthday FROM users WHERE id = $1", userID).
		Scan(&user.Name, &user.Mail, &user.Birthday) //QueryRowは1行だけ取ってくるコマンド、errはエラーを格納する変数
	if err != nil { //エラーが起きている場合にエラーを返す
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}) //errのエラー内容を取り出して返す
		return
	}
	c.JSON(http.StatusOK, user) //userの内容をレスポンスとして返す
}

func signUp() { //登録

}

func login() { //ログイン

}

func logout() { //ログアウト

}

func updateProfile() { //プロフィール更新

}

func updateAttributes() { //属性更新

}

func matchingHandler() { //マッチング処理

}

func messageHandler() { //メッセージ処理

}

func cardHandler() { //カード処理

}

func deleteCard() { //カード削除

}

func main() {

}
