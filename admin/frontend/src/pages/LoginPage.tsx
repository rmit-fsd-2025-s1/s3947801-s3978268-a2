import React, { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

const LOGIN_ADMIN = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      token
    }
  }
`;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAdmin, { loading, error }] = useMutation(LOGIN_ADMIN);
  const history = useHistory();

  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      history.replace("/dashboard");
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginAdmin({ variables: { email, password } });
      localStorage.setItem("adminToken", res.data.loginAdmin.token);
      history.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          required
        />

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p className={styles.error}>
            {error.message === "Invalid credentials"
              ? "Invalid email or password."
              : "Login failed. Please try again."}
          </p>
        )}
      </form>
    </div>
  );
}
