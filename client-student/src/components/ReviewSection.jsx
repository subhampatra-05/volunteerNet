import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ReviewSection() {
  const [events, setEvents] = useState([]);
  const [drafts, setDrafts] = useState({}); // { [eventId]: { rating, comment } }
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api
      .get("/reviews/reviewable")
      .then((res) => setEvents(res.data.events))
      .catch(() => {}); // section just stays hidden if this fails
  }, []);

  const setDraft = (eventId, patch) =>
    setDrafts((prev) => ({
      ...prev,
      [eventId]: { rating: 0, comment: "", ...prev[eventId], ...patch },
    }));

  const handleSubmit = async (eventId) => {
    const draft = drafts[eventId];
    if (!draft?.rating) {
      alert("Please pick a star rating first");
      return;
    }
    setBusyId(eventId);
    try {
      await api.post(`/reviews/${eventId}`, {
        rating: draft.rating,
        comment: draft.comment,
      });
      // remove the reviewed event from the list
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not submit review");
    } finally {
      setBusyId(null);
    }
  };

  if (events.length === 0) return null;

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <h4>Rate your hosts</h4>
      <p style={{ color: "#475569", fontSize: "0.9rem" }}>
        You attended these events. Share how it went.
      </p>

      <div style={{ display: "grid", gap: "1rem", marginTop: "0.75rem" }}>
        {events.map((event) => {
          const draft = drafts[event._id] || { rating: 0, comment: "" };
          return (
            <div
              key={event._id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                background: "#fff",
              }}
            >
              <strong>{event.title}</strong>
              <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                Hosted by {event.hostId?.name} ·{" "}
                {new Date(event.date).toLocaleDateString()}
              </div>

              <div style={{ margin: "0.5rem 0" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDraft(event._id, { rating: star })}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.6rem",
                      color: star <= draft.rating ? "#f59e0b" : "#cbd5e1",
                      padding: "0 2px",
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Optional comment (max 500 characters)"
                maxLength={500}
                value={draft.comment}
                onChange={(e) => setDraft(event._id, { comment: e.target.value })}
                style={{ width: "100%", minHeight: "60px", marginBottom: "0.5rem" }}
              />

              <button
                className="btn btn-primary"
                disabled={busyId === event._id}
                onClick={() => handleSubmit(event._id)}
              >
                {busyId === event._id ? "Submitting..." : "Submit review"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}