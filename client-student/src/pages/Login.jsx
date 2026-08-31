import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content auth-container">
        <div className="container flex-center">
          <div className="glass-card auth-card animate-fade-in">
            <div className="auth-header text-center">
              <div className="auth-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Log in to access your VolunteerNet dashboard</p>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
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

              <div className="form-group">
                <label htmlFor="password">Password</label>
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

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="auth-footer text-center">
              <p>New here? <Link to="/signup" className="auth-link">Create an account</Link></p>
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
          max-width: 440px;
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
      `}</style>
    </div>
  );
}