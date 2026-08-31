import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <span className="brand-name">Volunteer<span className="brand-accent">Net</span></span>
        </Link>

        <nav className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/feed" className="nav-link">Event Feed</Link>
              <Link to="/my-events" className="nav-link">My Events</Link>
              <div className="user-pill">
                <span className="user-avatar">{user.name ? user.name[0].toUpperCase() : "U"}</span>
                <span className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </nav>
      </div>

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(9, 13, 22, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          padding: 0.9rem 0;
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .brand-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.03em;
        }

        .brand-accent {
          color: var(--primary);
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .nav-link {
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: var(--text-main);
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.75rem 0.3rem 0.35rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
        }

        .user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .user-name {
          color: var(--text-main);
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .navbar-links {
            gap: 0.75rem;
          }
          .user-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
