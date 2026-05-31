import type { ReactNode } from "react";
import { Navigate } from "react-router";

type RequireAuthProps = {
  children: ReactNode;
};

function RequireAuth({ children }: RequireAuthProps) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default RequireAuth;