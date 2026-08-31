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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <span className="brand-name">Volunteer<span className="brand-accent">Net</span> <span className="brand-tag">Admin</span></span>
        </Link>

        <nav className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div className="user-pill">
                <span className="user-avatar">{user.name ? user.name[0].toUpperCase() : "A"}</span>
                <span className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Log Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Admin Portal Login</Link>
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
          background: linear-gradient(135deg, var(--admin-accent) 0%, var(--primary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

        .brand-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(245, 158, 11, 0.3);
          margin-left: 0.35rem;
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
          background: var(--admin-accent);
          color: black;
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
          .user-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
