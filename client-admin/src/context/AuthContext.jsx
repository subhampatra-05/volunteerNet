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
        const me = res.data.user;
        if (me.role !== "admin") {
          localStorage.removeItem("admin_token");
          return;
        }
        setUser(me);
        socket.connect();
        socket.emit("join", { userId: me._id, role: me.role });
      })
      .catch((err) => {
        // only log out if the token is actually rejected
        if (err.response?.status === 401) {
          localStorage.removeItem("admin_token");
        } else {
          console.error("Session restore failed:", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // inside login():
  const login = (token, userData) => {
    localStorage.setItem("admin_token", token);
    setUser(userData);
    socket.connect();
    socket.emit("join", { userId: userData.id, role: userData.role });
  };

  // inside logout():
  const logout = () => {
    localStorage.removeItem("admin_token");
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
