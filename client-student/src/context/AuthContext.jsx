import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        socket.connect();
        socket.emit("join", { userId: res.data.user._id, role: res.data.user.role });
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
    
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    socket.connect();
    socket.emit("join", { userId: userData.id, role: userData.role });
  };

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
