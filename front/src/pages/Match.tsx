import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Match.module.css'

function Match() {
  const [status, setStatus] = useState("マッチング中...");
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const cancel = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    navigate("/dashboard");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const ws = new WebSocket(`ws://localhost:8080/match?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.status === "waiting") {
        setStatus("マッチング中...");
      } else if (data.status === "matched") {
        navigate(`/chat/${data.room_id}`);
      }
    };

    ws.onclose = () => console.log("WebSocket切断");
    ws.onerror = (e) => console.log("WebSocketエラー:", e);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <p className={styles.appName}>朝とも</p>
      <div className={styles.spinner}></div>
      <h1 className={styles.title}>{status}</h1>
      <p className={styles.description}>同じジャンルの相手を探しています。<br />しばらくお待ちください。</p>
      <button className={styles.cancelButton} onClick={cancel}>キャンセル</button>
    </div>
  );
}

export default Match