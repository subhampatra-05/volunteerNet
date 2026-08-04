import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", college: "", year: "", skills: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/signup", {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input name="college" placeholder="College" value={form.college} onChange={handleChange} />
        <input name="year" placeholder="Year (e.g. 3rd)" value={form.year} onChange={handleChange} />
        <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={handleChange} />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}