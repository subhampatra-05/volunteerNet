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
              <span>Empowering Campus Communities</span>
            </div>

            <h1 className="hero-title animate-fade-in">
              Seamless Event & <br />
              <span className="hero-gradient-text">Volunteer Management</span>
            </h1>

            <p className="hero-subtitle animate-fade-in">
              VolunteerNet solves the hassle of organizing events and recruiting student volunteers. 
              Host campus initiatives, connect with skilled volunteers, discover active event feeds, 
              and build your community impact seamlessly.
            </p>

            <div className="hero-actions animate-fade-in">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="section-title">What VolunteerNet Solves</h2>
              <p className="section-subtitle">A simple, powerful hub built specifically for event hosts and student volunteers.</p>
            </div>

            <div className="features-grid">
              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-purple">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3>Centralized Event Hosting</h3>
                <p>Say goodbye to scattered announcements. Create, manage, and monitor event signups with structured details and real-time approvals.</p>
              </div>

              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-cyan">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Volunteer Recruitment</h3>
                <p>Find motivated student volunteers equipped with the specific skills your workshop, hackathon, or cultural fest requires.</p>
              </div>

              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3>Live Event Feed</h3>
                <p>Explore an active stream of upcoming events, social initiatives, and tech workshops happening around your college network.</p>
              </div>

              <div className="glass-card glass-card-hover feature-card">
                <div className="feature-icon icon-emerald">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3>Skill Tracking & Badges</h3>
                <p>Highlight your technical and organizational skills, build a verified participation record, and earn ratings from event hosts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-section">
          <div className="container">
            <div className="glass-card cta-card text-center">
              <h2>Join VolunteerNet Today</h2>
              <p>Whether you want to host an upcoming event or volunteer your skills, get started in seconds.</p>
              <div className="cta-buttons">
                <Link to="/signup" className="btn btn-primary">Create Your Account</Link>
                <Link to="/login" className="btn btn-secondary">Log In</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container text-center">
          <p>© {new Date().getFullYear()} VolunteerNet — Empowering Events & Volunteers.</p>
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
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          color: #a5b4fc;
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 8px #6366f1;
        }

        .hero-title {
          font-size: 3.25rem;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          font-weight: 800;
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%);
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
          padding: 4rem 0;
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

        .icon-purple { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        .icon-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
        .icon-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }

        .feature-card h3 {
          font-size: 1.25rem;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .cta-section {
          padding: 2rem 0 4rem;
        }

        .cta-card {
          background: linear-gradient(135deg, rgba(30, 41, 65, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .cta-card h2 {
          font-size: 2rem;
        }

        .cta-card p {
          color: var(--text-muted);
          max-width: 500px;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
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
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .btn-lg {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
