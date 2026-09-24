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
          <div className="glass-card auth-card">
            <div className="auth-header text-center">
              <div className="auth-logo-badge">VN</div>
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
              <p>New to VolunteerNet? <Link to="/signup" className="auth-link">Create an account</Link></p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 0;
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
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .auth-logo-badge {
          width: 54px;
          height: 54px;
          border-radius: 12px;
          background: #16a34a;
          color: #ffffff;
          font-weight: 800;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          letter-spacing: -0.03em;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          margin-bottom: 0.35rem;
          color: #0f172a;
        }

        .auth-subtitle {
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 1.75rem;
        }

        .auth-form {
          margin-bottom: 1.5rem;
        }

        .auth-footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 1.25rem;
          font-size: 0.925rem;
          color: #475569;
        }

        .auth-link {
          font-weight: 600;
          color: #16a34a;
        }

        .auth-link:hover {
          color: #15803d;
        }
      `}</style>
    </div>
  );
}