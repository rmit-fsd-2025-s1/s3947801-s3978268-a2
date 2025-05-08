import Head from "next/head";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useAuth();
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser = login(username, password);
    if (!loggedInUser) {
      setError("Incorrect Username or Password. Try Again.");
      setTimeout(() => setError(""), 2000);
      setPassword("");
      setUsername("");
    } else {
      setShowSuccess("Login Successful!");
      setTimeout(() => {
        setShowSuccess("");
        const redirectUrl = router.query.redirect as string;
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          if (loggedInUser.accountType === "lecturer") {
            router.push("/lecturerPage");
          } else if (loggedInUser.accountType === "tutor") {
            router.push("/tutorPage");
          }
        }
      }, 1000);
    }
  };

  return (
    <div id="login-page">
      <div className="login-form">
        <h1 className="login-form-heading">Login Page</h1>

        <div style={{ height: "1.5rem", textAlign: "center" }}>
          {error && <div className="login-error">{error}</div>}
          {showSuccess && <div className="login-success">{showSuccess}</div>}
        </div>
        <form onSubmit={handleLogin}>
          <div className="input-area">
            <input
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-button" type="submit">
            Log In
          </button>
        </form>
        <div className="signup-link">
          <p>Don't have an account?</p>
          <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
}
