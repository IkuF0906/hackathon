import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  return (
    <div className={styles.container}>
      <p className={styles.appName}>朝とも</p>
      <h1 className={styles.title}>なにをしますか？</h1>
      <div className={styles.buttons}>
        <button className={styles.primaryButton} onClick={() => navigate("/match")}>マッチングする</button>
        <button className={styles.secondaryButton} onClick={() => navigate("/mypage")}>プロフィール編集</button>
      </div>
    </div>
  );
}

export default Dashboard