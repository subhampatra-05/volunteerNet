import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "All Categories",
  "Technical",
  "Social Service",
  "Workshop",
  "Cultural",
  "Sports",
  "Other",
];

export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDate, setSelectedDate] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(false);

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

  // Filtered events calculation
  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      // 1. Upcoming only filter
      if (upcomingOnly) {
        const evDate = new Date(event.date);
        evDate.setHours(0, 0, 0, 0);
        if (evDate < today) return false;
      }

      // 2. Search query filter (matches title, description, location, or host name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = event.title?.toLowerCase().includes(q);
        const matchesDesc = event.description?.toLowerCase().includes(q);
        const matchesLoc = event.location?.toLowerCase().includes(q);
        const matchesHost = event.hostId?.name?.toLowerCase().includes(q);
        const matchesCat = event.category?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesHost && !matchesCat) {
          return false;
        }
      }

      // 3. Category filter
      if (selectedCategory && selectedCategory !== "All Categories") {
        if (event.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 4. Date filter (exact day match in local or UTC date)
      if (selectedDate) {
        const evDate = new Date(event.date);
        const year = evDate.getFullYear();
        const month = String(evDate.getMonth() + 1).padStart(2, "0");
        const day = String(evDate.getDate()).padStart(2, "0");
        const localDateStr = `${year}-${month}-${day}`;
        const utcDateStr = evDate.toISOString().split("T")[0];

        if (localDateStr !== selectedDate && utcDateStr !== selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedDate, upcomingOnly]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedDate !== "" ||
    upcomingOnly;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDate("");
    setUpcomingOnly(false);
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
          <p className="page-subtitle">
            Discover active campus events, tech workshops, and volunteer opportunities.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <section className="filter-toolbar glass-card" aria-label="Event search and filters">
          <div className="filter-inputs-grid">
            {/* 1. Search Box */}
            <div className="filter-field search-field">
              <label htmlFor="feed-search" className="filter-label">
                Search Events
              </label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  id="feed-search"
                  type="text"
                  className="form-control filter-input"
                  placeholder="Search by title, location, or host..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-field-btn"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 2. Category Dropdown */}
            <div className="filter-field category-field">
              <label htmlFor="feed-category" className="filter-label">
                Category
              </label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <select
                  id="feed-category"
                  className="form-control filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Date Filter */}
            <div className="filter-field date-field">
              <label htmlFor="feed-date" className="filter-label">
                Filter by Date
              </label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
                <input
                  id="feed-date"
                  type="date"
                  className="form-control filter-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                  <button
                    type="button"
                    className="clear-field-btn"
                    onClick={() => setSelectedDate("")}
                    aria-label="Clear date filter"
                    title="Clear date filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Filter Presets & Active Filters Bar */}
          <div className="filter-footer-bar">
            <div className="filter-stats-group">
              <span className="results-count">
                Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
              </span>
              <button
                type="button"
                className={`quick-toggle-pill ${upcomingOnly ? "active" : ""}`}
                onClick={() => setUpcomingOnly(!upcomingOnly)}
              >
                {upcomingOnly ? "✓ Upcoming Only" : "Upcoming Only"}
              </button>
            </div>

            {hasActiveFilters && (
              <div className="active-chips-wrapper">
                {searchQuery.trim() && (
                  <span className="filter-chip">
                    "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery("")}>
                      ✕
                    </button>
                  </span>
                )}
                {selectedCategory !== "All Categories" && (
                  <span className="filter-chip">
                    {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory("All Categories")}>
                      ✕
                    </button>
                  </span>
                )}
                {selectedDate && (
                  <span className="filter-chip">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString()}
                    <button type="button" onClick={() => setSelectedDate("")}>
                      ✕
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="reset-all-btn"
                  onClick={handleClearFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

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
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Check back later or host your own campus event!
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="glass-card text-center no-results-card">
            <div className="no-results-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </div>
            <h3>No events match your criteria</h3>
            <p className="no-results-text">
              Try tweaking your search keywords, switching categories, or clearing date filters.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
              style={{ marginTop: "1rem" }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="feed-grid">
            {filteredEvents.map((event) => (
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
          margin-bottom: 1.75rem;
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

        /* Filter Toolbar */
        .filter-toolbar {
          margin-bottom: 2rem;
          padding: 1.25rem 1.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .filter-inputs-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1.2fr;
          gap: 1.25rem;
          align-items: flex-end;
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-label {
          font-size: 0.825rem;
          font-weight: 600;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 0.9rem;
          color: #64748b;
          pointer-events: none;
        }

        .filter-input,
        .filter-select {
          padding-left: 2.6rem;
          padding-right: 2.2rem;
          height: 44px;
          font-size: 0.925rem;
        }

        .clear-field-btn {
          position: absolute;
          right: 0.75rem;
          background: #f1f5f9;
          border: none;
          color: #64748b;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.15s ease;
        }

        .clear-field-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Filter Footer */
        .filter-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .filter-stats-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .results-count {
          font-size: 0.875rem;
          color: #475569;
        }

        .results-count strong {
          color: #0f172a;
        }

        .quick-toggle-pill {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-toggle-pill:hover {
          border-color: #16a34a;
          color: #16a34a;
        }

        .quick-toggle-pill.active {
          background: #f0fdf4;
          border-color: #16a34a;
          color: #16a34a;
          font-weight: 700;
        }

        .active-chips-wrapper {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #334155;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid #e2e8f0;
        }

        .filter-chip button {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          margin-left: 0.2rem;
        }

        .filter-chip button:hover {
          color: #dc2626;
        }

        .reset-all-btn {
          background: none;
          border: none;
          color: #16a34a;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0.25rem 0.5rem;
        }

        .reset-all-btn:hover {
          color: #15803d;
        }

        /* Empty State */
        .no-results-card {
          padding: 3.5rem 2rem;
          margin: 1.5rem auto;
          max-width: 580px;
          background: #ffffff;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
        }

        .no-results-icon {
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .no-results-card h3 {
          font-size: 1.35rem;
          color: #0f172a;
          margin-bottom: 0.35rem;
        }

        .no-results-text {
          color: #64748b;
          font-size: 0.95rem;
        }

        /* Feed Grid & Cards */
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

        @media (max-width: 860px) {
          .filter-inputs-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .filter-footer-bar {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
