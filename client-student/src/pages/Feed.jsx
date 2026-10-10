import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const { user } = useAuth();
  // /auth/me returns _id, login/signup return id
  const myId = user?._id || user?.id;

  const fetchEvents = () =>
    api.get("/events").then((res) => setEvents(res.data.events));

  useEffect(() => {
    fetchEvents()
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  // feed auto refresh when a new event goes live
  useEffect(() => {
    const handleNewLive = () => fetchEvents();
    socket.on("event:new-live", handleNewLive);
    return () => socket.off("event:new-live", handleNewLive);
  }, []);

  // live spot counts when anyone joins or leaves
  useEffect(() => {
    const handleParticipantsUpdated = () => fetchEvents();
    socket.on("event:participants-updated", handleParticipantsUpdated);
    return () =>
      socket.off("event:participants-updated", handleParticipantsUpdated);
  }, []);

  const updateParticipants = (eventId, participants) => {
    // merge only participants, since the response doesn't include the populated host
    setEvents((prev) =>
      prev.map((e) => (e._id === eventId ? { ...e, participants } : e))
    );
  };

  const handleJoin = async (eventId) => {
    setBusyId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/join`);
      updateParticipants(eventId, res.data.event.participants);
    } catch (err) {
      alert(err.response?.data?.message || "Could not join event");
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async (eventId) => {
    setBusyId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/leave`);
      updateParticipants(eventId, res.data.event.participants);
    } catch (err) {
      alert(err.response?.data?.message || "Could not leave event");
    } finally {
      setBusyId(null);
    }
  };

  const renderAction = (event) => {
    const isHost = event.hostId?._id === myId;
    const joined = event.participants?.some((p) => p === myId);
    const full = (event.participants?.length || 0) >= event.capacity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ended = new Date(event.date) < today;
    const busy = busyId === event._id;

    if (isHost) return <p className="join-note">You're hosting this event</p>;
    if (ended) return <p className="join-note">This event has ended</p>;
    if (joined)
      return (
        <button
          className="btn leave-btn"
          disabled={busy}
          onClick={() => handleLeave(event._id)}
        >
          {busy ? "Leaving..." : "Leave event"}
        </button>
      );
    if (full) return <p className="join-note">Event is full</p>;
    return (
      <button
        className="btn btn-primary"
        disabled={busy}
        onClick={() => handleJoin(event._id)}
      >
        {busy ? "Joining..." : "Join event"}
      </button>
    );
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content container animate-fade-in">
        <div className="page-header text-center">
          <h2>Campus Event Feed</h2>
          <p className="page-subtitle">Discover active campus events, tech workshops, and volunteer opportunities.</p>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: "3rem 0" }}>
            <div className="spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading events...</p>
          </div>
        ) : error ? (
          <div className="alert-error text-center" style={{ maxWidth: "500px", margin: "2rem auto" }}>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: "3rem 2rem", margin: "2rem auto", maxWidth: "600px" }}>
            <h3>No events yet</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Check back later or host your own campus event!</p>
          </div>
        ) : (
          <div className="feed-grid">
            {events.map((event) => (
              <div key={event._id} className="glass-card glass-card-hover feed-card">
                <div className="feed-card-header">
                  <span className="badge badge-skill">{event.category}</span>
                  <span className="capacity-badge">
                    {event.participants?.length || 0} / {event.capacity} Spots
                  </span>
                </div>

                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.description}</p>

                <div className="event-details">
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

                  {event.hostId?.name && (
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Hosted by: {event.hostId.name}</span>
                    </div>
                  )}
                </div>

                {renderAction(event)}
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .page-header {
          margin-bottom: 2.5rem;
        }

        .page-header h2 {
          font-size: 2.25rem;
          margin-bottom: 0.35rem;
          color: #0f172a;
        }

        .page-subtitle {
          color: #475569;
          font-size: 1.05rem;
        }

        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .feed-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.75rem;
        }

        .feed-card:hover {
          border-color: #16a34a;
        }

        .feed-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .capacity-badge {
          font-size: 0.8rem;
          font-weight: 600;
          color: #16a34a;
          background: #f0fdf4;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid #bbf7d0;
        }

        .event-title {
          font-size: 1.3rem;
          color: #0f172a;
        }

        .event-desc {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
          flex: 1;
        }

        .event-details {
          border-top: 1px solid #e2e8f0;
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

        .join-note {
          font-size: 0.875rem;
          color: #475569;
          margin-top: 0.25rem;
        }

        .leave-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-radius: 50%;
          border-top-color: #16a34a;
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