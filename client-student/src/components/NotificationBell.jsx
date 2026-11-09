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
        setItems(res.data.notifications || []);
        setUnread(res.data.unreadCount || 0);
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

  const handleDeleteOne = async (e, id) => {
    e.stopPropagation();
    const target = items.find((n) => n._id === id);
    setItems((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.read) {
      setUnread((c) => Math.max(0, c - 1));
    }
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      load();
    }
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    setItems([]);
    setUnread(0);
    try {
      await api.delete("/notifications");
    } catch (err) {
      console.error("Failed to clear notifications:", err);
      load();
    }
  };

  return (
    <div ref={wrapRef} className="notif-wrapper">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="notif-bell-btn"
      >
        <img src={bell} alt="Notifications" className="notif-bell-icon" />
        {unread > 0 && (
          <span className="notif-badge">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          {/* Header with Title and Clear All Option */}
          <div className="notif-header">
            <div className="notif-title-group">
              <span className="notif-title">Notifications</span>
              {items.length > 0 && (
                <span className="notif-count-pill">{items.length}</span>
              )}
            </div>
            {items.length > 0 && (
              <button
                type="button"
                className="notif-clear-all-btn"
                onClick={handleClearAll}
                title="Clear all notifications"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Clear all
              </button>
            )}
          </div>

          {/* List of Notifications or Empty State */}
          <div className="notif-list">
            {items.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <p className="notif-empty-title">No notifications yet</p>
                <p className="notif-empty-sub">You're all caught up!</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${n.read ? "read" : "unread"}`}
                >
                  <div className="notif-content">
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Bin / Delete icon button */}
                  <button
                    type="button"
                    className="notif-delete-btn"
                    onClick={(e) => handleDeleteOne(e, n._id)}
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="notif-toast animate-fade-in">
          {toast.message}
        </div>
      )}

      <style>{`
        .notif-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .notif-bell-btn {
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem;
          border-radius: 8px;
          transition: background 0.15s ease;
        }

        .notif-bell-btn:hover {
          background: rgba(23, 37, 84, 0.06);
        }

        .notif-bell-icon {
          width: 1.45rem;
          height: 1.45rem;
          display: block;
        }

        .notif-badge {
          position: absolute;
          top: -2px;
          right: -3px;
          background: #dc2626;
          color: #ffffff;
          border-radius: var(--radius-full);
          font-size: 0.675rem;
          padding: 1px 5px;
          font-weight: 700;
          line-height: 1.2;
          box-shadow: 0 1px 3px rgba(220, 38, 38, 0.4);
        }

        .notif-panel {
          position: absolute;
          right: 0;
          top: 2.35rem;
          width: 330px;
          max-height: 420px;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(23, 37, 84, 0.15);
          z-index: 1000;
          overflow: hidden;
          animation: notifFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes notifFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .notif-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .notif-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #172554;
        }

        .notif-count-pill {
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          background: #eef6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          border-radius: var(--radius-full);
        }

        .notif-clear-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.775rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .notif-clear-all-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .notif-list {
          overflow-y: auto;
          max-height: 350px;
        }

        .notif-item {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-item.unread {
          background: #eef6ff;
        }

        .notif-item.read {
          background: #ffffff;
        }

        .notif-item:hover {
          background: #f8fafc;
        }

        .notif-content {
          flex: 1;
        }

        .notif-message {
          font-size: 0.85rem;
          color: #172554;
          line-height: 1.45;
          word-break: break-word;
        }

        .notif-time {
          color: #94a3b8;
          font-size: 0.725rem;
          margin-top: 3px;
        }

        .notif-delete-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #94a3b8;
          padding: 0.35rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-top: -2px;
          flex-shrink: 0;
        }

        .notif-delete-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .notif-empty {
          padding: 2.25rem 1rem;
          text-align: center;
        }

        .notif-empty-icon {
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .notif-empty-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #172554;
          margin: 0;
        }

        .notif-empty-sub {
          font-size: 0.775rem;
          color: #64748b;
          margin: 0.25rem 0 0;
        }

        .notif-toast {
          position: fixed;
          top: 5rem;
          right: 1.5rem;
          max-width: 360px;
          background: #172554;
          border: 1px solid #3b82f6;
          color: #ffffff;
          padding: 0.85rem 1.15rem;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(23, 37, 84, 0.3);
          font-size: 0.9rem;
          z-index: 2000;
        }
      `}</style>
    </div>
  );
}
