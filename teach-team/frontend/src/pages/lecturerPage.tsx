import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { applicationService, LecturerSelectionService, userService } from "../services/api";
import { Application, LecturerSelection, Course } from "../types/types";
import { useSubscription } from "@apollo/client";
import { CANDIDATE_STATUS_CHANGED_SUBSCRIPTION } from "@/graphql/subscriptions";
import { toast } from "react-toastify";

export default function LecturerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selections, setSelections] = useState<LecturerSelection[]>([]);
  const [lecturerCourses, setLecturerCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState({
    course: "",
    availability: "",
    candidate: "",
    skill: "",
    session: "",
  });
  const [sortBy, setSortBy] = useState<"course" | "availability" | "">("");
  const [sortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  const { data: statusChangedData } = useSubscription(CANDIDATE_STATUS_CHANGED_SUBSCRIPTION);

  useEffect(() => {
    if (!user || user.accountType !== "lecturer") router.push("/");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    userService.getCoursesByUser(user.id)
      .then(courses => {
        console.log("Courses fetched for lecturer:", courses);
        setLecturerCourses(courses);
        const ids = courses.map(c => c.id);
        return applicationService.getApplications(ids);
      })
      .then(apps => setApplications(apps))
      .catch(() => console.error("Error fetching data"))
      .finally(() => setLoading(false));

    LecturerSelectionService.getSelectionsByLecturer(user.id)
      .then(setSelections)
      .catch(() => console.error("Error fetching selections"));
  }, [user]);

  useEffect(() => {
    if (statusChangedData?.candidateStatusChanged) {
      const updatedUser = statusChangedData.candidateStatusChanged;

      setApplications(prev =>
        prev.map(app =>
          app.user.id === updatedUser.id
            ? { ...app, user: { ...app.user, blocked: updatedUser.blocked } }
            : app
        )
      );

      if (user) {
        userService.getCoursesByUser(user.id)
          .then(courses => {
            const ids = courses.map(c => c.id);
            return applicationService.getApplications(ids);
          })
          .then(apps => {
            console.log("Applications fetched for courses:", apps);
            console.log("🔍 All applications fetched for lecturer:", apps);
            console.log("🧑‍🎓 Unique candidates:", [...new Set(apps.map(a => a.user.id))]);

            setApplications(apps);
          })
          .catch(() => console.error("Error refetching after status change"));
      }

      const message = updatedUser.blocked
        ? `${updatedUser.email} has been blocked and is no longer available.`
        : `${updatedUser.email} has been unblocked and is now available.`;

      toast.info(message);
    }
  }, [statusChangedData]);

  const filteredApps = applications.filter(app => {
    if (app.status?.trim().toLowerCase() !== "pending") return false;
    if (filters.course && app.course.id.toString() !== filters.course) return false;
    if (filters.availability && app.availability !== filters.availability) return false;
    if (filters.session && app.role !== filters.session) return false;
    if (filters.candidate && !app.user.email.toLowerCase().includes(filters.candidate.toLowerCase())) return false;
    if (filters.skill && !app.skills?.toLowerCase().includes(filters.skill.toLowerCase())) return false;
    return true;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (sortBy === "course") {
      return sortDirection === "asc"
        ? a.course.name.localeCompare(b.course.name)
        : b.course.name.localeCompare(a.course.name);
    }
    if (sortBy === "availability") {
      return sortDirection === "asc"
        ? (a.availability ?? "").localeCompare(b.availability ?? "")
        : (b.availability ?? "").localeCompare(a.availability ?? "");
    }
    return 0;
  });

  const isSelected = (appId: number) =>
    selections.some(sel => sel.application.id === appId && sel.lecturer.id === user?.id);

  const toggleSelection = (app: Application) => {
    if (!user || app.user.blocked) return;

    const existing = selections.find(
      sel => sel.application.id === app.id && sel.lecturer.id === user.id
    );

    setSelections(prev =>
      existing
        ? prev.filter(sel => sel.application.id !== app.id)
        : [...prev, { id: 0, application: app, lecturer: user, rank: "", comment: "" }]
    );
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
      alert("Error confirming selections.");
    }
  };

  const availabilityOptions = ["Full Time", "Part Time"];
  const sessionTypes = ["tutor", "lab assistant"];

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="lecturer-header">Applicants</h1>

      <div className="sort-container">
        <label>
          Course:
          <select value={filters.course} onChange={e => setFilters(f => ({ ...f, course: e.target.value }))}>
            <option value="">All</option>
            {lecturerCourses.map(c => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          Availability:
          <select value={filters.availability} onChange={e => setFilters(f => ({ ...f, availability: e.target.value }))}>
            <option value="">All</option>
            {availabilityOptions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>

        <label>
          Session Type:
          <select value={filters.session} onChange={e => setFilters(f => ({ ...f, session: e.target.value }))}>
            <option value="">All</option>
            {sessionTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label>
          Candidate:
          <input value={filters.candidate} onChange={e => setFilters(f => ({ ...f, candidate: e.target.value }))} />
        </label>

        <label>
          Skills:
          <input value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} />
        </label>
      </div>

      <div className="confirm-button-container">
        <button className="confirm-btn" onClick={handleConfirmSelection}>
          Confirm Selections
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Candidate</th>
            <th onClick={() => setSortBy("course")}>Course</th>
            <th onClick={() => setSortBy("availability")}>Availability</th>
            <th>Skills</th>
            <th>Credentials</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedApps.map(app => (
            <tr key={app.id} className={app.user.blocked ? "blocked-row" : ""}>
              <td>
                <button
                  className="select-button"
                  onClick={() => toggleSelection(app)}
                  disabled={app.user.blocked}
                >
                  {isSelected(app.id) ? "Undo" : "Select"}
                </button>
              </td>
              <td>
                {app.user.email}
                {app.user.blocked && <span className="unavailable-label">(Unavailable)</span>}
              </td>
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
