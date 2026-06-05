import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SignUp.module.css'

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const signUp = async () => {
    const response = await fetch("http://localhost:8080/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (data.message) {
      navigate("/login");
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.appName}>朝とも</p>
      <div className={styles.form}>
        <h1 className={styles.title}>アカウント作成</h1>
        <input className={styles.input} type="text" placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={styles.input} type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={styles.input} type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className={styles.button} onClick={signUp}>登録</button>
        <p className={styles.message}>{message}</p>
        <p className={styles.link}>すでにアカウントをお持ちの方は<a onClick={() => navigate("/login")}>ログイン</a></p>
      </div>
    </div>
  );
}

export default SignUp