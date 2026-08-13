import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <p>{user?.email} — {user?.college} ({user?.year})</p>

      <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
        <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h3>{stats.stats.eventsHostedCount}</h3>
          <p>Events Hosted</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h3>{stats.stats.eventsParticipatedCount}</h3>
          <p>Events Participated</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h3>{stats.user.avgRating?.toFixed(1) ?? "N/A"}</h3>
          <p>Average Rating</p>
        </div>
      </div>

      <div style={{ margin: "1rem 0" }}>
        <strong>Skills:</strong>{" "}
        {stats.user.skills?.length > 0 ? stats.user.skills.join(", ") : "No skills added yet"}
      </div>

      {stats.eventsHosted.length > 0 && (
        <div>
          <h4>Your Hosted Events</h4>
          <ul>
            {stats.eventsHosted.map((e) => (
              <li key={e._id}>{e.title} — {e.status}</li>
            ))}
          </ul>
        </div>
      )}

      {stats.eventsParticipated.length > 0 && (
        <div>
          <h4>Events You're Participating In</h4>
          <ul>
            {stats.eventsParticipated.map((e) => (
              <li key={e._id}>{e.title} — {new Date(e.date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <Link to="/feed">View Event Feed</Link>
      </div>

      <button onClick={logout} style={{ marginTop: "1rem" }}>Log out</button>
    </div>
  );
}