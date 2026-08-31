import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-badge animate-fade-in">
              <span className="badge-dot"></span>
              <span>Administrator Portal</span>
            </div>

            <h1 className="hero-title animate-fade-in">
              Campus Event Governance & <br />
              <span className="hero-gradient-text">Volunteer Moderation</span>
            </h1>

            <p className="hero-subtitle animate-fade-in">
              VolunteerNet Admin gives campus administrators full control to review event requests, 
              verify volunteer participation standards, moderate community activities, and oversee platform growth.
            </p>

            <div className="hero-actions animate-fade-in">
              <Link to="/login" className="btn btn-primary btn-lg">
                Log In to Admin Portal
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="section-title">Admin Management Capabilities</h2>
              <p className="section-subtitle">Streamlined tools for campus governance and event oversight.</p>
            </div>

            <div className="features-grid">
              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-amber">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                </div>
                <h3>Event Approvals</h3>
                <p>Inspect pending event submissions from students and campus hosts. Approve valid workshops or provide structured rejection reasons.</p>
              </div>

              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3>Community Moderation</h3>
                <p>Ensure safety and compliance across all registered volunteer activities, college profiles, and rating feedback systems.</p>
              </div>

              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-cyan">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3>Analytics & Reports</h3>
                <p>Track student participation trends, host activity, and overall engagement across colleges in real time.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container text-center">
          <p>© {new Date().getFullYear()} VolunteerNet Admin Portal — Campus Governance System.</p>
        </div>
      </footer>

      <style>{`
        .hero-section {
          padding: 4rem 0 3.5rem;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          color: #fbbf24;
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }

        .hero-title {
          font-size: 3.25rem;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          font-weight: 800;
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #fbbf24 0%, #c084fc 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          max-width: 680px;
          margin: 0 auto 2.25rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .btn-lg {
          padding: 0.9rem 2rem;
          font-size: 1.05rem;
          border-radius: var(--radius-md);
        }

        .features-section {
          padding: 3rem 0;
        }

        .section-header {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: var(--text-muted);
          font-size: 1.05rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-icon {
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

        .feature-card h3 {
          font-size: 1.25rem;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .text-center {
          text-align: center;
        }

        .landing-footer {
          border-top: 1px solid var(--border-color);
          padding: 1.5rem 0;
          color: var(--text-dim);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .hero-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
