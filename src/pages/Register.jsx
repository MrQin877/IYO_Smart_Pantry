// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [household, setHousehold] = useState("NA");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    // basic frontend validation before sending to backend
    const newErrors = {};
    if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name = "Username cannot contain numbers or punctuation marks.";
    }

    if (!/^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (pwd.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const resp = await apiPost("/register.php", {
        fullName: name,
        email,
        password: pwd,
        householdSize: household === "NA" ? null : household,
      });
      if (resp.ok) {
        alert("✅ Registered successfully! Please check your email for the verification code.");
        localStorage.setItem("verifyEmail", email);
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
    <div className="login-wrapper">
      <div className="login-page">
        {/* Header Logo */}
        <div className="login-header">
          <img className="login-logo" src="/logo.svg" alt="IYO Logo" />
        </div>

        {/* Main Content */}
        <div className="login-content">
          {/* Left Side Form */}
          <div className="login-form-container">
            <p className="register-linktologin">
              <button className="link-btn" onClick={() => navigate("/login")}>
                Login
              </button>
            </p>

            <form onSubmit={handleSubmit} className="login-card">
              <h2>Register</h2>

              {/* Full Name */}
              <div className={`input-group ${errors.name ? "error" : ""}`}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {errors.name && (
                  <span className="error-icon" title={errors.name}>❗</span>
                )}
              </div>

              {/* Email */}
              <div className={`input-group ${errors.email ? "error" : ""}`}>
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && (
                  <span className="error-icon" title={errors.email}>❗</span>
                )}
              </div>

              {/* Password */}
              <div className={`input-group ${errors.password ? "error" : ""}`}>
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                />
                {errors.password && (
                  <span className="error-icon" title={errors.password}>❗</span>
                )}
              </div>

              {/* Household Size */}
              <div className="household-section">
                <label>Household Size:</label>
                <div className="household-control">
                  {household === "NA" ? (
                    <>
                      <span className="household-na">NA</span>
                      <button type="button" onClick={() => setHousehold(1)}>
                        +
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          if (household <= 1) setHousehold("NA");
                          else setHousehold(household - 1);
                        }}
                      >
                        −
                      </button>
                      <span>{household}</span>
                      <button type="button" onClick={() => setHousehold(household + 1)}>
                        +
                      </button>
                    </>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
          

          {/* Right Side Image */}
          <div className="login-image-container">
            <img
              className="register-image"
              src="/Elain/register.png"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


