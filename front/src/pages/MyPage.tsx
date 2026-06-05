import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MyPage.module.css'

type Profile = {
  name: string;
  email: string;
  birthday: string | null;
  genre: string | null;
};

function MyPage() {
  const [message, setMessage] = useState("");
  const [birthday, setBirthday] = useState("");
  const [genre, setGenre] = useState("");
  const genres = ["音楽", "映画", "スポーツ", "ゲーム", "アニメ", "料理", "旅行", "読書", "ファッション", "テクノロジー"];
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    const response = await fetch("http://localhost:8080/profile", {
      headers: { "Authorization": token },
    });
    const data = await response.json();
    setProfile(data);
    if (data.birthday) setBirthday(data.birthday.slice(0, 10));
    if (data.genre) setGenre(data.genre);
  };

  const updateProfile = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8080/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token || "",
      },
      body: JSON.stringify({ birthday, genre }),
    });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (data.message) fetchProfile(token || "");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <div className={styles.header}>
          <h1 className={styles.title}>マイページ</h1>
          <button className={styles.logout} onClick={logout}>ログアウト</button>
        </div>

        {profile && (
          <div className={styles.info}>
            <p className={styles.infoItem}><span className={styles.label}>名前</span>{profile.name}</p>
            <p className={styles.infoItem}><span className={styles.label}>メール</span>{profile.email}</p>
            <p className={styles.infoItem}><span className={styles.label}>生年月日</span>{profile.birthday ? profile.birthday.slice(0, 10) : "未設定"}</p>
            <p className={styles.infoItem}><span className={styles.label}>ジャンル</span>{profile.genre || "未設定"}</p>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>生年月日</label>
          <input className={styles.input} type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>興味のあるジャンル</label>
          <select
            className={styles.input}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="">選択してください</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button className={styles.button} onClick={updateProfile}>保存</button>
        <button className={styles.secondaryButton} onClick={() => navigate("/match")}>マッチングする</button>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

export default MyPage