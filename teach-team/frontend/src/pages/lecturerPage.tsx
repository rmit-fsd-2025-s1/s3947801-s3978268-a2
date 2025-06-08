import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { applicationService, LecturerSelectionService, userService } from "../services/api";
import { Application, LecturerSelection, Course } from "../types/types";

export default function LecturerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selections, setSelections] = useState<LecturerSelection[]>([]);

  const [courseFilter, setCourseFilter] = useState<string>("");
  const [lecturerCourses, setLecturerCourses] = useState<Course[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");
  const [candidateFilter, setCandidateFilter] = useState<string>("");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("");

  const [sortBy, setSortBy] = useState<"course" | "availability" | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const availabilityOptions = ["Full Time", "Part Time"];
  const sessionTypes = ["tutor", "lab assistant"];

  const searchTerm = (router.query.search as string) || "";

  useEffect(() => {
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    userService.getCoursesByUser(user.id)
      .then(courses => {
        const assignedCourseIds = courses.map(c => c.id);
        setLecturerCourses(courses);

        applicationService.getApplications(assignedCourseIds)
          .then(apps => {
            setApplications(apps);
          })
          .catch(() => console.error("Error fetching applications"));
      })
      .catch(() => {
        console.error("Error fetching user courses");
      });

    LecturerSelectionService.getSelectionsByLecturer(user.id)
      .then(sel => setSelections(sel))
      .catch(() => console.error("Error fetching selections"));
  }, [user]);

  const filteredApps = applications.filter(app => {
    if (app.status && app.status !== "Pending") return false;
    if (courseFilter && app.course.id.toString() !== courseFilter) return false;
    if (availabilityFilter && app.availability !== availabilityFilter) return false;
    if (sessionTypeFilter && app.role !== sessionTypeFilter) return false;

    if (
      candidateFilter &&
      !app.user.email.toLowerCase().includes(candidateFilter.toLowerCase())
    )
      return false;

    if (
      skillFilter &&
      !app.skills?.toLowerCase().includes(skillFilter.toLowerCase())
    )
      return false;

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

  const isSelected = (appId: number) =>
    selections.some(
      sel => sel.application.id === appId && sel.lecturer.id === user?.id
    );

  const toggleSelection = (app: Application) => {
    if (!user) return;

    const alreadySelected = selections.find(
      sel => sel.application.id === app.id && sel.lecturer.id === user.id
    );

    if (alreadySelected) {
      setSelections(prev => prev.filter(sel => sel.application.id !== app.id));
    } else {
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

  const handleSort = (field: "course" | "availability") => {
    if (sortBy === field) {
      setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleConfirmSelection = async () => {
    if (!user) return;

    try {
      for (const sel of selections) {
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
    } catch {
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
            {lecturerCourses.map(c => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Availability:
          <select value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)}>
            <option value="">All</option>
            {availabilityOptions.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label>
          Session Type:
          <select value={sessionTypeFilter} onChange={e => setSessionTypeFilter(e.target.value)}>
            <option value="">All</option>
            {sessionTypes.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
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