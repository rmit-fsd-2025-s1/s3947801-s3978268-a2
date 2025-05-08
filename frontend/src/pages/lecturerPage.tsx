import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Applicant, ChosenApplicant } from "../types/applicant";
import { useApplicant } from "../context/ApplicantContext";
import { useAuth } from "@/context/AuthContext";

export default function LecturerPage() {
  const { getApplicant, selectApplicant } = useApplicant();
  const router = useRouter();
  const { user } = useAuth();
  const currentLecturer = user ? user.username : "Anonymous";
  const searchQuery = ((router.query.search as string) || "").toLowerCase();

  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [chosenApplicants, setChosenApplicants] = useState<ChosenApplicant[]>([]);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("");
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState<string>("");

  const [courseDropdownOpen, setCourseDropdownOpen] = useState<boolean>(false);
  const [availabilityDropdownOpen, setAvailabilityDropdownOpen] = useState<boolean>(false);

  const [sortedCourses, setSortedCourses] = useState<string[]>([]);
  const availabilityOptions = ["Full Time", "Part Time"];

  // Load & filter applicants
  const loadApplicants = () => {
    const applicants = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant[];
    const chosen = JSON.parse(localStorage.getItem("chosenApplicants") || "[]") as ChosenApplicant[];
  
    const visible = applicants.filter(app => {
      const record = chosen.find(r => r.applicant.id === app.id);
      const selectedByLecturer = record?.selections.find(sel => sel.lecturerName === currentLecturer);
      return !selectedByLecturer; // Only show if this lecturer hasn't selected this applicant
    });
  
    const uniqueCourses = Array.from(new Set(visible.map(a => a.courseName)));
    uniqueCourses.sort((a, b) => a.localeCompare(b));
    setSortedCourses(uniqueCourses);
    setAllApplicants(visible);
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  useEffect(() => {
    // If the user is not a lecturer, redirect to home or login
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user]);

  useEffect(() => {
    let result = [...allApplicants];

    if (searchQuery) {
      result = getApplicant(searchQuery) || [];
    }
    if (selectedCourseFilter) {
      result = result.filter(app => app.courseName === selectedCourseFilter);
    }
    if (selectedAvailabilityFilter) {
      result = result.filter(app => app.availability === selectedAvailabilityFilter);
    }

    setFilteredApplicants(result);
  }, [allApplicants, searchQuery, selectedCourseFilter, selectedAvailabilityFilter, getApplicant]);

  const handleSelection = (applicant: Applicant) => {
    const recordIndex = chosenApplicants.findIndex(record => record.applicant.id === applicant.id);

    if (recordIndex === -1) {
        // No record exists for this applicant yet.
        const newRecord: ChosenApplicant = {
          applicant,
          selections: [
            {
              lecturerName: currentLecturer,
              lecturerComment: "",
              lecturerRank: ""
            }
          ]
        };
        setChosenApplicants(prev => [...prev, newRecord]);
      } else {
        // Applicant record exists.
        const currentRecord = chosenApplicants[recordIndex];
        const selectionIndex = currentRecord.selections.findIndex(
          sel => sel.lecturerName === currentLecturer
        );
  
        if (selectionIndex === -1) {
          // The current lecturer hasn't selected this applicant yet. Append their selection.
          const updatedSelections = [
            ...currentRecord.selections,
            {
              lecturerName: currentLecturer,
              lecturerComment: "",
              lecturerRank: ""
            }
          ];
          const updatedRecord: ChosenApplicant = { ...currentRecord, selections: updatedSelections };
          setChosenApplicants(prev => {
            const newRecords = [...prev];
            newRecords[recordIndex] = updatedRecord;
            return newRecords;
          });
        } else {
          // The current lecturer already selected this applicant: toggle removal.
          const updatedSelections = currentRecord.selections.filter(
            sel => sel.lecturerName !== currentLecturer
          );
          if (updatedSelections.length === 0) {
            // Remove the entire record if no selections remain.
            setChosenApplicants(prev => prev.filter(record => record.applicant.id !== applicant.id));
          } else {
            const updatedRecord: ChosenApplicant = { ...currentRecord, selections: updatedSelections };
            setChosenApplicants(prev => {
              const newRecords = [...prev];
              newRecords[recordIndex] = updatedRecord;
              return newRecords;
            });
          }
        }
      }
    };

  const handleConfirmSelection = () => {
    chosenApplicants.forEach(a => selectApplicant(a));
    router.push("/successfulCandidatePage");
  };

  const handleReject = (id: string) => {
    if (!window.confirm("Are you sure you want to reject this applicant?")) return;

    let storedApps = JSON.parse(localStorage.getItem("applications") || "[]") as Applicant[];
    storedApps = storedApps.map(app =>
      app.id === id && (!app.status || app.status === "Pending")
        ? { ...app, status: "Rejected" }
        : app
    );
    localStorage.setItem("applications", JSON.stringify(storedApps));

    let storedApplicants = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant[];
    storedApplicants = storedApplicants.filter(app => app.id !== id);
    localStorage.setItem("applicants", JSON.stringify(storedApplicants));

    loadApplicants(); // refresh visible
  };

  return (
    <div className="header">
      <h1>Applicants</h1>

      <div className="header">
        <span className="sort-label">Sort by:</span>

        {/* Course Filter */}
        <div className="dropdown-wrapper">
          <button onClick={() => setCourseDropdownOpen(!courseDropdownOpen)} className="dropdown-toggle">
            Course: {selectedCourseFilter || "All"}
          </button>
          {courseDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedCourseFilter(""); setCourseDropdownOpen(false); }} className="dropdown-item">All</button>
              {sortedCourses.map(course => (
                <button key={course} onClick={() => { setSelectedCourseFilter(course); setCourseDropdownOpen(false); }} className="dropdown-item">{course}</button>
              ))}
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="dropdown-wrapper">
          <button onClick={() => setAvailabilityDropdownOpen(!availabilityDropdownOpen)} className="dropdown-toggle">
            Availability: {selectedAvailabilityFilter || "All"}
          </button>
          {availabilityDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedAvailabilityFilter(""); setAvailabilityDropdownOpen(false); }} className="dropdown-item">All</button>
              {availabilityOptions.map(option => (
                <button key={option} onClick={() => { setSelectedAvailabilityFilter(option); setAvailabilityDropdownOpen(false); }} className="dropdown-item">{option}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filteredApplicants.length === 0 ? (
        <p>No Matching Applicants Found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Tutor Name</th>
              <th>Course Name</th>
              <th>Availability</th>
              <th>Skills</th>
              <th>Academic Credentials</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map(app => (
              <tr key={app.id}>
                <td>
                  <button className="select-button" onClick={() => handleSelection(app)}>
                    {chosenApplicants.some(a => a.applicant.id === app.id) ? "Undo" : "Select"}
                  </button>
                </td>
                <td>{app.tutorName}</td>
                <td>{app.courseName}</td>
                <td>{app.availability}</td>
                <td>{app.role === "Tutor" ? app.skills : "N/A"}</td>
                <td>{app.role === "Tutor" ? app.academicCredentials : "N/A"}</td>
                <td>{app.status || "Pending"}</td>
                <td>
                  {(!app.status || app.status === "Pending") && (
                    <button className="select-button" onClick={() => handleReject(app.id)}>Reject</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div>
        <button className="confirm-button" onClick={handleConfirmSelection}>Confirm Selection</button>
      </div>
    </div>
  );
}
