import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", college: "", year: "", skills: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content auth-container">
        <div className="container flex-center">
          <div className="glass-card auth-card signup-card animate-fade-in">
            <div className="auth-header text-center">
              <div className="auth-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <h2>Create Your Account</h2>
              <p className="auth-subtitle">Join VolunteerNet to host events & volunteer skills</p>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="student@college.edu"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="college">College / University</label>
                  <input
                    id="college"
                    name="college"
                    className="form-control"
                    placeholder="e.g. Stanford University"
                    value={form.college}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="year">Year of Study</label>
                  <input
                    id="year"
                    name="year"
                    className="form-control"
                    placeholder="e.g. 3rd Year"
                    value={form.year}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  id="skills"
                  name="skills"
                  className="form-control"
                  placeholder="e.g. Event Management, Python, Public Speaking"
                  value={form.skills}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="auth-footer text-center">
              <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flex-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .auth-card {
          width: 100%;
          max-width: 520px;
          padding: 2.5rem 2rem;
          margin: 1rem 0;
        }

        .auth-icon-badge {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .auth-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.35rem;
        }

        .auth-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 1.75rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .auth-form {
          margin-bottom: 1.5rem;
        }

        .auth-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1.25rem;
          font-size: 0.925rem;
          color: var(--text-muted);
        }

        .auth-link {
          font-weight: 600;
          color: #818cf8;
        }

        @media (max-width: 640px) {
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}