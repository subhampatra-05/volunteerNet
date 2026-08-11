import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Logged in as: {user?.name} ({user?.email})</p>
      <p>Pending events will show up here once Phase 4 is built.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}