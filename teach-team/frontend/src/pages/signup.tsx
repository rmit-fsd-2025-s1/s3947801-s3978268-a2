import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { userService } from "../services/api"; // update if your path is different

export default function Signup() {
  const [email, setEmail] = useState("");           // use email, not username
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("tutor"); // default
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowSuccess("");
    try {
      await userService.createUser({ email, password, accountType: accountType as "lecturer" | "tutor" });
      setShowSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => {
        setShowSuccess("");
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed.");
      setTimeout(() => setError(""), 2500);
    }
  };

  return (
    <div id="login-page">
      <div className="login-form">
        <h1 className="login-form-heading">Sign Up</h1>

        <div style={{ height: "1.5rem", textAlign: "center" }}>
          {error && <div className="login-error">{error}</div>}
          {showSuccess && <div className="login-success">{showSuccess}</div>}
        </div>
        <form onSubmit={handleSignup}>
          <div className="input-area">
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              required
            >
              <option value="tutor">Tutor</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>
          <button className="login-button" type="submit">
            Sign Up
          </button>
        </form>
        <div className="signup-link">
          <p>Already have an account?</p>
          <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
