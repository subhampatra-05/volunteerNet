import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  pending: "#e6a817",
  approved: "#2e7d32",
  rejected: "#c62828",
};

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/events/my-events")
      .then((res) => setEvents(res.data.events))
      .catch(() => setError("Failed to load your events"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>My Events</h2>
      <Link to="/create-event">+ Host a New Event</Link>

      {events.length === 0 && <p>You haven't hosted any events yet.</p>}

      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {events.map((event) => (
          <div key={event._id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{event.title}</h3>
              <span
                style={{
                  background: STATUS_COLORS[event.status],
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  textTransform: "capitalize",
                }}
              >
                {event.status}
              </span>
            </div>
            <p>{event.description}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()} at {event.time}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Capacity:</strong> {event.participants?.length || 0} / {event.capacity}</p>

            {event.status === "rejected" && event.rejectionReason && (
              <p style={{ color: "#c62828" }}>
                <strong>Rejection reason:</strong> {event.rejectionReason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}