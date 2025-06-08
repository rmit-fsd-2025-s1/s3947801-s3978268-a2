import {
    CANDIDATES_BY_COURSE,
    CANDIDATES_WITH_MANY_COURSES,
    CANDIDATES_NOT_CHOSEN,
    GET_COURSES,
} from "../graphql/queries";
import React from "react";
import { useQuery } from "@apollo/client";
import styles from "../styles/CandidateReport.module.css";
import { Link } from "react-router-dom";

export default function CandidateReport() {
  const { data: courseData } = useQuery(GET_COURSES);
  const { data: manyCoursesData } = useQuery(CANDIDATES_WITH_MANY_COURSES);
  const { data: notChosenData } = useQuery(CANDIDATES_NOT_CHOSEN);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Candidate Reports</h1>
        <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>
      </header>

      <div className={styles.section}>
        <h2>Chosen Candidates for Each Course</h2>
        {courseData?.courses.map((course: any) => (
          <CourseCandidates key={course.id} courseId={course.id} courseName={course.name} />
        ))}
      </div>

      <div className={styles.section}>
        <h2>Candidates Chosen for More Than 3 Courses</h2>
        <ul>
          {manyCoursesData?.candidatesWithManyCourses.length ? (
            manyCoursesData.candidatesWithManyCourses.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))
          ) : (
            <li className={styles.empty}>No candidates found.</li>
          )}
        </ul>
      </div>

      <div className={styles.section}>
        <h2>Candidates Not Chosen for Any Course</h2>
        <ul>
          {notChosenData?.candidatesNotChosen.length ? (
            notChosenData.candidatesNotChosen.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))
          ) : (
            <li className={styles.empty}>No unchosen candidates.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function CourseCandidates({ courseId, courseName }: { courseId: string; courseName: string }) {
  const { data } = useQuery(CANDIDATES_BY_COURSE, { variables: { courseId } });

  return (
    <div className={styles.card}>
      <h3>{courseName} ({courseId})</h3>
      <ul>
        {data?.candidatesByCourse?.length ? (
          data.candidatesByCourse.map((user: any) => (
            <li key={user.id}>{user.email}</li>
          ))
        ) : (
          <li className={styles.empty}>No candidates selected for this course.</li>
        )}
      </ul>
    </div>
  );
}