import { useEffect } from "react";
import { useNavigate } from "react-router";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  }, [navigate]);

  return <div>ログアウト中...</div>;
}

export default Logout;