import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Landing() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content">
        {/* Admin Landing Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-badge-pill">
              <span className="badge-dot"></span> Governance & Event Oversight
            </div>

            <h1 className="hero-title">
              Campus Event & <br />
              <span className="hero-accent-text">Volunteer Moderation</span>
            </h1>

            <p className="hero-subtitle">
              Authorize campus events, ensure quality standards, monitor volunteer participation, 
              and maintain compliance across all student organizations.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                Access Admin Portal
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .hero-section {
          padding: 6rem 0 4rem;
          text-align: center;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          background: #eef6ff;
          border: 1px solid #bfdbfe;
          border-radius: var(--radius-full);
          color: #1d4ed8;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3b82f6;
        }

        .hero-title {
          font-size: 3.25rem;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          font-weight: 800;
          color: #172554;
        }

        .hero-accent-text {
          color: #2563eb;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: #475569;
          max-width: 650px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.25rem;
          }
          .hero-actions .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
