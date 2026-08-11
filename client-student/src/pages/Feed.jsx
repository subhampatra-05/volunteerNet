import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/events")
      .then((res) => setEvents(res.data.events))
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Event Feed</h2>
      {events.length === 0 && <p>No events yet — check back later!</p>}
      <div style={{ display: "grid", gap: "1rem" }}>
        {events.map((event) => (
          <div key={event._id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()} at {event.time}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Capacity:</strong> {event.participants?.length || 0} / {event.capacity}</p>
            <p><strong>Hosted by:</strong> {event.hostId?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}