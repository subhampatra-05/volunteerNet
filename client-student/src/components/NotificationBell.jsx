import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import socket from "../socket";
import bell from "../assets/bell.png";

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const wrapRef = useRef(null);

  const load = () =>
    api
      .get("/notifications")
      .then((res) => {
        setItems(res.data.notifications);
        setUnread(res.data.unreadCount);
      })
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  // live notifications: update the list, bump the count, show a toast
  useEffect(() => {
    const onNew = (n) => {
      setItems((prev) => [n, ...prev].slice(0, 20));
      setUnread((c) => c + 1);
      setToast(n);
    };
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, []);

  // toast hides itself after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // close the dropdown when clicking elsewhere
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      try {
        await api.patch("/notifications/read-all");
        setUnread(0);
      } catch {}
    }
    if (!next) {
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.3rem",
          position: "relative",
        }}
      >
        <img src={bell} alt="Notifications" style={{ width: "1.5rem", height: "1.5rem" }} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              background: "#dc2626",
              color: "#fff",
              borderRadius: "999px",
              fontSize: "0.7rem",
              padding: "1px 6px",
              fontWeight: 700,
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "2.2rem",
            width: "320px",
            maxHeight: "380px",
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #e6dfd1",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(23, 37, 84, 0.12)",
            zIndex: 1000,
          }}
        >
          {items.length === 0 ? (
            <p style={{ padding: "1rem", color: "#475569", margin: 0 }}>
              No notifications yet
            </p>
          ) : (
            items.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #f1f5f9",
                  background: n.read ? "#fff" : "#eef6ff",
                  fontSize: "0.875rem",
                  color: "#172554",
                }}
              >
                <div>{n.message}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "2px" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "5rem",
            right: "1.5rem",
            maxWidth: "360px",
            background: "#172554",
            border: "1px solid #3b82f6",
            color: "#fff",
            padding: "0.85rem 1.15rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(23, 37, 84, 0.3)",
            fontSize: "0.9rem",
            zIndex: 2000,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}