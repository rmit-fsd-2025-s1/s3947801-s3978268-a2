import {
  GET_COURSES,
  CANDIDATES_WITH_MANY_COURSES,
  CANDIDATES_NEVER_SELECTED,
  SELECTED_CANDIDATES_BY_COURSE,
} from "../graphql/queries";
import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import styles from "../styles/CandidateReport.module.css";
import { Link } from "react-router-dom";

export default function CandidateReport() {
  const { data: courseData } = useQuery(GET_COURSES);
  const { data: manyCoursesData } = useQuery(CANDIDATES_WITH_MANY_COURSES, {
    variables: { minCourses: 3 },
  });
  const { data: notChosenData } = useQuery(CANDIDATES_NEVER_SELECTED);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Candidate Reports</h1>
        <Link to="/dashboard" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <div className={styles.section}>
        <h2>Chosen Candidates for Each Course</h2>
        {isMounted &&
          courseData?.courses.map((course: any) => (
            <CourseCandidates
              key={course.id}
              courseId={course.id}
              courseName={course.name}
            />
          ))}
      </div>

      <div className={styles.section}>
        <h2>Candidates Chosen for More Than 3 Courses</h2>
        <ul>
          {isMounted && manyCoursesData?.candidatesWithManyCourses.length ? (
            manyCoursesData.candidatesWithManyCourses.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))
          ) : (
            isMounted && (
              <li className={styles.empty}>No candidates found.</li>
            )
          )}
        </ul>
      </div>

      <div className={styles.section}>
        <h2>Candidates Not Chosen for Any Course</h2>
        <ul>
          {isMounted && notChosenData?.candidatesNeverSelected.length ? (
            notChosenData.candidatesNeverSelected.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))
          ) : (
            isMounted && (
              <li className={styles.empty}>No unchosen candidates.</li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

function CourseCandidates({
  courseId,
  courseName,
}: {
  courseId: string;
  courseName: string;
}) {
  const { data } = useQuery(SELECTED_CANDIDATES_BY_COURSE, {
    variables: { courseId },
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className={styles.card}>
      <h3>
        {courseName} ({courseId})
      </h3>
      <ul>
        {isMounted && data?.selectedCandidatesByCourse?.length ? (
          data.selectedCandidatesByCourse.map((user: any) => (
            <li key={user.id}>{user.email}</li>
          ))
        ) : (
          isMounted && (
            <li className={styles.empty}>
              No candidates selected for this course.
            </li>
          )
        )}
      </ul>
    </div>
  );
}
