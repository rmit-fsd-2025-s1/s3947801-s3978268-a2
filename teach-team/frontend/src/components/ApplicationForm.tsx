import React, { useState, useEffect } from "react";
import axios from "axios";

interface ApplicationFormProps {
  userId: number;
  courses: { id: string; name: string }[];
}

export default function ApplicationForm({ userId, courses }: ApplicationFormProps) {
  const [courseId, setCourseId] = useState<string>("");
  const [role, setRole] = useState("candidate");
  const [previousRole, setPreviousRole] = useState("");
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState("");
  const [academicCredentials, setAcademicCredentials] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses]);

  const wordCount = (text: string) => text.trim().split(/\s+/).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      setErrorMsg("Please select a course before submitting.");
      return;
    }

    if (
      wordCount(previousRole) > 100 ||
      wordCount(availability) > 100 ||
      wordCount(skills) > 100 ||
      wordCount(academicCredentials) > 100
    ) {
      setErrorMsg("Each field must be under 100 words.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/applications", {
        userId,
        courseId,
        role,
        previousRole,
        availability,
        skills,
        academicCredentials,
        status: "Submitted",
      });

      setSuccessMsg("Application submitted successfully!");
      setErrorMsg("");
    } catch {
      setErrorMsg("Error submitting application. Possibly duplicate or server error.");
      setSuccessMsg("");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="application-form">
        <h2>Application Form</h2>

        {successMsg && <div className="success-msg">{successMsg}</div>}
        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        <label htmlFor="course">Course</label>
        <select
          id="course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
        >
          {courses.length === 0 ? (
            <option disabled value="">
              No courses available
            </option>
          ) : (
            courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))
          )}
        </select>

        <label htmlFor="role">Role</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="candidate">Candidate</option>
          <option value="lab assistant">Lab Assistant</option>
        </select>

        <label htmlFor="previousRole">Previous Role</label>
        <textarea
          id="previousRole"
          maxLength={1000}
          rows={4}
          value={previousRole}
          onChange={(e) => setPreviousRole(e.target.value)}
        />
        <small>{wordCount(previousRole)} / 100 words</small>

        <label htmlFor="availability">Availability</label>
        <textarea
          id="availability"
          maxLength={1000}
          rows={4}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
        <small>{wordCount(availability)} / 100 words</small>

        <label htmlFor="skills">Skills</label>
        <textarea
          id="skills"
          maxLength={1000}
          rows={4}
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />
        <small>{wordCount(skills)} / 100 words</small>

        <label htmlFor="academicCredentials">Academic Credentials</label>
        <textarea
          id="academicCredentials"
          maxLength={1000}
          rows={4}
          value={academicCredentials}
          onChange={(e) => setAcademicCredentials(e.target.value)}
        />
        <small>{wordCount(academicCredentials)} / 100 words</small>

        <button type="submit" className="submit-application-button">
          Submit Application
        </button>
      </form>
    </div>
  );
}
