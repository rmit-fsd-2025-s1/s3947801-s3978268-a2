import React, { useState, useEffect } from "react";
import {useApplicant} from "../context/ApplicantContext";
import { useRouter } from "next/router";
import { Applicant, ChosenApplicant, LecturerSelection } from "../types/applicant";
import { useAuth } from "../context/AuthContext";

export default function SuccessfulCandidatePage() {
    const {chosenApplicant, getChosenApplicant, selectApplicant} = useApplicant();
    const router = useRouter();
    const { user } = useAuth();
    const currentLecturer = user ? user.email : "Anonymous";
    const [filteredCourse, setFilteredCourse] = useState<string | null>(null);
    const [courseNames, setCourseNames] = useState<string[]>([]);
    const [chosenApplicants, setChosenApplicants] = useState<ChosenApplicant[]>([]);
    const [allChosenApplicants, setAllChosenApplicants] = useState<ChosenApplicant[]>([]);
    const [completedCourses, setCompletedCourses] = useState<string[]>([]);

    useEffect(() => {
      // If the user is not a lecturer, redirect to home or login
      if (!user || user.accountType !== "lecturer") {
        router.push("/");
      }
    }, [user]);

    useEffect(() => {
        const storedApplicants = (JSON.parse(localStorage.getItem("chosenApplicants") || "[]") as ChosenApplicant[])
          .map(record => ({ ...record, selections: record.selections || [] }));
        
        setAllChosenApplicants(storedApplicants);
      }, []);

      useEffect(() => {
        // Compute the available (not-completed) courses
        const uniqueCourseNames = [
          ...new Set(allChosenApplicants.map(record => record.applicant.courseName))
        ].filter(course => !completedCourses.includes(course));
        setCourseNames(uniqueCourseNames);
      }, [allChosenApplicants, completedCourses]);
      
      useEffect(() => {
        // Filter the chosen applicants by the currently selected course, 
        //  unless it's completed or not chosen at all.
        if (!filteredCourse || completedCourses.includes(filteredCourse)) {
          setChosenApplicants([]);
          return;
        }
        const filtered = allChosenApplicants.filter(
          (record) => record.applicant.courseName === filteredCourse
        );
        setChosenApplicants(filtered);
      }, [filteredCourse, allChosenApplicants, completedCourses]);

    const handleCourseFilter = (course: string) => {
        setFilteredCourse(course);
        router.push(router.pathname);
      };


      const handleRankAndComment = (chosenApplicantId: string, rank: string, lecturerComment: string) => {
        // Find the current record for the applicant.
        const record = allChosenApplicants.find(
          rec => rec.applicant.id === chosenApplicantId
        );
        if (!record) return;
    
        // See if there's already a selection by the current lecturer.
        const existingSelection = record.selections?.find(
          sel => sel.lecturerName === currentLecturer
        );
        let updatedSelection: LecturerSelection;
        if (existingSelection) {
          // Update the existing selection.
          updatedSelection = {
            ...existingSelection,
            lecturerRank: rank,
            lecturerComment: lecturerComment
          };
        } else {
          // Create a new selection.
          updatedSelection = {
            lecturerName: currentLecturer,
            lecturerRank: rank,
            lecturerComment: lecturerComment
          };
        }
    
        // Create the new selections array:
        const newSelections = (record.selections || []).filter(
          sel => sel.lecturerName !== currentLecturer
        ).concat(updatedSelection);
    
        // Update that record in allChosenApplicants:
        setAllChosenApplicants(prev => {
          return prev.map(rec => {
            if (rec.applicant.id === chosenApplicantId) {
              return { ...rec, selections: newSelections };
            }
            return rec;
          });
        });
      };
    
      const filteredChosenApplicants = chosenApplicants.filter(
        record => record.applicant.courseName === filteredCourse
      );
    
      const handleConfirmSelection = () => {
        const allRecordsForCourse = allChosenApplicants.filter(
          (record) => record.applicant.courseName === filteredCourse
        );
      
        // Get all selections made by this lecturer in this course
        const lecturerSelections = allRecordsForCourse.map(record =>
          record.selections?.find(sel => sel.lecturerName === currentLecturer)
        );
      
        // Check: Did they rank all applicants?
        const hasMissing = lecturerSelections.some(sel => !sel || sel.lecturerRank === "");
        const ranks = lecturerSelections.map(sel => sel?.lecturerRank).filter(Boolean);
        const uniqueRanks = new Set(ranks);
      
        if (hasMissing || ranks.length !== uniqueRanks.size) {
          alert(
            `Error: You must assign a unique, non-empty rank to each of the ${allRecordsForCourse.length} applicants before confirming.`
          );
          return;
        }
      
        // Passed all checks — safe to save
        localStorage.setItem("chosenApplicants", JSON.stringify(allChosenApplicants));
        setCompletedCourses(prev => [...prev, filteredCourse!]);
      
        const remainingCourses = courseNames.filter(course => course !== filteredCourse);
        setCourseNames(remainingCourses);
      
        if (remainingCourses.length === 0) {
          router.push("/");
        } else {
          setFilteredCourse(remainingCourses[0]);
        }
      };               


    return (
        <div>
          <div className="header">
            <h1>Successful Applicants</h1>
            <h3>Filter By:</h3>
            <div className="course-keys">
              {courseNames.map(course => (
                <button
                  key={course}
                  onClick={() => handleCourseFilter(course)}
                  className="course-button"
                >
                  {course}
                </button>
              ))}
            </div>
          </div>
          <div>
            {chosenApplicants.length === 0 ? (
              <p>No Matching Applicants Found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Tutor Name</th>
                    <th>Course Name</th>
                    <th>Availability</th>
                    <th>Skills</th>
                    <th>Academic Credentials</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChosenApplicants.map(record => (
                    <tr key={record.applicant.id}>
                      <td>
                        <select
                          className="rank-dropdown"
                          // Here we display the current lecturer’s rank if available.
                          value={
                            record.selections?.find(
                              sel => sel.lecturerName === currentLecturer
                            )?.lecturerRank || ""
                          }
                          onChange={e =>
                            handleRankAndComment(
                              record.applicant.id,
                              e.target.value,
                              // Preserve any current comment by the lecturer.
                              record.selections?.find(
                                sel => sel.lecturerName === currentLecturer
                              )?.lecturerComment || ""
                            )
                          }
                        >
                          <option value="">Rank</option>
                          {(() => {
                            const options = [];
                            for (let i = 1; i <= filteredChosenApplicants.length; i++) {
                              options.push(
                                <option key={i} value={String(i)}>
                                  {i}
                                </option>
                              );
                            }
                            return options;
                          })()}
                        </select>
                      </td>
                      <td>{record.applicant.tutorName}</td>
                      <td>{record.applicant.courseName}</td>
                      <td>{record.applicant.availability}</td>
                      <td>{record.applicant.role === "Tutor" ? record.applicant.skills : ""}</td>
                      <td>
                        {record.applicant.role === "Tutor" ? record.applicant.academicCredentials : ""}
                      </td>
                      <td>
                        <input
                          // Display the current lecturer’s comment (if any)
                          value={
                            record.selections?.find(
                              sel => sel.lecturerName === currentLecturer
                            )?.lecturerComment || ""
                          }
                          onChange={(e) =>
                            handleRankAndComment(
                              record.applicant.id,
                              record.selections?.find(
                                sel => sel.lecturerName === currentLecturer
                              )?.lecturerRank || "",
                              e.target.value
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div>
              <button className="confirm-button" onClick={handleConfirmSelection}>
                Confirm Rank
              </button>
            </div>
          </div>
        </div>
      );
}
