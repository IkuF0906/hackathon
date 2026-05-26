import { Link } from "react-router";
import "./Landing.css";
import Header from "../components/Header";

function Landing() {
  return (
    <div className="landing-page-root">
      <div className="page">
        <Header
          actions={[
            { text: "ログイン", to: "/login", variant: "primary"},
            { text: "会員登録", to: "/register"},
          ]}
        />

        <main className="main-layout">
          <section className="hero">
            <h1>
              5分だけ、<br />
              まだ知らない誰かと
              <br />
              <span className="accent">軽く話す。</span>
            </h1>

            <p className="lead">
              ランダムにマッチした相手と、5分間だけチャットできるアプリです。
              長く続ける必要はありません。朝のすきま時間、移動前、少し気分を変えたいときに、
              短い会話を気軽に始められます。
            </p>

            <div className="cta-row">
              <Link className="primary-button" to="/login">
                ログイン
              </Link>
              <Link className="secondary-button" to="/register">
                会員登録
              </Link>
            </div>

          </section>

          <section className="visual-panel">
            <div className="orbital-card">
              <div className="match-status">
                <div>
                  <div className="status-label">MATCHING PREVIEW</div>
                </div>
                <div className="timer-chip">05:00</div>
              </div>

              <div className="match-visual">
                <div className="big-ring">
                  <div className="center-message">
                    <strong>5</strong>
                    <span>minutes</span>
                  </div>
                </div>

                <div className="user-dot left">A</div>
                <div className="user-dot right">B</div>
              </div>

              <div className="floating-chat">
                <div className="bubble received">
                  おはようございます。少しだけ話しませんか？
                </div>

                <div className="bubble sent">
                  いいですね。5分だけなら気軽に話せそうです。
                </div>
              </div>

              <div className="info-note">
                マッチした相手との会話は5分間。終了後は、また新しい相手とのチャットを始められます。
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Landing;