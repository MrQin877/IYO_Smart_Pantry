// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const resp = await apiPost("/login.php", { email, password: pwd });
      if (resp.ok) {
        localStorage.setItem("userID", resp.userID);
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert(resp.error || "Login failed");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-page">
        {/* Header Logo */}
        <div className="login-header">
          <img className="login-logo" src="/logo.svg" alt="IYO Logo" />
        </div>

        {/* Main Content */}
        <div className="login-content">
          {/* Left Side Image */}
          <div className="login-image-container">
            <img
              className="login-image"
              src="/Elain/login.png"
              alt="Login Illustration"
            />
          </div>

          {/* Right Side Form */}
          <div className="login-form-container">
            <div className="login-top">
              <button className="register-switch" onClick={() => navigate("/register")}>
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-card">
              <h2>Login</h2>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />

              <div className="login-bottom">
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
