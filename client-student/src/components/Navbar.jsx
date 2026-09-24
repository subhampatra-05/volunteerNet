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
          <div className="brand-logo-vn">VN</div>
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
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding: 0.85rem 0;
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

        .brand-logo-vn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #16a34a;
          color: #ffffff;
          font-weight: 800;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.02em;
        }

        .brand-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .brand-accent {
          color: #16a34a;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .nav-link {
          color: #475569;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #16a34a;
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.75rem 0.3rem 0.35rem;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
        }

        .user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #16a34a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .user-name {
          color: #0f172a;
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
