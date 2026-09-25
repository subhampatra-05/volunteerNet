import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Logged in as: {user?.name} ({user?.email})</p>
      <Link to="/pending-events">Review Pending Events</Link>
      <button onClick={logout}>Log out</button>
    </div>
  );
}