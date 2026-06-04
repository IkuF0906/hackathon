import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import "./Room.css";

type ChatMessage = {
  id: number;
  type: "system" | "received" | "sent";
  user_id: string;
  user_name: string;
  content: string;
  time?: string;
};

type WsMessage = {
  type?: string;
  user_id: string;
  user_name: string;
  room_id: string;
  content: string;
  created_at: string;
};

type RoomState = {
  name_1: string;
  name_2: string;
};

const MINUTES_LIMIT = 5;
const INITIAL_TIME_LEFT = MINUTES_LIMIT * 60;
const CLOCK_TOTAL_LENGTH = 264;

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    type: "system",
    user_id: "",
    user_name: "",
    content: "5分間の会話が始まります。",
  },
];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${restSeconds.toString().padStart(2, "0")}`;
}

function getCurrentTimeText(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseUserID(token: string): string {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return String(payload.id);
}

function Room() {
  const navigate = useNavigate();
  const { room_id } = useParams();
  const [userID, setUserID] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME_LEFT);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");

  const chatScrollerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState<string>("");

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      navigate("/auth/login");
      return;
    }

    const id = parseUserID(access_token);
    setUserID(id);

    const ws = new WebSocket(`ws://localhost:8080/ws/rooms/${room_id}?token=${access_token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const data: WsMessage = JSON.parse(e.data);

      if (data.type === "left") {
        setLeaveModalOpen((prev) => {
          if (prev !== "") {
            return prev;
          }
          return "相手ユーザーが退出しました";
        });
        return;
      }

      const messageType = data.user_id === id ? "sent" : "received";
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: messageType,
          user_id: data.user_id,
          user_name: data.user_name,
          content: data.content,
          time: getCurrentTimeText(),
        },
      ]);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          window.clearInterval(timerId);
          setLeaveModalOpen((prev) => {
            if (prev !== "") {
              return prev;
            }
            return "5分経過しました！";
          });
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    chatScrollerRef.current?.scrollIntoView({});
  }, [messages]);

  const handleSend = () => {
    if (wsRef.current && inputText.trim()) {
      wsRef.current.send(inputText);
      setInputText("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleLeave = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setLeaveModalOpen("退出ボタンをクリックしました");
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  const progressRatio = timeLeft / INITIAL_TIME_LEFT;
  const progressOffset = progressRatio * CLOCK_TOTAL_LENGTH;
  const timerText = formatTime(timeLeft);

  // 会話相手の名前を取得
  type ProfileData = {
    user_id: string;
    mail: string;
    name: string;
    birthday: string;
    attributes: string[];
  };
  type ApiErrorResponse = {
    error?: string;
  };
  async function readErrorMessage(response: Response): Promise<string> {
    try {
      const data: ApiErrorResponse = await response.json();
      return data.error || "エラーが発生しました";
    } catch {
      return "エラーが発生しました";
    }
  }
  const API_BASE_URL = "http://localhost:8080/";
  const [profile, setProfile] = useState<ProfileData | null>(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");

      try {
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_BASE_URL}users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          const message = await readErrorMessage(response);
          throw new Error(message);
        }

        const data: ProfileData = await response.json();
        setProfile(data);
      } catch (error) {
        
      }
    };

    fetchProfile();
  }, [navigate]);

  const location = useLocation();
  const state = location.state as RoomState | null;
  const name_1 = state?.name_1;
  const name_2 = state?.name_2;
  let peerName="相手ユーザー"; 

  if(profile&&name_1&&name_2){
    if(profile.name==name_1) peerName=name_2+" さん";
    else peerName=name_1+" さん";
  }

  return (
    <div className="room-page-root">
      <div className="morning-timer-wrap">
        <svg id="morning-clock" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="sunrise-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <circle className="clock-track" cx="50" cy="50" r="42" />
          <circle className="clock-progress" cx="50" cy="50" r="42" style={{ strokeDashoffset: progressOffset }} />
          <circle className="clock-node" cx="50" cy="8" r="1.2" />
          <circle className="clock-node" cx="90" cy="37" r="0.8" />
          <circle className="clock-node" cx="75" cy="79" r="0.8" />
          <circle className="clock-node" cx="25" cy="79" r="0.8" />
          <circle className="clock-node" cx="10" cy="37" r="0.8" />
          <text className="clock-label" x="50" y="15">0</text>
          <text className="clock-label" x="84" y="41">1</text>
          <text className="clock-label" x="71" y="74">2</text>
          <text className="clock-label" x="29" y="74">3</text>
          <text className="clock-label" x="16" y="41">4</text>
        </svg>
      </div>

      <div className="chat-window">
        <header className="chat-header">
          <div className="morning-title">
            <span>{peerName}</span>
          </div>
          <div className={`morning-counter ${timeLeft <= 0 ? "morning-counter-finished" : ""}`}>
            {timerText}
          </div>
          <button className="leave-button" type="button" onClick={handleLeave}>
            退出
          </button>
        </header>

        <main className="chat-scroller">
          {messages.map((message) => {
            if (message.type === "system") {
              return (
                <div key={message.id} className="msg-bubble sys-note">
                  <div className="msg-text">{message.content}</div>
                </div>
              );
            }
            return (
              <div key={message.id} className={`msg-bubble ${message.type}`}>
                {/*message.type === "received" && (
                  <div className="msg-name">{message.user_name}</div>
                )*/}
                <div className="msg-text">{message.content}</div>
                {message.time && <div className="msg-meta">{message.time}</div>}
              </div>
            );
          })}
          <div ref={chatScrollerRef} />
        </main>

        {isMatchModalOpen && (
          <div className="match-modal-overlay">
            <div className="match-modal" role="dialog" aria-modal="true">
              <h2 className="match-modal-title">
                {peerName}とマッチングしました！
              </h2>

              <p className="match-modal-text">
                5分間の会話が始まります。
              </p>

              <button
                className="match-modal-button"
                type="button"
                onClick={() => setIsMatchModalOpen(false)}
              >
                会話を開始する
              </button>
            </div>
          </div>
        )}

        {leaveModalOpen != "" && (
          <div className="match-modal-overlay">
            <div className="match-modal" role="dialog" aria-modal="true">
              <h2 className="match-modal-title">
                {leaveModalOpen}
              </h2>

              <p className="match-modal-text">
                会話が終了しました。
              </p>

              <button
                className="match-modal-button"
                type="button"
                onClick={handleGoHome}
              >
                ホームに戻る
              </button>
            </div>
          </div>
        )}

        <footer className="chat-footer">
          <input
            type="text"
            className="input-box"
            placeholder="メッセージを入力"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="send-trigger" type="button" onClick={handleSend}>
            送信
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Room;