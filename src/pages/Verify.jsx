// src/pages/Verify.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import "./Verify.css";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState(""); // new password for register
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const context = params.get("context") || "register"; // default: register

  // Load saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem("verifyEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (context === "register" && password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      const body = { email, code };
      if (context === "register") body.password = password;

      const resp = await apiPost("/verify_2fa.php", body);
      if (resp.ok) {
        alert("✅ Verification successful!");
        localStorage.removeItem("verifyEmail");

        if (context === "login") {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        setErrorMsg(resp.error || "Verification failed.");
      }
    } catch (err) {
      setErrorMsg("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      alert("Missing email address.");
      return;
    }
    setLoading(true);
    try {
      const resp = await apiPost("/request_code.php", { email });
      if (resp.ok) {
        alert("📧 Verification code resent to your email.");
      } else {
        alert(resp.error || "Failed to resend code");
      }
    } catch (err) {
      alert("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="verify-container">
      <img className="verify-logo" src="/logo.svg" alt="IYO Logo" />

      <form className="verify-card" onSubmit={handleVerify}>
        <h2>Email Verification</h2>
        <p className="verify-info">
          We have sent a 6-digit verification code to your email.
        </p>

        <input type="email" value={email} disabled className="email-disabled" />

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        {/* Show password field ONLY for registration verification */}
        {context === "register" && (
          <input
            type="password"
            placeholder="Enter new password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleResend}
          disabled={loading}
        >
          Resend Code
        </button>
      </form>
    </div>
  );
}
