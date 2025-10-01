import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const resp = await apiPost("/login.php", { email, password: pwd });
      if (resp.ok) {
        onSuccess?.(resp.userID);
      } else {
        alert(resp.error || "Login failed");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        Login
      </button>
    </form>
  );
}
