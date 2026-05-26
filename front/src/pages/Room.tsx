import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "./Room.css";

type ChatMessage = {
  id: number;
  type: "system" | "received" | "sent";
  text: string;
  time?: string;
};

const MINUTES_LIMIT = 5;
const INITIAL_TIME_LEFT = MINUTES_LIMIT * 60;
const CLOCK_TOTAL_LENGTH = 264;

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    type: "system",
    text: "5分間のチャットが始まります。",
  },
  {
    id: 2,
    type: "received",
    text: "おはようございます！朝早いですね。これから仕事ですか？",
    time: "07:01",
  },
  {
    id: 3,
    type: "sent",
    text: "おはようございます！そうです、出勤前のコーヒータイムに繋げてみました（笑）",
    time: "07:01",
  },
  {
    id: 4,
    type: "received",
    text: "いいですね！私も同じく出勤準備中です。今日も一日頑張りましょう！",
    time: "07:02",
  },
];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${restSeconds
    .toString()
    .padStart(2, "0")}`;
}

function getCurrentTimeText(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

function Room() {
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME_LEFT);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState<string>("");

  const chatScrollerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 0) {
          window.clearInterval(timerId);
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
    if (!chatScrollerRef.current) {
      return;
    }

    chatScrollerRef.current.scrollTop = chatScrollerRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (): void => {
    const trimmedText = inputText.trim();

    if (!trimmedText) {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now(),
      type: "sent",
      text: trimmedText,
      time: getCurrentTimeText(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleLeave = (): void => {
    navigate("/home");
  };

  const progressRatio = timeLeft / INITIAL_TIME_LEFT;
  const progressOffset = progressRatio * CLOCK_TOTAL_LENGTH;
  const timerText = formatTime(timeLeft);

  return (
    <div className="room-page-root">
      <div className="morning-timer-wrap">
        <svg id="morning-clock" viewBox="0 0 100 100">
          <defs>
            <linearGradient
              id="sunrise-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          <circle className="clock-track" cx="50" cy="50" r="42" />

          <circle
            className="clock-progress"
            cx="50"
            cy="50"
            r="42"
            style={{
              strokeDashoffset: progressOffset,
            }}
          />

          <circle className="clock-node" cx="50" cy="8" r="1.2" />
          <circle className="clock-node" cx="90" cy="37" r="0.8" />
          <circle className="clock-node" cx="75" cy="79" r="0.8" />
          <circle className="clock-node" cx="25" cy="79" r="0.8" />
          <circle className="clock-node" cx="10" cy="37" r="0.8" />

          <text className="clock-label" x="50" y="15">
            MORN.
          </text>
          <text className="clock-label" x="84" y="41">
            1
          </text>
          <text className="clock-label" x="71" y="74">
            2
          </text>
          <text className="clock-label" x="29" y="74">
            3
          </text>
          <text className="clock-label" x="16" y="41">
            4
          </text>
        </svg>
      </div>

      <div className="chat-window">
        <header className="chat-header">
          <div className="morning-title">
            <span>相手ユーザー</span>
          </div>

          <div
            className={`morning-counter ${
              timeLeft <= 0 ? "morning-counter-finished" : ""
            }`}
          >
            {timerText}
          </div>

          <button className="leave-button" type="button" onClick={handleLeave}>
            退出
          </button>
        </header>

        <main className="chat-scroller" ref={chatScrollerRef}>
          {messages.map((message) => {
            if (message.type === "system") {
              return (
                <div key={message.id} className="msg-bubble sys-note">
                  <div className="msg-text">{message.text}</div>
                </div>
              );
            }

            return (
              <div key={message.id} className={`msg-bubble ${message.type}`}>
                <div className="msg-text">{message.text}</div>
                {message.time && <div className="msg-meta">{message.time}</div>}
              </div>
            );
          })}
        </main>

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