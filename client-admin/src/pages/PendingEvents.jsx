import { useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";

export default function PendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPending = () => {
    setLoading(true);
    api
      .get("/events/pending")
      .then((res) => setEvents(res.data.events))
      .catch(() => setError("Failed to load pending events"))
      .finally(() => setLoading(false));
  };

  // listen for new pending events
  useEffect(() => {
    const handleNewSubmission = () => {
      fetchPending(); // refetch the list
    };
    socket.on("event:submitted", handleNewSubmission);
    return () => socket.off("event:submitted", handleNewSubmission);
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/events/${id}/approve`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Failed to approve event");
    }
  };

  const handleRejectSubmit = async (id) => {
    try {
      await api.patch(`/events/${id}/reject`, { reason: rejectionReason });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setRejectingId(null);
      setRejectionReason("");
    } catch {
      alert("Failed to reject event");
    }
  };

  if (loading) return <p>Loading pending events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Pending Events</h2>
      {events.length === 0 && <p>No events awaiting review.</p>}

      <div style={{ display: "grid", gap: "1rem" }}>
        {events.map((event) => (
          <div
            key={event._id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "8px",
            }}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>
              <strong>Category:</strong> {event.category}
            </p>
            <p>
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}{" "}
              at {event.time}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            <p>
              <strong>Capacity:</strong> {event.capacity}
            </p>
            <p>
              <strong>Host:</strong> {event.hostId?.name} ({event.hostId?.email}
              )
            </p>

            {rejectingId === event._id ? (
              <div style={{ marginTop: "0.5rem" }}>
                <input
                  placeholder="Reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />
                <button onClick={() => handleRejectSubmit(event._id)}>
                  Confirm Reject
                </button>
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}
              >
                <button onClick={() => handleApprove(event._id)}>
                  Approve
                </button>
                <button onClick={() => setRejectingId(event._id)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
