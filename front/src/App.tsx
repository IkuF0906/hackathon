import { useState } from 'react'
import './styles/reset.css'
import './styles/common.css'
import { Routes, Route, Navigate } from "react-router";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Matching from "./pages/Matching";
import Room from "./pages/Room";
import RoomCard from "./pages/RoomCard";
import Card from "./pages/Card";
import ProfileCard from "./pages/ProfileCard";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Routes>
      {/* 未ログインユーザー向けトップページ */}
      <Route path="/" element={<Landing />} />

      {/* 認証前に使うページ */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      {/* ログイン後に使うページ */}
      {/* 動作確認のためRequireAuth解除中 */}
      <Route
        path="/home"
        element={
          // <RequireAuth>
            <Home />
          // </RequireAuth>
        }
      />

      <Route
        path="/profile"
        element={
          // <RequireAuth>
            <Profile />
          // </RequireAuth>
        }
      />

      <Route
        path="/matching"
        element={
          // <RequireAuth>
            <Matching />
          // </RequireAuth>
        }
      />

      <Route
        path="/room"
        element={
          // <RequireAuth>
            <Room />
          // </RequireAuth>
        }
      />

      <Route
        path="/room/card"
        element={
          // <RequireAuth>
            <RoomCard />
          // </RequireAuth>
        }
      />

      <Route
        path="/card"
        element={
          // <RequireAuth>
            <Card />
          // </RequireAuth>
        }
      />

      <Route
        path="/profile/card"
        element={
          // <RequireAuth>
            <ProfileCard />
          // </RequireAuth>
        }
      />

      {/* 存在しないURLはトップページへ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
