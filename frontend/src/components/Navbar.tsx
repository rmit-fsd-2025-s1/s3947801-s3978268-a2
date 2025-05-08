import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function Navbar() {
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  if (currentUser == null) {
    return (
      <nav className="navbar-flex-container">
        <ul className="left-navbar">
          <li>
            <Link href="/">Home</Link>
          </li>
        </ul>
        <ul className="right-navbar">
          <li>
            <Link href="/login">Sign in</Link>
          </li>
          <li>
            <Link href="/signup">Sign up</Link>
          </li>
        </ul>
      </nav>
    );
  } else if (currentUser?.accountType === "tutor") {
    // Tutors see only Home and the Sign out button
    return (
      <nav className="navbar-flex-container">
        <ul className="left-navbar">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li> 
            <Link href="/tutorPage">Become a tutor</Link>
          </li>
          <li>
            <Link href="/applications">Applications</Link>
          </li>
        </ul>
        <ul className="right-navbar">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
            >
              Sign out
            </a>
          </li>
        </ul>
      </nav>
    );
  } else if (currentUser?.accountType === "lecturer") {
    // Lecturers see Home and Tutors (along with their search form and sign out)
    return (
      <nav className="navbar-flex-container">
        <ul className="left-navbar">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/lecturerPage">Tutors</Link>
          </li>
          <li>
            <Link href="/virtualizationPage">Applicant Data</Link>
          </li>
        </ul>
        <ul className="right-navbar">
          <li>
            <form action="/lecturerPage" method="get">
              <input className="search-box" type="text" placeholder="Search.." name="search" />
            </form>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
            >
              Sign out
            </a>
          </li>
        </ul>
      </nav>
    );
  }
}
