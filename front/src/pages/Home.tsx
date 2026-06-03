import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import "./Home.css";
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

function Home() {
  const API_BASE_URL = "http://localhost:8080/";
  const navigate = useNavigate();

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
  }, [navigate]);

  return (
    <div className="page">

      <Header
        actions={[
          { text: "ログアウト", to: "/logout" },
        ]}
      />

      <main className="home-layout">

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

            <div className="sub-actions">
              <Link className="sub-button" to="/profile">
                プロフィール確認・編集
              </Link>
            </div>
          </section>
        </section>

        <section className="right-column">
          <div className="matching-card">
            <div className="matching-content">
              <div className="status-row">
                <div className="status-label">READY TO MATCH</div>
                <div className="timer-chip">05:00</div>
              </div>

              <div className="matching-main">
                <h2 className="matching-title">
                  今すぐ<br />
                  マッチングを始める
                </h2>

                <p className="matching-text">
                  ボタンを押すと、ランダムな相手を探します。
                  マッチング後は5分間のチャット画面に移動します。
                </p>
              </div>

              <Link className="start-button" to="/matching">
                マッチング開始
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Home;