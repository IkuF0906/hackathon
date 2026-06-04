import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import "./Register.css";
import Header from "../components/Header";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [attributes, setAttributes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleAttributeChange = (attribute: string): void => {
    setAttributes((prevAttributes) => {
      if (prevAttributes.includes(attribute)) {
        return prevAttributes.filter((item) => item !== attribute);
      }

      return [...prevAttributes, attribute];
    });
  };

  const handleRegister = async (): Promise<void> => {
    try {
      setErrorMessage("");

      if (attributes.length === 0) {
        setErrorMessage("属性を1つ以上選択してください。");
        return;
      }
      
      if (!birthday) {
        setErrorMessage("誕生日を入力してください。");
        return;
      }
      
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          mail: mail,
          password: password,
          birthday: birthday,
          attributes: attributes,
        }),
      });

      const data: {
        user_id?: string;
        access_token?: string;
        refresh_token?: string;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ログインに失敗しました");
      }

      if (!data.access_token) {
        throw new Error("トークンが返されませんでした");
      }

      //HTTPCookieに保存するのも検討
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");

      navigate("/home", { replace: true });
    } catch (error) {
      setErrorMessage("会員登録に失敗しました。入力内容を確認してください。");
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
              <h2 className="login-title">会員登録</h2>
              <p className="login-description">
                以下の項目を入力してください。
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

              <div className="form-group">
                <label className="form-label">表示名</label>
                <div className="input-wrap">
                  <span className="input-icon">人</span>
                  <input
                    className="form-input"
                    type="text"
                    id="username"
                    name="username"
                    placeholder="表示名を入力"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">誕生日</label>
                <div className="input-wrap">
                  <span className="input-icon">日</span>
                  <input
                    className="form-input"
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={birthday}
                    onChange={(event) => setBirthday(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="form-label">属性</div>
                <p className="attribute-help">自分に合うものを選択してください。（複数選択可）</p>
              </div>
              <div className="attribute-options">
                <label className="attribute-option">
                  <input
                    type="checkbox"
                    value="勉強中"
                    checked={attributes.includes("勉強中")}
                    onChange={() => handleAttributeChange("勉強中")}
                  />
                  <span className="attribute-chip">
                    <span className="check-mark">✓</span>
                    勉強中
                  </span>
                </label>

                <label className="attribute-option">
                  <input
                    type="checkbox"
                    value="出勤中"
                    checked={attributes.includes("出勤中")}
                    onChange={() => handleAttributeChange("出勤中")}
                  />
                  <span className="attribute-chip">
                    <span className="check-mark">✓</span>
                    出勤中
                  </span>
                </label>

                <label className="attribute-option">
                  <input
                    type="checkbox"
                    value="通学中"
                    checked={attributes.includes("通学中")}
                    onChange={() => handleAttributeChange("通学中")}
                  />
                  <span className="attribute-chip">
                    <span className="check-mark">✓</span>
                    通学中
                  </span>
                </label>

                <label className="attribute-option">
                  <input
                    type="checkbox"
                    value="早起きが苦手"
                    checked={attributes.includes("早起きが苦手")}
                    onChange={() => handleAttributeChange("早起きが苦手")}
                  />
                  <span className="attribute-chip">
                    <span className="check-mark">✓</span>
                    早起きが苦手
                  </span>
                </label>

                <label className="attribute-option">
                  <input
                    type="checkbox"
                    value="眠い"
                    checked={attributes.includes("眠い")}
                    onChange={() => handleAttributeChange("眠い")}
                  />
                  <span className="attribute-chip">
                    <span className="check-mark">✓</span>
                    眠い
                  </span>
                </label>
              </div>

              <button className="login-button" type="submit" onClick={handleRegister}>登録する</button>
            </div>

            {errorMessage && <div className="signup-area signup-error">{errorMessage}</div>}

            <div className="signup-area">
              アカウントをお持ちの方は
              <Link className="signup-link" to="/login">ログイン</Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Register;