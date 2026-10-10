import { useState, useEffect } from "react";
import api from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const { user } = useAuth();
  // /auth/me returns _id, login/signup return id
  const myId = user?._id || user?.id;

  const fetchEvents = () =>
    api.get("/events").then((res) => setEvents(res.data.events));

  useEffect(() => {
    fetchEvents()
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  // feed auto refresh when a new event goes live
  useEffect(() => {
    const handleNewLive = () => fetchEvents();
    socket.on("event:new-live", handleNewLive);
    return () => socket.off("event:new-live", handleNewLive);
  }, []);

  // live spot counts when anyone joins or leaves
  useEffect(() => {
    const handleParticipantsUpdated = () => fetchEvents();
    socket.on("event:participants-updated", handleParticipantsUpdated);
    return () =>
      socket.off("event:participants-updated", handleParticipantsUpdated);
  }, []);

  const updateParticipants = (eventId, participants) => {
    // merge only participants, since the response doesn't include the populated host
    setEvents((prev) =>
      prev.map((e) => (e._id === eventId ? { ...e, participants } : e))
    );
  };

  const handleJoin = async (eventId) => {
    setBusyId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/join`);
      updateParticipants(eventId, res.data.event.participants);
    } catch (err) {
      alert(err.response?.data?.message || "Could not join event");
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async (eventId) => {
    setBusyId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/leave`);
      updateParticipants(eventId, res.data.event.participants);
    } catch (err) {
      alert(err.response?.data?.message || "Could not leave event");
    } finally {
      setBusyId(null);
    }
  };

  const renderAction = (event) => {
    const isHost = event.hostId?._id === myId;
    const joined = event.participants?.some((p) => p === myId);
    const full = (event.participants?.length || 0) >= event.capacity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ended = new Date(event.date) < today;
    const busy = busyId === event._id;

    if (isHost) return <p>You're hosting this event</p>;
    if (ended) return <p>This event has ended</p>;
    if (joined)
      return (
        <button disabled={busy} onClick={() => handleLeave(event._id)}>
          {busy ? "Leaving..." : "Leave event"}
        </button>
      );
    if (full) return <p>Event is full</p>;
    return (
      <button disabled={busy} onClick={() => handleJoin(event._id)}>
        {busy ? "Joining..." : "Join event"}
      </button>
    );
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Event Feed</h2>
      {events.length === 0 && <p>No events yet — check back later!</p>}
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
              <strong>Capacity:</strong> {event.participants?.length || 0} /{" "}
              {event.capacity}
            </p>
            <p>
              <strong>Hosted by:</strong> {event.hostId?.name}
            </p>

            {renderAction(event)}
          </div>
        ))}
      </div>
    </div>
  );
}