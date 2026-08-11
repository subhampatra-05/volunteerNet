import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    
    <div>
      <Link to="/feed">View Event Feed</Link>
      <h2>Welcome, {user?.name}</h2>
      <p>Email: {user?.email}</p>
      <p>College: {user?.college}</p>
      <button onClick={logout}>Log out</button>
    </div>
    
  );
}