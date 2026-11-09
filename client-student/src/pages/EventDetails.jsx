import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const myId = user?._id || user?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeImagePreview, setActiveImagePreview] = useState(null);

  const fetchEvent = () => {
    return api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.event);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Event not found");
      });
  };

  useEffect(() => {
    fetchEvent().finally(() => setLoading(false));
  }, [id]);

  // live participant updates via socket
  useEffect(() => {
    const handleParticipantsUpdated = (data) => {
      if (data.eventId === id) {
        fetchEvent();
      }
    };
    socket.on("event:participants-updated", handleParticipantsUpdated);
    return () => socket.off("event:participants-updated", handleParticipantsUpdated);
  }, [id]);

  const handleJoin = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/events/${id}/join`);
      setEvent(res.data.event);
    } catch (err) {
      alert(err.response?.data?.message || "Could not join event");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/events/${id}/leave`);
      setEvent(res.data.event);
    } catch (err) {
      alert(err.response?.data?.message || "Could not leave event");
    } finally {
      setBusy(false);
    }
  };

  const getEventTimelineStatus = (dateStr) => {
    if (!dateStr) return "upcoming";
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const utcToday = now.toISOString().split("T")[0];

    const evDate = new Date(dateStr);
    if (isNaN(evDate.getTime())) return "upcoming";

    const localEvDate = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, "0")}-${String(evDate.getDate()).padStart(2, "0")}`;
    const utcEvDate = evDate.toISOString().split("T")[0];

    if (localEvDate === localToday || utcEvDate === utcToday) return "ongoing";
    if (localEvDate < localToday && utcEvDate < utcToday) return "completed";
    return "upcoming";
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content container text-center" style={{ padding: "4rem 0" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading event details...</p>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content container animate-fade-in" style={{ padding: "3rem 1rem" }}>
          <div className="glass-card text-center not-found-card">
            <h3>Event Not Found</h3>
            <p style={{ color: "var(--text-muted)", margin: "0.75rem 0 1.5rem" }}>
              {error || "The requested campus event does not exist or may have been removed."}
            </p>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/feed")}>
              ← Return to Event Feed
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isHost = event.hostId?._id === myId || event.hostId === myId;
  const joined = event.participants?.some((p) => (p._id || p) === myId);
  const participantCount = event.participants?.length || 0;
  const isFull = participantCount >= event.capacity;
  const timelineStatus = getEventTimelineStatus(event.date);
  const isEnded = timelineStatus === "completed";
  const spotsLeft = Math.max(0, event.capacity - participantCount);

  // Default fallback poster if missing
  const posterUrl =
    event.posterImage ||
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content container animate-fade-in">
        {/* Top Back Navigation Bar */}
        <div className="back-nav-bar">
          <button
            type="button"
            className="btn btn-secondary back-btn"
            onClick={() => navigate("/feed")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Event Feed
          </button>
        </div>

        {/* Hero Poster Banner */}
        <section
          className="event-hero-banner"
          style={{ backgroundImage: `url(${posterUrl})` }}
        >
          <div className="hero-gradient-overlay">
            <div className="hero-tags">
              <span className="badge badge-skill">{event.category}</span>
              {timelineStatus === "ongoing" && (
                <span className="badge badge-ongoing">● Happening Today</span>
              )}
              {timelineStatus === "completed" && (
                <span className="badge badge-completed">Ended</span>
              )}
            </div>

            <h1 className="hero-title">{event.title}</h1>

            <div className="hero-meta-row">
              {event.hostId?.name && (
                <div className="host-pill">
                  <div className="host-avatar">
                    {event.hostId.name[0].toUpperCase()}
                  </div>
                  <span>Hosted by {event.hostId.name}</span>
                </div>
              )}
              <div className="spots-pill">
                <strong>{participantCount}</strong> / {event.capacity} Volunteers Joined
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout */}
        <div className="details-layout-grid">
          {/* Left Column: Details, Description, Gallery */}
          <div className="details-main-column">
            {/* Description Card */}
            <div className="glass-card details-card">
              <h3 className="section-heading">About This Event</h3>
              <p className="description-text">{event.description}</p>
            </div>

            {/* Additional Images Gallery (Location photos, Past Year events, etc.) */}
            {event.images && event.images.length > 0 && (
              <div className="glass-card details-card">
                <div className="gallery-header">
                  <h3 className="section-heading">
                    Event Photo Highlights & Location
                  </h3>
                  <span className="gallery-count">
                    {event.images.length} {event.images.length === 1 ? "Photo" : "Photos"}
                  </span>
                </div>
                <p className="gallery-subtext">
                  Venue layout, location photos, and memories from previous editions.
                </p>

                <div className="gallery-grid">
                  {event.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="gallery-item"
                      onClick={() => setActiveImagePreview(img)}
                      title="Click to view full image"
                    >
                      <img src={img} alt={`Event highlight ${idx + 1}`} />
                      <div className="gallery-zoom-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          <line x1="11" y1="8" x2="11" y2="14"></line>
                          <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizer Card */}
            {event.hostId && (
              <div className="glass-card details-card organizer-card">
                <h3 className="section-heading">Organizer Information</h3>
                <div className="organizer-flex">
                  <div className="organizer-avatar-lg">
                    {event.hostId.name ? event.hostId.name[0].toUpperCase() : "H"}
                  </div>
                  <div className="organizer-info">
                    <h4>{event.hostId.name}</h4>
                    <p className="organizer-college">{event.hostId.college || "Campus Volunteer"}</p>
                    <p className="organizer-email">{event.hostId.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Join Action Box */}
          <div className="details-sidebar-column">
            <div className="glass-card action-summary-card">
              <h3 className="summary-title">Event Schedule & Logistics</h3>

              <div className="logistics-list">
                <div className="logistic-item">
                  <div className="logistic-icon icon-blue">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                    </svg>
                  </div>
                  <div>
                    <div className="logistic-label">Date</div>
                    <div className="logistic-val">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="logistic-item">
                  <div className="logistic-icon icon-amber">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <div className="logistic-label">Time</div>
                    <div className="logistic-val">{event.time}</div>
                  </div>
                </div>

                <div className="logistic-item">
                  <div className="logistic-icon icon-cyan">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <div className="logistic-label">Location</div>
                    <div className="logistic-val">{event.location}</div>
                  </div>
                </div>

                <div className="logistic-item">
                  <div className="logistic-icon icon-purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <div className="logistic-label">Capacity & Availability</div>
                    <div className="logistic-val">
                      {participantCount} / {event.capacity} Filled ({spotsLeft} spots remaining)
                    </div>
                  </div>
                </div>
              </div>

              {/* Spots Progress Bar */}
              <div className="capacity-progress-wrapper">
                <div
                  className="capacity-progress-bar"
                  style={{
                    width: `${Math.min(100, (participantCount / event.capacity) * 100)}%`,
                  }}
                ></div>
              </div>

              {/* Call to action */}
              <div className="action-button-container">
                {isHost ? (
                  <div className="status-notice host-notice">
                    You are hosting this campus event
                  </div>
                ) : isEnded ? (
                  <div className="status-notice ended-notice">
                    This event has concluded
                  </div>
                ) : joined ? (
                  <button
                    type="button"
                    className="btn leave-btn btn-full btn-lg"
                    disabled={busy}
                    onClick={handleLeave}
                  >
                    {busy ? "Leaving Event..." : "Leave Event"}
                  </button>
                ) : isFull ? (
                  <div className="status-notice full-notice">
                    Event is fully booked
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-full btn-lg"
                    disabled={busy}
                    onClick={handleJoin}
                  >
                    {busy ? "Joining Event..." : "Join as Volunteer"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox / Fullscreen Image Preview */}
        {activeImagePreview && (
          <div
            className="lightbox-backdrop"
            onClick={() => setActiveImagePreview(null)}
          >
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={activeImagePreview} alt="Fullscreen preview" />
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setActiveImagePreview(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .back-nav-bar {
          margin-bottom: 1.5rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        /* Hero Banner */
        .event-hero-banner {
          width: 100%;
          min-height: 320px;
          border-radius: 16px;
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-md);
          margin-bottom: 2rem;
        }

        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.88) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2.5rem 2rem;
          color: #ffffff;
          gap: 1rem;
        }

        .hero-tags {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .hero-title {
          font-size: 2.4rem;
          color: #ffffff;
          margin: 0;
          line-height: 1.25;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .hero-meta-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 0.25rem;
        }

        .host-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          color: #ffffff;
        }

        .host-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .spots-pill {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          color: #ffffff;
        }

        /* Layout Grid */
        .details-layout-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr;
          gap: 2rem;
          align-items: flex-start;
          margin-bottom: 3rem;
        }

        .details-main-column,
        .details-sidebar-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .details-card {
          padding: 2rem;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
        }

        .section-heading {
          font-size: 1.35rem;
          color: #172554;
          margin-bottom: 0.85rem;
        }

        .description-text {
          font-size: 1rem;
          line-height: 1.7;
          color: #334155;
          white-space: pre-wrap;
        }

        /* Gallery */
        .gallery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .gallery-count {
          font-size: 0.8rem;
          font-weight: 700;
          background: #eef6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .gallery-subtext {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 1rem;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 4 / 3;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .gallery-item:hover {
          transform: scale(1.03);
          box-shadow: var(--shadow-md);
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gallery-zoom-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(15, 23, 42, 0.7);
          color: #ffffff;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Organizer */
        .organizer-flex {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-top: 0.5rem;
        }

        .organizer-avatar-lg {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: #172554;
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(23, 37, 84, 0.2);
        }

        .organizer-info h4 {
          font-size: 1.15rem;
          color: #172554;
          margin-bottom: 0.2rem;
        }

        .organizer-college {
          font-size: 0.875rem;
          color: #475569;
          margin: 0;
        }

        .organizer-email {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0.2rem 0 0;
        }

        /* Sidebar Action Summary */
        .action-summary-card {
          padding: 2rem;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
        }

        .summary-title {
          font-size: 1.25rem;
          color: #172554;
          margin-bottom: 1.25rem;
        }

        .logistics-list {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          margin-bottom: 1.5rem;
        }

        .logistic-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .logistic-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logistic-label {
          font-size: 0.775rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .logistic-val {
          font-size: 0.95rem;
          font-weight: 600;
          color: #172554;
          margin-top: 0.15rem;
        }

        .capacity-progress-wrapper {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .capacity-progress-bar {
          height: 100%;
          background: #3b82f6;
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        .status-notice {
          padding: 0.85rem;
          text-align: center;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .host-notice {
          background: #eef6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }

        .ended-notice {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
        }

        .full-notice {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .leave-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #dc2626;
        }

        .leave-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        /* Lightbox */
        .lightbox-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 3000;
        }

        .lightbox-content {
          position: relative;
          max-width: 900px;
          max-height: 85vh;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .lightbox-content img {
          width: 100%;
          height: auto;
          max-height: 85vh;
          object-fit: contain;
          display: block;
        }

        .lightbox-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(15, 23, 42, 0.8);
          color: #ffffff;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
        }

        @media (max-width: 860px) {
          .details-layout-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 1.85rem;
          }
        }
      `}</style>
    </div>
  );
}

