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
            <h1 className="hero-title">
              Seamless Event & <br />
              <span className="hero-green-text">Volunteer Management</span>
            </h1>

            <p className="hero-subtitle">
              VolunteerNet solves the hassle of organizing campus events and recruiting student volunteers. 
              Host initiatives, connect with skilled volunteers, and build your community impact seamlessly.
            </p>

            <div className="hero-actions">
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
      </main>

      <style>{`
        .hero-section {
          padding: 6rem 0 4rem;
          text-align: center;
        }

        .hero-title {
          font-size: 3.25rem;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }

        .hero-green-text {
          color: #16a34a;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: #475569;
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
          padding: 0.85rem 2rem;
          font-size: 1.05rem;
          border-radius: var(--radius-md);
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
