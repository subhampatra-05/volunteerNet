import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isProfileActive = location.pathname === "/dashboard";

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to={user ? "/pending-events" : "/"} className="navbar-brand">
          <div className="brand-logo-vn">VN</div>
          <span className="brand-name">Volunteer<span className="brand-accent">Net</span> <span className="brand-tag">Admin</span></span>
        </Link>

        <nav className="navbar-links">
          {user ? (
            <>
              <NavLink
                to="/pending-events"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Pending Events
              </NavLink>

              {/* Clickable Admin Profile Pill */}
              <Link
                to="/dashboard"
                className={`user-pill ${isProfileActive ? "active" : ""}`}
                title="View Admin Profile & Dashboard"
              >
                <span className="user-avatar">{user.name ? user.name[0].toUpperCase() : "A"}</span>
                <span className="user-name">{user.name}</span>
                {isProfileActive && <span className="profile-active-dot" aria-label="Current page: Admin Profile"></span>}
              </Link>

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
          background: rgba(248, 245, 238, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e6dfd1;
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
          background: #172554;
          color: #ffffff;
          font-weight: 800;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.02em;
          box-shadow: 0 2px 5px rgba(23, 37, 84, 0.25);
        }

        .brand-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: #172554;
          letter-spacing: -0.03em;
        }

        .brand-accent {
          color: #3b82f6;
        }

        .brand-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          background: #eef6ff;
          color: #1d4ed8;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid #bfdbfe;
          margin-left: 0.35rem;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.35rem;
        }

        /* Nav links with smooth animated underline */
        .nav-link {
          position: relative;
          color: #475569;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.35rem 0.15rem;
          transition: color 0.22s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2.5px;
          background: #3b82f6;
          border-radius: 999px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease;
        }

        .nav-link:hover {
          color: #172554;
        }

        .nav-link:hover::after {
          transform: scaleX(0.5);
          background: #93c5fd;
        }

        .nav-link.active {
          color: #172554;
          font-weight: 700;
        }

        .nav-link.active::after {
          transform: scaleX(1);
          background: #3b82f6;
        }

        /* Clickable Profile User Pill */
        .user-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.32rem 0.85rem 0.32rem 0.4rem;
          background: #ffffff;
          border: 1px solid #e6dfd1;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .user-pill:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.16);
          transform: translateY(-1px);
        }

        /* Highlighted/Brightened state when active on /dashboard */
        .user-pill.active {
          background: #eff6ff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22), 0 2px 8px rgba(59, 130, 246, 0.12);
        }

        .user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #172554;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .user-pill.active .user-avatar {
          background: #2563eb;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35);
        }

        .user-name {
          color: #172554;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .user-pill.active .user-name {
          color: #1d4ed8;
          font-weight: 700;
        }

        .profile-active-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
          display: inline-block;
          margin-left: -0.1rem;
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
