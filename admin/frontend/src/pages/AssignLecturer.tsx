import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, GET_COURSES, ASSIGN_LECTURER } from "../graphql/queries";
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

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturerId || !selectedCourseId) {
      alert("Please select both a lecturer and a course.");
      return;
    }
    await assignLecturer({ variables: { userId: selectedLecturerId, courseId: selectedCourseId } });
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
    </div>
  );
}
