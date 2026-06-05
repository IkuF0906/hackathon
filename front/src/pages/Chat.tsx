import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Chat.module.css'

type Message = {
  user_id: number;
  user_name: string;
  content: string;
};

function parseUserID(token: string): number {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.id;
}

function Chat() {
  const { room_id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [myID, setMyID] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const exit = () => {
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

    setMyID(parseUserID(token));

    const ws = new WebSocket(`ws://localhost:8080/chat/${room_id}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "left") {
        // 相手が退出したらダッシュボードへ
        alert("相手が退出しました");
        navigate("/dashboard");
        return;
    }
    setMessages((prev) => [...prev, data]);
};

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard"); // /matchから変更
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      ws.close();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (wsRef.current && input.trim()) {
      wsRef.current.send(input);
      setInput("");
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.appName}>朝とも</p>
        <span className={styles.timer}>{formatTime(timeLeft)}</span>
        <button className={styles.exitButton} onClick={exit}>退出</button>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          msg.user_id === myID ? (
            <div key={i} className={styles.messageRight}>
              <span className={styles.userName}>{msg.user_name}</span>
              <div className={styles.bubbleRight}>{msg.content}</div>
            </div>
          ) : (
            <div key={i} className={styles.messageLeft}>
              <span className={styles.userName}>{msg.user_name}</span>
              <div className={styles.bubbleLeft}>{msg.content}</div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className={styles.button} onClick={sendMessage}>送信</button>
      </div>
    </div>
  );
}

export default Chat