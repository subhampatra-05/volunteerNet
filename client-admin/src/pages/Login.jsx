import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

      if (res.data.user.role !== "admin") {
        setError("This login is for admins only.");
        return;
      }

      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your admin credentials.");
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
              <h2>Admin Login</h2>
              <p className="auth-subtitle">Sign in to access the VolunteerNet Governance Portal</p>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Admin Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="admin@volunteernet.org"
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
                {loading ? "Authenticating..." : "Log In to Admin Portal"}
              </button>
            </form>
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
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}