import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content container animate-fade-in">
        {/* Admin Profile Header Card */}
        <section className="glass-card profile-card">
          <div className="profile-header">
            <div className="avatar-large">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="profile-info">
              <div className="profile-title-row">
                <h2>Welcome, {user?.name}</h2>
                <span className="badge badge-admin">System Administrator</span>
              </div>
              <p className="profile-meta">
                <span>{user?.email}</span>
                <span className="dot-sep">•</span>
                <span>VolunteerNet Governance Control</span>
              </p>
            </div>
          </div>
        </section>

        {/* Admin Stats Overview Grid */}
        <section className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="stat-details">
              <h3>Pending Reviews</h3>
              <p>Campus Event Requests</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="stat-details">
              <h3>Active Accounts</h3>
              <p>Volunteers & Event Hosts</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-details">
              <h3>Verified System</h3>
              <p>Compliance & Safety</p>
            </div>
          </div>
        </section>

        {/* Phase 4 Notice & Event Management Section */}
        <section className="admin-content-section">
          <div className="glass-card notice-card text-center">
            <div className="notice-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>Event Moderation Center</h3>
            <p className="notice-desc">
              Pending event approvals and moderation tools will show up here once Phase 4 is built.
            </p>
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
        }

        .avatar-large {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--admin-accent) 0%, var(--primary) 100%);
          color: white;
          font-size: 1.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
        }

        .profile-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }

        .profile-title-row h2 {
          font-size: 1.75rem;
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

        .icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .icon-purple { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .icon-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }

        .stat-details h3 {
          font-size: 1.25rem;
          margin-bottom: 0.1rem;
        }

        .stat-details p {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .admin-content-section {
          margin-bottom: 2.5rem;
        }

        .notice-card {
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, rgba(21, 29, 46, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
          border: 1px dashed rgba(245, 158, 11, 0.3);
        }

        .notice-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(245, 158, 11, 0.12);
          color: var(--admin-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .notice-card h3 {
          font-size: 1.5rem;
        }

        .notice-desc {
          color: var(--text-muted);
          max-width: 500px;
          font-size: 1rem;
        }

        .logout-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-lg {
          padding: 0.9rem 2rem;
          font-size: 1.05rem;
          border-radius: var(--radius-md);
        }

        .text-center {
          text-align: center;
        }
      `}</style>
    </div>
  );
}