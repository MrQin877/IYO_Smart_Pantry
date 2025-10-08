// src/pages/Verify.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import "./Verify.css";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 页面加载时自动读取本地保存的邮箱
  useEffect(() => {
    const savedEmail = localStorage.getItem("verifyEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await apiPost("/verify_2fa.php", { email, code });
      if (resp.ok) {
        alert("✅ Verification successful! You can now log in.");
        localStorage.removeItem("verifyEmail");
        navigate("/login");
      } else {
        alert(resp.error || "Verification failed");
      }
    } catch (err) {
      alert("Server error: " + err.message);
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

        <input
          type="email"
          value={email}
          disabled
          className="email-disabled"
        />

        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

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

        <p className="verify-login-link">
          Already verified?{" "}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
