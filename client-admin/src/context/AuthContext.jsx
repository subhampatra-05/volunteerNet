import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data.user.role !== "admin") {
          localStorage.removeItem("admin_token");
          setUser(null);
        } else {
          setUser(res.data.user);
          socket.connect();
          socket.emit("join", {
            userId: res.data.user.id,
            role: res.data.user.role,
          });
        }
      })
      .catch(() => localStorage.removeItem("admin_token"))
      .finally(() => setLoading(false));
  }, []);

  // inside login():
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    socket.connect();
    socket.emit("join", { userId: userData.id, role: userData.role });
  };

  // inside logout():
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
