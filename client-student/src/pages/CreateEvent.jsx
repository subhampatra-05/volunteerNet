import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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
    <div>
      <h2>Host an Event</h2>
      <p>Your event will be reviewed by an admin before it appears in the feed.</p>

      {success ? (
        <p style={{ color: "green" }}>Event submitted! Redirecting to your events...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label><br />
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div>
            <label>Description</label><br />
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </div>

          <div>
            <label>Category</label><br />
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Date</label><br />
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>

          <div>
            <label>Time</label><br />
            <input type="text" name="time" placeholder="e.g. 03:00 PM" value={form.time} onChange={handleChange} required />
          </div>

          <div>
            <label>Location</label><br />
            <input name="location" value={form.location} onChange={handleChange} required />
          </div>

          <div>
            <label>Capacity</label><br />
            <input type="number" name="capacity" min="1" value={form.capacity} onChange={handleChange} required />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      )}
    </div>
  );
}