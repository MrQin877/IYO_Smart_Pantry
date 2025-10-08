// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [household, setHousehold] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await apiPost("/register.php", {
        fullName: name,
        email,
        password: pwd,
        householdSize: household,
      });
      if (resp.ok) {
        alert("✅ Registered successfully! Please check your email for the verification code.");
        // 保存 email 到 localStorage 以便 verify 页面自动读取
        localStorage.setItem("verifyEmail", email);
        // 跳转 verify 页面
        navigate("/Verify");
      } else {
        alert(resp.error || "Register failed");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <img className="register-logo" src="/logo.svg" alt="IYO Logo" />

      <p className="register-linktologin">
        <button className="link-btn" onClick={() => navigate("/login")}>
          Login
        </button>
      </p>

      <form onSubmit={handleSubmit} className="register-card">
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
        />

        <div className="household-section">
          <label>Household Size:</label>
          <div className="household-control">
            <button
              type="button"
              onClick={() => setHousehold(Math.max(1, household - 1))}
            >
              −
            </button>
            <span>{household}</span>
            <button type="button" onClick={() => setHousehold(household + 1)}>
              +
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
