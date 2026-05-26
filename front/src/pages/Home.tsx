import { Link } from "react-router";
import "./Home.css";
import Header from "../components/Header";

function Home() {
  return (
    <div className="page">

      <Header
        actions={[
          { text: "ログアウト", to: "/logout"},
        ]}
      />

      <main className="home-layout">

        <section className="left-column">
          <div className="main-copy">
            <h1>
              今日の<span className="accent">5分</span>を、<br/>
              誰かとの会話に。
            </h1>

            <p className="lead">
              ランダムにマッチした相手と、5分間だけチャットできます。
            </p>
          </div>

          <section className="profile-summary">
            <div className="profile-content">
              <div className="profile-header">
                <div className="avatar">U</div>
                <div>
                  <div className="profile-name">ユーザーさん</div>
                  <div className="profile-mail">example@email.com</div>
                </div>
              </div>

              <div className="tag-list">
                <span className="tag">映画</span>
                <span className="tag">音楽</span>
                <span className="tag">ゲーム</span>
              </div>
            </div>

            <div className="sub-actions">
              <Link className="sub-button" to="/profile">
                プロフィール
              </Link>
              <Link className="sub-button" to="/profile/card">
                カードを見る
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
                  今すぐ<br/>
                  マッチングを<br/>
                  始める
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