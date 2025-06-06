import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_COURSES,
  GET_USERS,
  GET_LECTURERS_BY_COURSE,
  ADD_COURSE,
  EDIT_COURSE,
  DELETE_COURSE,
} from "../graphql/queries";
import styles from "../styles/CourseManagement.module.css";
import { Link } from "react-router-dom";

export default function CourseManagement() {
  const { data: courseData, refetch: refetchCourses } = useQuery(GET_COURSES);
  const { data: userData } = useQuery(GET_USERS, { variables: { accountType: "lecturer" } });
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const { data: lecturersByCourseData, refetch: refetchLecturersByCourse } = useQuery(
    GET_LECTURERS_BY_COURSE,
    {
      skip: !selectedCourse,
      variables: { courseId: selectedCourse },
    }
  );
  
  const [addCourse] = useMutation(ADD_COURSE);
  const [editCourse] = useMutation(EDIT_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);

  const [newCourseId, setNewCourseId] = useState("");
  const [newCourseName, setNewCourseName] = useState("");

  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const toggleViewLecturers = async (courseId: string) => {
    if (selectedCourse === courseId) {
      setSelectedCourse(null);
    } else {
      setSelectedCourse(courseId);
      await refetchLecturersByCourse({courseId});
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseId || !newCourseName) {
      alert("Please enter both course ID and name.");
      return;
    }
    try {
      await addCourse({ variables: { id: newCourseId, name: newCourseName } });
      setNewCourseId("");
      setNewCourseName("");
      await refetchCourses();
      alert("Course added successfully!");
    } catch (err: any) {
      alert("Failed to add course: " + err.message);
    }
  };

  const handleEditCourse = async (oldId: string, currentName: string) => {
    const newId = prompt("Enter new Course ID:", oldId)?.trim();
    const newName = prompt("Enter new Course Name:", currentName)?.trim();
    
    if (newId === null || newName === null) return;
    if (newId === oldId && newName === currentName) return;
    
    try {
      await editCourse({
        variables: {
          oldId,
          newId,
          name: newName,
        },
      });
      await refetchCourses();
      alert("Course updated.");
    } catch (err: any) {
      alert("Failed to update course: " + err.message);
    }
  };

  const performDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse({ variables: { id: courseToDelete } });
      await refetchCourses();
      alert("Course deleted.");
    } catch (err: any) {
      alert("Failed to delete course: " + err.message);
    } finally {
      setCourseToDelete(null);
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

      <section className={styles.addCourseSection}>
        <h2>Add New Course</h2>
        <input
          type="text"
          placeholder="Course ID"
          value={newCourseId}
          onChange={(e) => setNewCourseId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Course Name"
          value={newCourseName}
          onChange={(e) => setNewCourseName(e.target.value)}
        />
        <button onClick={handleAddCourse}>Add Course</button>
      </section>

      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeader}>
            <th>Course ID</th>
            <th>Course Name</th>
            <th>Lecturers</th>
            <th>Actions</th>
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
                <td>
                  <button onClick={() => handleEditCourse(course.id, course.name)}>Edit</button>
                  <button onClick={() => setCourseToDelete(course.id)}>Delete</button>
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

      {courseToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Are you sure you want to delete this course?</p>
            <div className={styles.modalActions}>
              <button onClick={performDelete}>Yes, Delete</button>
              <button onClick={() => setCourseToDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}