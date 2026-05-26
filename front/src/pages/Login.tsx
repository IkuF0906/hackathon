import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import "./Login.css";
import Header from "../components/Header";

function Login() {
  const navigate = useNavigate();

  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleLogin = async (): Promise<void> => {
    try {
      setErrorMessage("");

      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mail: mail,
          password: password,
        }),
      });

      const data: {
        token?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ログインに失敗しました");
      }

      if (!data.token) {
        throw new Error("トークンが返されませんでした");
      }

      localStorage.setItem("token", data.token);

      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage("メールアドレスまたはパスワードが正しくありません");
    }
  };

  return (
    <div>
      <Header
        actions={[
          { text: "トップに戻る", to: "/" },
        ]}
      />

      <main className="login-layout">
        <section className="login-panel">
          <div className="login-card-content">
            <div className="login-header">
              <h2 className="login-title">アカウントにログイン</h2>
              <p className="login-description">
                登録済みのメールアドレスとパスワードを入力してください。
              </p>
            </div>

            <div className="login-form">
              <div className="form-group">
                <label className="form-label">メールアドレス</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    className="form-input"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    value={mail}
                    onChange={(event) => setMail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">パスワード</label>
                <div className="input-wrap">
                  <span className="input-icon">●</span>
                  <input
                    className="form-input"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="パスワードを入力"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="login-button" type="submit" onClick={handleLogin}>ログインする</button>
            </div>
            
            {errorMessage && <div className="signup-area signup-error">{errorMessage}</div>}

            <div className="signup-area">
              アカウントをお持ちでない方は
              <Link className="signup-link" to="/register">会員登録</Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Login;