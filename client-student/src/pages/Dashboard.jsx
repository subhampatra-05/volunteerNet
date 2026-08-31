import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content flex-center">
          <div className="text-center">
            <div className="spinner"></div>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="page-content container">
          <div className="alert-error text-center" style={{ margin: "2rem auto", maxWidth: "500px" }}>
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content container animate-fade-in">
        {/* User Profile Header Card */}
        <section className="glass-card profile-card">
          <div className="profile-header">
            <div className="avatar-large">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="profile-info">
              <h2>Welcome, {user?.name}</h2>
              <p className="profile-meta">
                <span>{user?.email}</span>
                {user?.college && <span className="dot-sep">•</span>}
                {user?.college && <span>{user?.college}</span>}
                {user?.year && <span>({user?.year})</span>}
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div className="skills-container">
            <span className="skills-title">Skills & Expertise:</span>
            <div className="skills-badges">
              {stats.user.skills?.length > 0 ? (
                stats.user.skills.map((skill, i) => (
                  <span key={i} className="badge badge-skill">{skill}</span>
                ))
              ) : (
                <span className="no-skills">No skills added yet</span>
              )}
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
            </div>
            <div className="stat-details">
              <h3>{stats.stats.eventsHostedCount}</h3>
              <p>Events Hosted</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="stat-details">
              <h3>{stats.stats.eventsParticipatedCount}</h3>
              <p>Events Participated</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div className="stat-details">
              <h3>{stats.user.avgRating?.toFixed(1) ?? "N/A"}</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </section>

        {/* Hosted Events & Participated Events Section */}
        <section className="events-overview-grid">
          {stats.eventsHosted.length > 0 && (
            <div className="glass-card event-list-card">
              <h4>Your Hosted Events</h4>
              <ul className="event-list">
                {stats.eventsHosted.map((e) => (
                  <li key={e._id} className="event-item">
                    <span className="event-item-title">{e.title}</span>
                    <span className={`badge badge-${e.status}`}>{e.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stats.eventsParticipated.length > 0 && (
            <div className="glass-card event-list-card">
              <h4>Events You're Participating In</h4>
              <ul className="event-list">
                {stats.eventsParticipated.map((e) => (
                  <li key={e._id} className="event-item">
                    <span className="event-item-title">{e.title}</span>
                    <span className="event-item-date">{new Date(e.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 3 Quick Action Links Section */}
        <section className="action-hub-section">
          <h3 className="section-title">Quick Actions</h3>
          <div className="action-grid">
            <Link to="/feed" className="glass-card glass-card-hover action-card">
              <div className="action-icon icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 11a9 9 0 0 1 9 9"></path>
                  <path d="M4 4a16 16 0 0 1 16 16"></path>
                  <circle cx="5" cy="19" r="1"></circle>
                </svg>
              </div>
              <div className="action-content">
                <h4>View Event Feed</h4>
                <p>Browse active campus events & volunteering opportunities</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

            <Link to="/create-event" className="glass-card glass-card-hover action-card">
              <div className="action-icon icon-cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div className="action-content">
                <h4>Host an Event</h4>
                <p>Publish a new event initiative or student workshop</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

            <Link to="/my-events" className="glass-card glass-card-hover action-card">
              <div className="action-icon icon-emerald">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div className="action-content">
                <h4>My Events</h4>
                <p>Manage your hosted events & view approval status</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* Logout Section at the last */}
        <section className="logout-section text-center">
          <button onClick={logout} className="btn btn-danger btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Log out
          </button>
        </section>
      </main>

      <style>{`
        .profile-card {
          margin-bottom: 2rem;
          padding: 2rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .avatar-large {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: white;
          font-size: 1.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px var(--primary-glow);
        }

        .profile-info h2 {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .profile-meta {
          color: var(--text-muted);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .dot-sep {
          color: var(--text-dim);
        }

        .skills-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
          flex-wrap: wrap;
        }

        .skills-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .skills-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .no-skills {
          font-size: 0.9rem;
          color: var(--text-dim);
          font-style: italic;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-details h3 {
          font-size: 1.6rem;
          margin-bottom: 0.1rem;
        }

        .stat-details p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .events-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .event-list-card h4 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .event-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .event-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .event-item-title {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .event-item-date {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .action-hub-section {
          margin-bottom: 3rem;
        }

        .action-hub-section .section-title {
          font-size: 1.4rem;
          margin-bottom: 1.25rem;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          text-decoration: none;
          color: var(--text-main);
          position: relative;
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .action-content h4 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: var(--text-main);
        }

        .action-content p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .action-arrow {
          font-size: 1.25rem;
          color: var(--text-dim);
          margin-left: auto;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .action-card:hover .action-arrow {
          transform: translateX(4px);
          color: var(--primary);
        }

        .logout-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: var(--primary);
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