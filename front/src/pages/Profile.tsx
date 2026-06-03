import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Header from "../components/Header";
import "./Profile.css";

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

const API_BASE_URL = "http://localhost:8080/";
const ATTRIBUTE_OPTIONS = ["勉強中", "出勤中", "通学中", "早起きが苦手", "眠い"];

function getBirthdayForDateInput(birthday: string): string {
  if (!birthday) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return birthday;
  }

  return birthday.slice(0, 10);
}

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

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [name, setName] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [attributes, setAttributes] = useState<string[]>([]);
  const [birthday, setBirthday] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const fetchProfile = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("access_token");

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
      setName(data.name ?? "");
      setMail(data.mail ?? "");
      setBirthday(getBirthdayForDateInput(data.birthday ?? ""));
      setAttributes(data.attributes);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "プロフィールの取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAttributeChange = (attribute: string): void => {
    setAttributes((currentAttributes) => {
      if (currentAttributes.includes(attribute)) {
        return currentAttributes.filter((item) => item !== attribute);
      }

      return [...currentAttributes, attribute];
    });
  };

  const handleSave = async (): Promise<void> => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const profileResponse = await fetch(`${API_BASE_URL}users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          mail,
          birthday,
        }),
      });

      if (profileResponse.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
        return;
      }

      if (!profileResponse.ok) {
        const message = await readErrorMessage(profileResponse);
        throw new Error(message);
      }

      const attributesResponse = await fetch(
        `${API_BASE_URL}users/me/attributes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            attributes,
          }),
        }
      );

      if (attributesResponse.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
        return;
      }

      if (!attributesResponse.ok) {
        const message = await readErrorMessage(attributesResponse);
        throw new Error(message);
      }

      await fetchProfile();

      setSuccessMessage("プロフィールを保存しました。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "プロフィールの保存に失敗しました"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <Header
          actions={[
            { text: "ホーム", to: "/home" },
            { text: "ログアウト", to: "/logout" },
          ]}
        />

        <main className="profile-layout">
          <p>プロフィールを読み込み中です...</p>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page">
        <Header
          actions={[
            { text: "ホーム", to: "/home" },
            { text: "ログアウト", to: "/logout" },
          ]}
        />

        <main className="profile-layout">
          <p>{errorMessage || "プロフィールを取得できませんでした。"}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header
        actions={[
          { text: "ホーム", to: "/home" },
          { text: "ログアウト", to: "/logout" },
        ]}
      />

      <main className="profile-layout">
        <section className="profile-preview">
          <div className="preview-content">
            <div className="avatar-area">
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
        </section>

        <section className="edit-panel">
          <div className="edit-content">
            <div className="edit-header">
              <h2 className="edit-title">プロフィール編集</h2>
              <p className="edit-description">
                名前と属性を編集できます。
              </p>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label className="form-label" htmlFor="mail">
                  メールアドレス（変更不可）
                </label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input
                    className="form-input"
                    type="email"
                    id="mail"
                    name="mail"
                    value={mail}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    名前
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">人</span>
                    <input
                      className="form-input"
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="birthday">
                    誕生日（変更不可）
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon">日</span>
                    <input
                      className="form-input"
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={birthday}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="attribute-group">
                <div>
                  <div className="form-label">属性</div>
                  <p className="attribute-help">
                    自分に合うものを複数選択できます。
                  </p>
                </div>

                <div className="attribute-options">
                  {ATTRIBUTE_OPTIONS.map((attribute) => (
                    <label className="attribute-option" key={attribute}>
                      <input
                        type="checkbox"
                        name="attributes[]"
                        value={attribute}
                        checked={attributes.includes(attribute)}
                        onChange={() => handleAttributeChange(attribute)}
                      />
                      <span className="attribute-chip">
                        <span className="check-mark">✓</span>
                        {attribute}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {errorMessage && <p className="form-error">{errorMessage}</p>}

              {successMessage && (
                <p className="form-success">{successMessage}</p>
              )}

              <div className="form-actions">
                <button
                  className="save-button"
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "保存中..." : "保存する"}
                </button>

                <Link className="cancel-link" to="/home">
                  ホームに戻る
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;