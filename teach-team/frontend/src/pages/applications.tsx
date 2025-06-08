import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import router from "next/router";
import { Application } from "../types/types";
export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedStatus) params.append("status", selectedStatus);
        if (selectedRole) params.append("role", selectedRole);

        const response = await axios.get(
          `http://localhost:3001/api/applications/user/${user.id}?${params.toString()}`
        );
        setApplications(response.data);
      } catch {
        console.error("Error fetching applications");
      }
    };

    if (user && user.accountType === "candidate") {
      fetchApplications();
    } else {
      router.push("/");
    }
  }, [user, selectedStatus, selectedRole]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/applications/${id}`);
      setApplications((prev) => prev.filter((app) => app.id.toString() !== id));
    } catch {
      console.error("Error deleting application");
    }
  };

  return (
    <>
      <div className="main-container">
        <div className="applications-heading">
          <h2>Your Applications</h2>
        </div>

        <div className="filter-section">
          <label>Filters:</label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="candidate">Candidate</option>
            <option value="lab assistant">Lab Assistant</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications-wrapper">
          <div className="no-applications-message">
            No applications found. Submit one to get started!
          </div>
        </div>
      ) : (
        <div className="applications-table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="role">Role</th>
                <th className="course-name">Course Name</th>
                <th className="previous-role">Previous Roles</th>
                <th className="availability">Availability</th>
                <th className="skills">Skills</th>
                <th className="academic-credentials">Academic Credentials</th>
                <th className="status">Status</th>
                <th className="created-at">Created At</th>
                <th className="action">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="role">{app.role}</td>
                  <td className="course-name">{app.course?.name || app.course.name}</td>
                  <td className="previous-role"><div className="scrollable-cell">{app.previousRole}</div></td>
                  <td className="availability"><div className="scrollable-cell">{app.availability}</div></td>
                  <td className="skills"><div className="scrollable-cell">{app.skills}</div></td>
                  <td className="academic-credentials"><div className="scrollable-cell">{app.academicCredentials}</div></td>
                  <td className="status">{app.status || "Pending"}</td>
                  <td className="created-at">{new Date(app.date_applied).toLocaleDateString()}</td>
                  <td className="action">
                    <button onClick={() => handleDelete(app.id.toString())} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
