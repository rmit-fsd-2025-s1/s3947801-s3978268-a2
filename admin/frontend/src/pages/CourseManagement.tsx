import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_COURSES,
  GET_USERS,
  GET_LECTURERS_BY_COURSE,
  ASSIGN_LECTURER,
} from "../graphql/queries";
import styles from "../styles/CourseManagement.module.css";
import { Link } from "react-router-dom";

export default function CourseManagement() {
  const { data: courseData } = useQuery(GET_COURSES);
  const { data: userData } = useQuery(GET_USERS, { variables: { accountType: "lecturer" } });
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const { data: lecturersByCourseData, refetch: refetchLecturersByCourse } = useQuery(
    GET_LECTURERS_BY_COURSE,
    {
      skip: !selectedCourse,
      variables: { courseId: selectedCourse },
    }
  );


  const toggleViewLecturers = async (courseId: string) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
    } else {
      setSelectedCourse(courseId);
      await refetchLecturersByCourse({courseId});
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Course Management</h1>
        <Link to="/dashboard" className="nav-btn">
          ← Back to Dashboard
        </Link>
      </header>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeader}>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>View Lecturers</th>
          </tr>
        </thead>
        <tbody>
          {courseData?.courses?.map((course: any) => (
            <React.Fragment key={course.id}>
              <tr>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>
                  <button
                    onClick={() => toggleViewLecturers(course.id)}
                    className={styles.viewLecturersButton}
                  >
                    {selectedCourse === course.id ? "Hide" : "View"}
                  </button>
                </td>
              </tr>
              {selectedCourse === course.id && (
                <tr>
                  <td colSpan={4} className={styles.assignedLecturersContainer}>
                    <strong>Lecturers Assigned:</strong>
                    <ul className={styles.assignedLecturersList}>
                      {lecturersByCourseData?.lecturersByCourse?.length > 0 ? (
                        lecturersByCourseData.lecturersByCourse.map((lecturer: any) => (
                          <li key={lecturer.id}>{lecturer.email}</li>
                        ))
                      ) : (
                        <li>No lecturers assigned yet.</li>
                      )}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
