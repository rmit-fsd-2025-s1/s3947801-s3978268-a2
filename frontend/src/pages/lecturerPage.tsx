import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { applicationService, LecturerSelectionService } from "../services/api"; // your axios services
import { Application, LecturerSelection } from "../types/types";

export default function LecturerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selections, setSelections] = useState<LecturerSelection[]>([]);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState<string>("");

  const [sortedCourses, setSortedCourses] = useState<string[]>([]);
  const availabilityOptions = ["Full Time", "Part Time"];

  // Redirect if not lecturer
  useEffect(() => {
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user]);

  // Fetch applications and selections on mount or when user changes
  useEffect(() => {
    if (!user) return;

    // Assuming user has an array of course IDs assigned:
    const assignedCourseIds = user.courses?.map(c => c.id) || [];

    applicationService.getApplications(assignedCourseIds)
      .then(apps => {
        setApplications(apps);
        const uniqueCourses = Array.from(new Set(apps.map(a => a.course.name)));
        setSortedCourses(uniqueCourses);
      })
      .catch(err => console.error("Error fetching applications", err));

    LecturerSelectionService.getSelectionsByLecturer(user.id)
      .then(sel => setSelections(sel))
      .catch(err => console.error("Error fetching selections", err));
  }, [user]);

  // Filtered applications based on search, course and availability
  const filteredApplications = applications.filter(app => {
  if (app.status && app.status !== "Pending") return false; // Exclude ranked
  let matchesCourse = selectedCourseFilter ? app.course.name === selectedCourseFilter : true;
  let matchesAvailability = selectedAvailabilityFilter ? app.availability === selectedAvailabilityFilter : true;
  return matchesCourse && matchesAvailability;
});

  // Check if the current lecturer has selected this application
  const isSelected = (appId: number) =>
    selections.some(sel => sel.application.id === appId && sel.lecturer.id === user?.id);

  // Toggle selection for an application
  const toggleSelection = async (app: Application) => {
    if (!user) return;

    const existingSelection = selections.find(sel => sel.application.id === app.id && sel.lecturer.id === user.id);

    if (existingSelection) {
      setSelections(prev => prev.filter(sel => sel.id !== existingSelection.id));
    } else {
      // Create selection
      try {
        const newSelection = await LecturerSelectionService.upsertSelection({
          applicationId: app.id,
          lecturerId: user.id,
          rank: "",
          comment: ""
        });
        setSelections(prev => [...prev, newSelection]);
      } catch (error) {
        console.error("Error saving selection", error);
      }
    }
  };

  // Confirm selections 
  const handleConfirmSelection = () => {
    // Redirect
    router.push("/successfulCandidatePage");
  };

  return (
    <div>
      <h1>Applicants</h1>

      <div>
        <span>Filter by Course: </span>
        <select onChange={e => setSelectedCourseFilter(e.target.value)} value={selectedCourseFilter}>
          <option value="">All</option>
          {sortedCourses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <span>Filter by Availability: </span>
        <select onChange={e => setSelectedAvailabilityFilter(e.target.value)} value={selectedAvailabilityFilter}>
          <option value="">All</option>
          {availabilityOptions.map(avail => (
            <option key={avail} value={avail}>{avail}</option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Tutor Name</th>
            <th>Course</th>
            <th>Availability</th>
            <th>Skills</th>
            <th>Academic Credentials</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map(app => (
            <tr key={app.id}>
              <td>
                <button onClick={() => toggleSelection(app)}>
                  {isSelected(app.id) ? "Undo" : "Select"}
                </button>
              </td>
              <td>{app.user.email}</td>
              <td>{app.course.name}</td>
              <td>{app.availability}</td>
              <td>{app.skills || "N/A"}</td>
              <td>{app.academicCredentials || "N/A"}</td>
              <td>{app.status || "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleConfirmSelection}>Confirm Selection</button>
    </div>
  );
}
