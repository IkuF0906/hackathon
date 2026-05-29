import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Matching() {
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
        navigate(`/room/${data.room_id}`)
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
    <div>
      <h1>似ている話し相手を探しています</h1>
      <button onClick = {handleCancel}>マッチングキャンセル</button>
    </div>
  )
}

export default Matching;