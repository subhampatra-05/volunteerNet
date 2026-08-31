import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Technical", "Social Service", "Workshop", "Cultural", "Sports", "Other"];

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/events", {
        ...form,
        capacity: Number(form.capacity),
      });
      setSuccess(true);
      setTimeout(() => navigate("/my-events"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content flex-center">
        <div className="container flex-center">
          <div className="glass-card create-event-card animate-fade-in">
            <div className="form-header text-center">
              <h2>Host a New Event</h2>
              <p className="form-subtitle">Submit your campus event for admin approval before it goes live on the feed.</p>
            </div>

            {success ? (
              <div className="alert-success text-center">
                🎉 Event submitted successfully! Redirecting to your events...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="event-form">
                {error && <div className="alert-error">{error}</div>}

                <div className="form-group">
                  <label htmlFor="title">Event Title *</label>
                  <input
                    id="title"
                    name="title"
                    className="form-control"
                    placeholder="e.g. Annual Campus Hackathon 2026"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Event Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Describe the purpose, agenda, and volunteer roles for your event..."
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      className="form-control"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="capacity">Volunteer / Participant Capacity *</label>
                    <input
                      id="capacity"
                      type="number"
                      name="capacity"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 50"
                      value={form.capacity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="date">Event Date *</label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="time">Time *</label>
                    <input
                      id="time"
                      type="text"
                      name="time"
                      className="form-control"
                      placeholder="e.g. 03:00 PM"
                      value={form.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    id="location"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Main Auditorium / Lab 204"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
                  {submitting ? "Submitting Event..." : "Submit for Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .create-event-card {
          width: 100%;
          max-width: 600px;
          padding: 2.5rem 2rem;
          margin: 1rem 0;
        }

        .form-header h2 {
          font-size: 1.85rem;
          margin-bottom: 0.35rem;
        }

        .form-subtitle {
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

        textarea.form-control {
          resize: vertical;
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