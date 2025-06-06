import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { applicationService, LecturerSelectionService, userService } from "../services/api"; // your axios services
import { Application, LecturerSelection } from "../types/types";

export default function LecturerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selections, setSelections] = useState<LecturerSelection[]>([]);

  // Extract the search term from the URL query param (from navbar form)
  const searchTerm = (router.query.search as string) || "";

    // Filters and sort state
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");
  const [candidateFilter, setCandidateFilter] = useState<string>("");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("");
  

  // Sorting state
  const [sortBy, setSortBy] = useState<"course" | "availability" | "">( "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortedCourses, setSortedCourses] = useState<string[]>([]);

  // Available options for filters
  const availabilityOptions = ["Full Time", "Part Time"];
  const sessionTypes = ["candidate", "lab assistant"];

  // Redirect if not lecturer
  useEffect(() => {
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user]);

  // Fetch applications and selections on mount or when user changes
  useEffect(() => {
    if (!user) return;
    
    userService.getCoursesByUser(user.id)
    .then(courses => {
      const assignedCourseIds = courses.map(c => c.id);
      
      // Fetch applications after you have course IDs
      applicationService.getApplications(assignedCourseIds)
      .then(apps => {
        setApplications(apps);
        const uniqueCourses = Array.from(new Set(apps.map(a => a.course.name)));
        setSortedCourses(uniqueCourses);
      })
      .catch(err => console.error("Error fetching applications", err));
    })
    .catch(err => {
      console.error("Error fetching user courses", err);
    });
    
    LecturerSelectionService.getSelectionsByLecturer(user.id)
    .then(sel => setSelections(sel))
    .catch(err => console.error("Error fetching selections", err));
  }, [user]);


  // Filtered applications based on search, course and availability
    const filteredApps = applications
    .filter(app => {
      // Only show Pending applications (exclude ranked)
      if (app.status && app.status !== "Pending") return false;

      if (courseFilter && app.course.name !== courseFilter) return false;
      if (availabilityFilter && app.availability !== availabilityFilter) return false;
      if (sessionTypeFilter && app.role !== sessionTypeFilter) return false;

      if (candidateFilter && !app.user.email.toLowerCase().includes(candidateFilter.toLowerCase()))
        return false;
      if (skillFilter && !app.skills?.toLowerCase().includes(skillFilter.toLowerCase())) return false;

      // Search term across multiple fields
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !app.user.email.toLowerCase().includes(term) &&
          !app.skills?.toLowerCase().includes(term) &&
          !app.course.name.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      return true;
    });


  // Sort the filtered apps
  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === "course") {
      return sortDirection === "asc"
        ? a.course.name.localeCompare(b.course.name)
        : b.course.name.localeCompare(a.course.name);
    }
    if (sortBy === "availability") {
      const aAvail = a.availability ?? "";
      const bAvail = b.availability ?? "";
      return sortDirection === "asc"
      ? aAvail.localeCompare(bAvail)
      : bAvail.localeCompare(aAvail);
    }
    return 0;
  });


  // Check if the current lecturer has selected this application
  const isSelected = (appId: number) =>
    selections.some(sel => sel.application.id === appId && sel.lecturer.id === user?.id);

  // Toggle selection for an application
  const toggleSelection = (app: Application) => {
    if (!user) return;
    
    const alreadySelected = selections.find(
      sel => sel.application.id === app.id && sel.lecturer.id === user.id
    );
    
    if (alreadySelected) {
      setSelections(prev => prev.filter(sel => sel.application.id !== app.id));
    } else {
      // Just add a placeholder selection object (not from DB)
      setSelections(prev => [
        ...prev,
        {
          id: 0, 
          application: app,
          lecturer: user,
          rank: "",
          comment: ""
        }
      ]);
    }
  };

  // Handle sorting toggle on column header click
  const handleSort = (field: "course" | "availability") => {
    if (sortBy === field) {
      setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Confirm selections 
  const handleConfirmSelection = async () => {
    if (!user) return;
    
    try {
      for (const sel of selections) {
        // Only persist selections not already saved
        if (sel.id === 0) {
          await LecturerSelectionService.upsertSelection({
            applicationId: sel.application.id,
            lecturerId: user.id,
            rank: sel.rank || "",
            comment: sel.comment || ""
          });
        }
      }
      router.push("/successfulCandidatePage");
    } catch (err) {
      console.error("Error confirming selections", err);
      alert("Something went wrong confirming your selections.");
    }
  };


  return (
    <div>
        <h1>Applicants</h1>

      {/* Filters */}
      <div className="sort-container">
        <label>
          Course:
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
            <option value="">All</option>
            {user?.courses?.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          Availability:
          <select value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
            <option value="">All</option>
            {availabilityOptions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          Session Type:
          <select value={sessionTypeFilter} onChange={e => setSessionTypeFilter(e.target.value)}>
            <option value="">All</option>
            {sessionTypes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label>
          Candidate Name:
          <input
            type="text"
            value={candidateFilter}
            onChange={e => setCandidateFilter(e.target.value)}
            placeholder="Search candidate email"
          />
        </label>

        <label>
          Skill Set:
          <input
            type="text"
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            placeholder="Search skills"
          />
        </label>
      </div>

      <div className="confirm-button-container">
        <button className="confirm-btn" onClick={handleConfirmSelection}>
          Confirm Selections
        </button>
      </div>

      {/* Table with sortable headers */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Candidate Name</th>
            <th onClick={() => handleSort("course")} style={{ cursor: "pointer" }}>
              Course {sortBy === "course" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th onClick={() => handleSort("availability")} style={{ cursor: "pointer" }}>
              Availability {sortBy === "availability" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </th>
            <th>Skills</th>
            <th>Academic Credentials</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedApps.map(app => (
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
    </div>
  );
}
