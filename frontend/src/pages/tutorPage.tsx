import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import router from "next/router";

const TutorPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    role: "",
    courseCode: "",      // Selected course code
    previousRoles: "",   // We'll map this to "previousRole"
    availability: "",
    skills: "",
    academicCredentials: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If the user is not a tutor, redirect to home or login
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user]);


  // Define courses with both name and code.
  const courses = [
    { code: "COSC1234", name: "Full Stack Development" },
    { code: "COSC5678", name: "Machine Learning" },
    { code: "COSC9101", name: "Data Science" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    const courseCodeRegex = /^COSC\d{4}$/;
    return (
      formData.role &&
      courseCodeRegex.test(formData.courseCode) &&
      formData.previousRoles.trim() &&
      formData.availability &&
      formData.skills.trim() &&
      formData.academicCredentials.trim()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInputs()) {
      // Find the selected course object from courses array
      const selectedCourse = courses.find(
        (course) => course.code === formData.courseCode
      );
      // If found, construct the display string; otherwise, fallback to the code
      const storedCourseName = selectedCourse
        ? `${selectedCourse.name} - ${selectedCourse.code}`
        : formData.courseCode;

      // Create a new application object
      const newApplication = {
        id: Date.now().toString(), // a unique id based on timestamp
        tutorName: user ? user.username : "Unknown Tutor",
        role: formData.role,
        // Save the full course string in courseName
        courseName: storedCourseName,
        previousRole: formData.previousRoles,
        availability: formData.availability,
        skills: formData.skills,
        academicCredentials: formData.academicCredentials,
        status: "Pending",
      };

      // Save new application to "applications" list in localStorage
      const storedApps = JSON.parse(localStorage.getItem("applications") || "[]");
      storedApps.push(newApplication);
      localStorage.setItem("applications", JSON.stringify(storedApps));

      // Also add the new application to "applicants" list (for lecturers to see)
      const storedApplicants = JSON.parse(localStorage.getItem("applicants") || "[]");
      storedApplicants.push(newApplication);
      localStorage.setItem("applicants", JSON.stringify(storedApplicants));

      setMessage("Application submitted successfully!");

      // Clear form fields
      setFormData({
        role: "",
        courseCode: "",
        previousRoles: "",
        availability: "",
        skills: "",
        academicCredentials: "",
      });
    } else {
      alert("Please ensure all inputs are valid.");
    }
  };

  return (
    <div id="tutor-page" className="main-container">
      <h2>Apply for Tutor and Lab Assistant Roles</h2>
      {message && <div className="success-message">{message}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select name="role" id="role" value={formData.role} onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="Tutor">Tutor</option>
            <option value="Lab Assistant">Lab Assistant</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="courseCode">Course Code:</label>
          <select name="courseCode" id="courseCode" value={formData.courseCode} onChange={handleChange}>
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.code} value={course.code}>
                {course.name} - {course.code}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="previousRoles">Previous Roles:</label>
          <textarea
            name="previousRoles"
            id="previousRoles"
            value={formData.previousRoles}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="availability">Availability:</label>
          <select name="availability" id="availability" value={formData.availability} onChange={handleChange}>
            <option value="">Select Availability</option>
            <option value="Part Time">Part Time</option>
            <option value="Full Time">Full Time</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="skills">Skills:</label>
          <textarea name="skills" id="skills" value={formData.skills} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="academicCredentials">Academic Credentials:</label>
          <textarea
            name="academicCredentials"
            id="academicCredentials"
            value={formData.academicCredentials}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default TutorPage;
