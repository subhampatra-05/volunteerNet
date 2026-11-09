import { useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";
import Navbar from "../components/Navbar";

export default function PendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPending = (showLoader = false) => {
    if (showLoader) setLoading(true);
    api
      .get("/events/pending")
      .then((res) => {
        setEvents(res.data.events);
        setError("");
      })
      .catch(() => setError("Failed to load pending events"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending(true);
  }, []);

  useEffect(() => {
    const handleNewSubmission = () => fetchPending();
    socket.on("event:submitted", handleNewSubmission);
    return () => socket.off("event:submitted", handleNewSubmission);
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/events/${id}/approve`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Failed to approve event");
    }
  };

  const handleRejectSubmit = async (id) => {
    try {
      await api.patch(`/events/${id}/reject`, { reason: rejectionReason });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setRejectingId(null);
      setRejectionReason("");
    } catch {
      alert("Failed to reject event");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content container animate-fade-in">
        <div className="page-header">
          <div className="header-meta">
            <h2>Pending Event Approvals</h2>
            <p className="page-subtitle">
              Review student-submitted campus initiatives before they go live on the public feed.
            </p>
          </div>
          <div className="header-badge-pill">
            {events.length} {events.length === 1 ? "Event" : "Events"} Awaiting Review
          </div>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: "3rem 0" }}>
            <div className="spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading pending events...</p>
          </div>
        ) : error ? (
          <div className="alert-error text-center" style={{ maxWidth: "500px", margin: "2rem auto" }}>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card text-center empty-state-card">
            <div className="empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>All Caught Up</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.4rem" }}>
              There are currently no events awaiting administrative review.
            </p>
          </div>
        ) : (
          <div className="pending-grid">
            {events.map((event) => (
              <div key={event._id} className="glass-card pending-card">
                <div className="pending-card-header">
                  <span className="badge badge-skill">{event.category}</span>
                  <span className="capacity-pill">
                    {event.capacity} Capacity
                  </span>
                </div>

                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.description}</p>

                <div className="event-details-box">
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                    </svg>
                    <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                  </div>

                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{event.location}</span>
                  </div>

                  {event.hostId && (
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Host: <strong>{event.hostId.name}</strong> ({event.hostId.email})</span>
                    </div>
                  )}
                </div>

                {rejectingId === event._id ? (
                  <div className="rejection-box animate-fade-in">
                    <label htmlFor={`reject-reason-${event._id}`} className="rejection-label">
                      Rejection Reason (visible to host):
                    </label>
                    <input
                      id={`reject-reason-${event._id}`}
                      className="form-control"
                      placeholder="e.g. Incomplete details, venue conflict, etc."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      autoFocus
                    />
                    <div className="rejection-actions">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectSubmit(event._id)}
                      >
                        Confirm Rejection
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectionReason("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(event._id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Approve & Publish
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm reject-btn"
                      onClick={() => {
                        setRejectingId(event._id);
                        setRejectionReason("");
                      }}
                    >
                      Reject Event
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-meta h2 {
          font-size: 2.25rem;
          color: #172554;
          margin-bottom: 0.35rem;
        }

        .page-subtitle {
          color: #475569;
          font-size: 1.05rem;
        }

        .header-badge-pill {
          padding: 0.45rem 1.15rem;
          background: #eef6ff;
          border: 1px solid #bfdbfe;
          border-radius: var(--radius-full);
          color: #1d4ed8;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .pending-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .pending-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
        }

        .pending-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .capacity-pill {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1d4ed8;
          background: #eef6ff;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid #bfdbfe;
        }

        .event-title {
          font-size: 1.3rem;
          color: #172554;
        }

        .event-desc {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
          flex: 1;
        }

        .event-details-box {
          border-top: 1px solid var(--border-color);
          padding-top: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .reject-btn:hover {
          color: #dc2626;
          border-color: #fecaca;
          background: #fef2f2;
        }

        .rejection-box {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8f5ee;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-top: 0.5rem;
        }

        .rejection-label {
          font-size: 0.825rem;
          font-weight: 600;
          color: #172554;
        }

        .rejection-actions {
          display: flex;
          gap: 0.5rem;
        }

        .empty-state-card {
          padding: 4rem 2rem;
          margin: 2rem auto;
          max-width: 580px;
          background: #ffffff;
        }

        .empty-icon {
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-radius: 50%;
          border-top-color: #172554;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
