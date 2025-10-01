import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const resp = await apiPost("/register.php", { fullName: name, email, password: pwd });
      if (resp.ok) {
        alert("Registered successfully! Please check your email.");
      } else {
        alert(resp.error || "Register failed");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
        Register
      </button>
    </form>
  );
}
