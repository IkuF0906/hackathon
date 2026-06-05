import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router";
import Header from "../components/Header";

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

function getInitial(name: string): string {
  if (!name) {
    return "U";
  }

  return name.slice(0, 1).toUpperCase();
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: ApiErrorResponse = await response.json();
    return data.error || "エラーが発生しました";
  } catch {
    return "エラーが発生しました";
  }
}

function Matching() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning] = useState(true);
  const API_BASE_URL = "http://localhost:8080/";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "プロフィールの取得に失敗しました"
        );
      }
    };

    fetchProfile();
  
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (totalSeconds:number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const navigate = useNavigate();
  const [status,setStatus] = useState("マッチング待機中");
  const wsRef = useRef<WebSocket | null>(null);
  const handleCancel = () => {
    if(wsRef.current && wsRef.current.readyState === WebSocket.OPEN){
      wsRef.current.close();
    }
    navigate("/home");
  };

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    if(!access_token){
      alert("access_token: " + access_token); 
      navigate("/auth/login");
      return;
    }

    const  ws = new WebSocket(`ws://localhost:8080/ws/matching?token=${access_token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.status === "waiting"){
        setStatus("マッチング待機中")
      }else if(data.status == "matched"){
        console.log(data);
        navigate(`/room/${data.room_id}`, {
          state: {
            name_1: data.name_1,
            name_2: data.name_2,
          },
        });
      }
    }

    ws.onclose = () => console.log("通信が切断されました")
    ws.onerror = () => console.log("通信エラー")

    return () => {
      if(ws.readyState === WebSocket.OPEN){
        ws.close();
      }
    };
  },[]);

  return (
    <div className="page">
      <Header
        actions={[]}
      />
      <main  className="home-layout">
        <section className="left-column">
          <div className="main-copy">
            <h1>
              今日の<span className="accent">5分</span>を、<br />
              誰かとの会話に。
            </h1>

            <p className="lead">
              ランダムにマッチした相手と、5分間だけチャットできます。
            </p>
          </div>

          <section className="profile-summary">
            {profile&&(
              <div className="profile-content">
                <div className="profile-header">
                  <div className="avatar">{getInitial(profile.name)}</div>
                  <div>
                    <div className="profile-name">{profile.name}</div>
                    <div className="profile-mail">{profile.mail}</div>
                  </div>
                </div>

                <div className="tag-list">
                  {profile.attributes.length > 0 ? (
                    profile.attributes.map((attribute) => (
                      <span className="tag" key={attribute}>
                        {attribute}
                      </span>
                    ))
                  ) : (
                    <span className="info-value">未設定</span>
                  )}
                </div>
              </div>
            )}
          </section>
        </section>

        <section className="right-column">
          <div className="matching-card">
            <div className="matching-content">
              <div className="status-row">
                <div className="status-label">SEARCH...</div>
                <div className="timer-chip">{formatTime(seconds)}</div>
              </div>

              <div className="matching-main">
                <h2 className="matching-title">
                  話し相手を探しています
                </h2>

                <p className="matching-text">
                  マッチング相手が見つかるまでお待ちください。<br/>マッチング後は5分間のチャット画面に移動します。
                </p>
              </div>
              
              <Link onClick = {handleCancel} className="sub-button" to="/home">
                マッチングキャンセル
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Matching;