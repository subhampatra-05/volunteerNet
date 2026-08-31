import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/events/my-events")
      .then((res) => setEvents(res.data.events))
      .catch(() => setError("Failed to load your events"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content container animate-fade-in">
        <div className="page-header-flex">
          <div>
            <h2>My Hosted Events</h2>
            <p className="page-subtitle">Track the review status and details of your campus events.</p>
          </div>
          <Link to="/create-event" className="btn btn-primary">
            + Host a New Event
          </Link>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: "3rem 0" }}>
            <div className="spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading your events...</p>
          </div>
        ) : error ? (
          <div className="alert-error text-center" style={{ maxWidth: "500px", margin: "2rem auto" }}>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: "3rem 2rem", margin: "2rem auto", maxWidth: "600px" }}>
            <h3>You haven't hosted any events yet</h3>
            <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1.5rem" }}>Create your first event initiative and invite student volunteers.</p>
            <Link to="/create-event" className="btn btn-primary">
              Host an Event Now
            </Link>
          </div>
        ) : (
          <div className="my-events-grid">
            {events.map((event) => (
              <div key={event._id} className="glass-card my-event-card">
                <div className="my-event-header">
                  <span className="badge badge-skill">{event.category}</span>
                  <span className={`badge badge-${event.status}`}>
                    {event.status}
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

                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>Capacity: {event.participants?.length || 0} / {event.capacity}</span>
                  </div>
                </div>

                {event.status === "rejected" && event.rejectionReason && (
                  <div className="rejection-box">
                    <strong>Rejection Reason:</strong> {event.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .page-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .page-header-flex h2 {
          font-size: 2.25rem;
          margin-bottom: 0.35rem;
        }

        .my-events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .my-event-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .my-event-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .event-title {
          font-size: 1.3rem;
          color: var(--text-main);
        }

        .event-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          flex: 1;
        }

        .event-details {
          border-top: 1px solid var(--border-color);
          padding-top: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rejection-box {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}