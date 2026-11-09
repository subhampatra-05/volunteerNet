import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" (new to old) | "oldest" (old to new)

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

  // Determine timeline status: "ongoing" (today) | "upcoming" (future) | "completed" (earlier)
  const getEventTimelineStatus = (dateStr) => {
    if (!dateStr) return "upcoming";
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const utcToday = now.toISOString().split("T")[0];

    const evDate = new Date(dateStr);
    if (isNaN(evDate.getTime())) return "upcoming";

    const localEvDate = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, "0")}-${String(evDate.getDate()).padStart(2, "0")}`;
    const utcEvDate = evDate.toISOString().split("T")[0];

    // Ongoing: occurs on today's calendar date
    if (localEvDate === localToday || utcEvDate === utcToday) {
      return "ongoing";
    }

    // Completed: ended on an earlier date
    if (localEvDate < localToday && utcEvDate < utcToday) {
      return "completed";
    }

    // Upcoming: scheduled for future date
    return "upcoming";
  };

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    events.forEach((ev) => {
      const s = getEventTimelineStatus(ev.date);
      if (s === "upcoming") upcoming++;
      else if (s === "ongoing") ongoing++;
      else if (s === "completed") completed++;
    });
    return { upcoming, ongoing, completed, all: events.length };
  }, [events]);

  // Filtered events calculation
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 1. Timeline Status Filter: "upcoming" (default) | "ongoing" | "completed" | "all"
      if (statusFilter !== "all") {
        const evStatus = getEventTimelineStatus(event.date);
        if (evStatus !== statusFilter) {
          return false;
        }
      }

      // 2. Search query filter (matches title, description, location, host name, or category)
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
    }).sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date).getTime();
      const timeB = new Date(b.createdAt || b.date).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [events, statusFilter, searchQuery, selectedCategory, selectedDate, sortOrder]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "All Categories" ||
    selectedDate !== "" ||
    statusFilter !== "upcoming" ||
    sortOrder !== "newest";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedDate("");
    setStatusFilter("upcoming");
    setSortOrder("newest");
  };

  const renderAction = (event) => {
    const isHost = event.hostId?._id === myId;
    const joined = event.participants?.some((p) => p === myId);
    const full = (event.participants?.length || 0) >= event.capacity;
    const evStatus = getEventTimelineStatus(event.date);
    const ended = evStatus === "completed";
    const busy = busyId === event._id;

    if (isHost) return <span className="join-badge host-badge">You're Hosting</span>;
    if (ended) return <span className="join-badge ended-badge">Concluded</span>;
    if (joined)
      return (
        <button
          type="button"
          className="btn leave-btn btn-sm"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            handleLeave(event._id);
          }}
        >
          {busy ? "Leaving..." : "Leave"}
        </button>
      );
    if (full) return <span className="join-badge full-badge">Event Full</span>;
    return (
      <button
        type="button"
        className="btn btn-primary btn-sm join-btn-card"
        disabled={busy}
        onClick={(e) => {
          e.stopPropagation();
          handleJoin(event._id);
        }}
      >
        {busy ? "Joining..." : "Join Event"}
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
          {/* Segmented Timeline Status Tabs */}
          <div className="status-tabs-container">
            <div className="status-tabs-group" role="tablist" aria-label="Event timeline filter">
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "upcoming"}
                className={`status-tab ${statusFilter === "upcoming" ? "active" : ""}`}
                onClick={() => setStatusFilter("upcoming")}
              >
                <span className="status-tab-text">Upcoming</span>
                <span className="tab-pill-count">{statusCounts.upcoming}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "ongoing"}
                className={`status-tab ${statusFilter === "ongoing" ? "active" : ""}`}
                onClick={() => setStatusFilter("ongoing")}
              >
                <span className="live-pulse-dot" aria-hidden="true"></span>
                <span className="status-tab-text">Ongoing Today</span>
                <span className="tab-pill-count">{statusCounts.ongoing}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "completed"}
                className={`status-tab ${statusFilter === "completed" ? "active" : ""}`}
                onClick={() => setStatusFilter("completed")}
              >
                <span className="status-tab-text">Completed</span>
                <span className="tab-pill-count">{statusCounts.completed}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === "all"}
                className={`status-tab ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                <span className="status-tab-text">All Events</span>
                <span className="tab-pill-count">{statusCounts.all}</span>
              </button>
            </div>
          </div>

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

          {/* Results Summary, Sort Toggle & Active Filters Bar */}
          <div className="filter-footer-bar">
            <div className="filter-stats-group">
              <span className="results-count">
                Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
                {statusFilter === "upcoming" && <span className="status-label-sub"> • Upcoming (Joinable)</span>}
                {statusFilter === "ongoing" && <span className="status-label-sub"> • Happening Today</span>}
                {statusFilter === "completed" && <span className="status-label-sub"> • Past Events</span>}
                {statusFilter === "all" && <span className="status-label-sub"> • All Timelines</span>}
              </span>

              {/* Sort Order Toggle with Arrow */}
              <button
                type="button"
                className="sort-toggle-btn"
                onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
                title={
                  sortOrder === "newest"
                    ? "Currently showing New to Old (recently hosted first). Click to switch to Old to New."
                    : "Currently showing Old to New. Click to switch to New to Old."
                }
                aria-label="Toggle event order"
              >
                <span className="sort-btn-text">
                  {sortOrder === "newest" ? "Newest to Oldest" : "Oldest to Newest"}
                </span>
                <span className={`sort-arrow-icon ${sortOrder === "oldest" ? "ascending" : "descending"}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </span>
              </button>
            </div>

            {hasActiveFilters && (
              <div className="active-chips-wrapper">
                {sortOrder !== "newest" && (
                  <span className="filter-chip">
                    Order: Oldest First
                    <button
                      type="button"
                      onClick={() => setSortOrder("newest")}
                      aria-label="Reset order to newest"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {statusFilter !== "upcoming" && (
                  <span className="filter-chip">
                    Timeline: {statusFilter === "ongoing" ? "Ongoing Today" : statusFilter === "completed" ? "Completed" : "All Events"}
                    <button
                      type="button"
                      onClick={() => setStatusFilter("upcoming")}
                      aria-label="Reset timeline to upcoming"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="filter-chip">
                    "{searchQuery}"
                    <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">
                      ✕
                    </button>
                  </span>
                )}
                {selectedCategory !== "All Categories" && (
                  <span className="filter-chip">
                    {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory("All Categories")} aria-label="Clear category">
                      ✕
                    </button>
                  </span>
                )}
                {selectedDate && (
                  <span className="filter-chip">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString()}
                    <button type="button" onClick={() => setSelectedDate("")} aria-label="Clear date">
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
            <h3>
              {statusFilter === "ongoing"
                ? "No ongoing events today"
                : statusFilter === "upcoming"
                ? "No upcoming events found"
                : statusFilter === "completed"
                ? "No completed events found"
                : "No events match your criteria"}
            </h3>
            <p className="no-results-text">
              {statusFilter === "ongoing"
                ? "There are no campus events scheduled on today's date. Switch to Upcoming to see joinable events scheduled for later!"
                : "Try tweaking your search keywords, switching categories, or clearing filters."}
            </p>
            <div className="no-results-actions">
              {statusFilter !== "upcoming" && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setStatusFilter("upcoming")}
                >
                  View Upcoming Events
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="feed-grid">
            {filteredEvents.map((event) => {
              const evTimeline = getEventTimelineStatus(event.date);
              const posterBg =
                event.posterImage ||
                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";

              return (
                <div
                  key={event._id}
                  className="feed-card"
                  style={{ backgroundImage: `url(${posterBg})` }}
                  onClick={() => navigate(`/events/${event._id}`)}
                  title="Click to view full event details, location, and photos"
                >
                  <div className="feed-card-scrim"></div>

                  {/* Card Top: Type & Timeline Status */}
                  <div className="feed-card-header">
                    <div className="card-badge-group">
                      <span className="badge badge-skill">{event.category}</span>
                      {evTimeline === "ongoing" && (
                        <span className="badge badge-ongoing">
                          <span className="live-dot-sm"></span> Ongoing Today
                        </span>
                      )}
                      {evTimeline === "completed" && (
                        <span className="badge badge-completed">Ended</span>
                      )}
                    </div>
                  </div>

                  {/* Card Center: Event Name (Title) & View Details Hint */}
                  <div className="feed-card-body">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="view-details-hint">
                      View details & photos →
                    </div>
                  </div>

                  {/* Card Bottom: Volunteers Joined & Join Button */}
                  <div className="feed-card-footer">
                    <div className="volunteers-stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>
                        <strong>{event.participants?.length || 0}</strong> / {event.capacity} Volunteers
                      </span>
                    </div>

                    <div
                      className="card-action-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderAction(event)}
                    </div>
                  </div>
                </div>
              );
            })}
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
          color: #172554;
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
          border: 1px solid var(--border-color);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
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
          color: #172554;
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

        /* Status Tabs */
        .status-tabs-container {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-bottom: 1.15rem;
          border-bottom: 1px solid #f1f5f9;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .status-tabs-group {
          display: inline-flex;
          align-items: center;
          background: #f1f5f9;
          padding: 0.3rem;
          border-radius: var(--radius-full);
          gap: 0.25rem;
        }

        .status-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1.05rem;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .status-tab:hover {
          color: #172554;
          background: rgba(255, 255, 255, 0.75);
        }

        .status-tab.active {
          background: #172554;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(23, 37, 84, 0.22);
        }

        .tab-pill-count {
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          background: #e2e8f0;
          color: #475569;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .status-tab.active .tab-pill-count {
          background: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
          animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
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
          flex-wrap: wrap;
        }

        .sort-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #172554;
          padding: 0.32rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sort-toggle-btn:hover {
          background: #eef6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
        }

        .sort-btn-text {
          font-size: 0.8rem;
        }

        .sort-arrow-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sort-arrow-icon.ascending {
          transform: rotate(180deg);
        }

        .sort-arrow-icon.descending {
          transform: rotate(0deg);
        }

        .results-count {
          font-size: 0.875rem;
          color: #475569;
        }

        .results-count strong {
          color: #0f172a;
        }

        .status-label-sub {
          color: #3b82f6;
          font-weight: 600;
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
          background: #eef6ff;
          color: #172554;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          border: 1px solid #bfdbfe;
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
          color: #2563eb;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0.25rem 0.5rem;
        }

        .reset-all-btn:hover {
          color: #1d4ed8;
        }

        /* Empty State */
        .no-results-card {
          padding: 3.5rem 2rem;
          margin: 1.5rem auto;
          max-width: 580px;
          background: #ffffff;
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .no-results-icon {
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        .no-results-card h3 {
          font-size: 1.35rem;
          color: #172554;
          margin-bottom: 0.35rem;
        }

        .no-results-text {
          color: #64748b;
          font-size: 0.95rem;
        }

        .no-results-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.25rem;
          flex-wrap: wrap;
        }

        /* Feed Grid & Cards */
        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .feed-card {
          position: relative;
          min-height: 290px;
          border-radius: 16px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(23, 37, 84, 0.12);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
          cursor: pointer;
        }

        .feed-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 32px rgba(23, 37, 84, 0.24);
        }

        .feed-card-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.45) 0%,
            rgba(15, 23, 42, 0.35) 40%,
            rgba(15, 23, 42, 0.92) 100%
          );
          z-index: 1;
          transition: background 0.25s ease;
        }

        .feed-card:hover .feed-card-scrim {
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.35) 0%,
            rgba(15, 23, 42, 0.3) 35%,
            rgba(15, 23, 42, 0.95) 100%
          );
        }

        .feed-card > *:not(.feed-card-scrim) {
          position: relative;
          z-index: 2;
        }

        .feed-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-badge-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .badge-ongoing {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          font-size: 0.775rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .live-dot-sm {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
        }

        .badge-completed {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #cbd5e1;
          font-size: 0.775rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .feed-card-body {
          margin: auto 0 1.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .event-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .view-details-hint {
          font-size: 0.775rem;
          color: #93c5fd;
          font-weight: 600;
          opacity: 0.9;
          transition: transform 0.15s ease;
        }

        .feed-card:hover .view-details-hint {
          transform: translateX(4px);
          color: #bfdbfe;
        }

        .feed-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .volunteers-stat {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: #f1f5f9;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        .volunteers-stat strong {
          color: #ffffff;
          font-weight: 700;
        }

        .join-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .host-badge {
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid #3b82f6;
          color: #ffffff;
        }

        .ended-badge {
          background: rgba(148, 163, 184, 0.3);
          border: 1px solid #94a3b8;
          color: #e2e8f0;
        }

        .full-badge {
          background: rgba(239, 68, 68, 0.3);
          border: 1px solid #ef4444;
          color: #ffffff;
        }

        .leave-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #cbd5e1;
          color: #dc2626;
          font-weight: 600;
        }

        .leave-btn:hover {
          background: #ffffff;
          border-color: #f87171;
        }

        .join-btn-card {
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
