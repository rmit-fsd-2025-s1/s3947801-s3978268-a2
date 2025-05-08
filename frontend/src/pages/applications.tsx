// pages/applications.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import router from "next/router";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const storedApps = JSON.parse(localStorage.getItem("applications") || "[]");
    if (user && user.accountType === "tutor") {
      setApplications(storedApps.filter((app: any) => app.tutorName === user.username));
    } else {
      setApplications(storedApps);
      router.push("/"); // If user not tutor redirect page
    }
  }, [user]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    // Remove the application from "applications" (for tutors)
    let storedApps = JSON.parse(localStorage.getItem("applications") || "[]");
    storedApps = storedApps.filter((app: any) => app.id !== id);
    localStorage.setItem("applications", JSON.stringify(storedApps));

    // Remove the application "applicants" (for lecturers)
    let storedApplicants = JSON.parse(localStorage.getItem("applicants") || "[]");
    storedApplicants = storedApplicants.filter((app: any) => app.id !== id);
    localStorage.setItem("applicants", JSON.stringify(storedApplicants));

    setApplications(prev => prev.filter(app => app.id !== id));
  };

  return (
    <div className="main-container">
      <h2>Your Applications</h2>
      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Course Name</th>
              <th>Previous Roles</th>
              <th>Availability</th>
              <th>Skills</th>
              <th>Academic Credentials</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>{app.role}</td>
                <td>{app.courseName}</td>
                <td>{app.previousRole}</td>
                <td>{app.availability}</td>
                <td>{app.skills}</td>
                <td>{app.academicCredentials}</td>
                <td>{app.status || "Pending"}</td>
                <td>
                  <button onClick={() => handleDelete(app.id)} className="delete-button">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
