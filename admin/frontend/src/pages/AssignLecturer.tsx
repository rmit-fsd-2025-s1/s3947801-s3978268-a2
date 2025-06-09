import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USERS,
  GET_COURSES,
  ASSIGN_LECTURER,
  UNASSIGN_LECTURER,
} from "../graphql/queries";
import styles from "../styles/AssignLecturer.module.css";
import { Link } from "react-router-dom";

export default function AssignLecturer() {
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const { data: lecturersData, refetch: refetchLecturers } = useQuery(GET_USERS, {
    variables: { accountType: "lecturer", blocked: false },
    fetchPolicy: "network-only",
  });

  const { data: coursesData, refetch: refetchCourses } = useQuery(GET_COURSES, {
    fetchPolicy: "network-only",
  });

  const [assignLecturer] = useMutation(ASSIGN_LECTURER, {
    onCompleted: async () => {
      alert("Lecturer assigned successfully!");
      setSelectedLecturerId("");
      setSelectedCourseId("");
      await refetchLecturers();
      await refetchCourses();
    },
    onError: (err) => alert("Failed to assign lecturer: " + err.message),
  });

  const [unassignLecturer] = useMutation(UNASSIGN_LECTURER, {
    onCompleted: async () => {
      alert("Lecturer unassigned successfully!");
      await refetchCourses();
    },
    onError: (err) => alert("Failed to unassign lecturer: " + err.message),
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturerId || !selectedCourseId) {
      alert("Please select both a lecturer and a course.");
      return;
    }
    await assignLecturer({
      variables: { userId: parseInt(selectedLecturerId), courseId: selectedCourseId },
    });
  };

  const handleUnassign = async (lecturerId: number, courseId: string) => {
    const confirmed = window.confirm("Are you sure you want to unassign this lecturer?");
    if (!confirmed) return;
    await unassignLecturer({
      variables: {
        userId: Number(lecturerId),  
        courseId: String(courseId),  
      },
    });

  };

  useEffect(() => {
    refetchLecturers();
    refetchCourses();
  }, [refetchLecturers, refetchCourses]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Assign Lecturer to Course</h1>
        <Link to="/dashboard" className="nav-btn">
          ← Back to Dashboard
        </Link>
      </header>

      <form onSubmit={handleAssign} className={styles.form}>
        <label>
          Select Lecturer:
          <select
            value={selectedLecturerId}
            onChange={(e) => setSelectedLecturerId(e.target.value)}
            className={styles.dropdown}
          >
            <option value="">-- Choose a Lecturer --</option>
            {lecturersData?.users.map((lec: any) => (
              <option key={lec.id} value={lec.id}>
                {lec.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          Select Course:
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className={styles.dropdown}
          >
            <option value="">-- Choose a Course --</option>
            {coursesData?.courses.map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className={styles.button}>
          Assign
        </button>
      </form>

      <div className={styles.assignmentTable}>
        <h2>Current Lecturer Assignments</h2>
        {coursesData?.courses.map((course: any) => (
          <div key={course.id} className={styles.courseBlock}>
            <h3>{course.name}</h3>
            <ul>
              {course.lecturers?.length > 0 ? (
                course.lecturers.map((lec: any) => (
                  <li key={lec.id}>
                    {lec.email}
                    <button
                      onClick={() => handleUnassign(lec.id, course.id)}
                      className={styles.unassignBtn}
                    >
                      Unassign
                    </button>
                  </li>
                ))
              ) : (
                <li>No lecturers assigned</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
