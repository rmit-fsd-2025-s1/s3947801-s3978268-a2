import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ApplicationFormProps {
  userId: number;
  courses: { id: string; name: string }[];
}

export default function ApplicationForm({ userId, courses }: ApplicationFormProps) {
  const [courseId, setCourseId] = useState<string>("");
  const [role, setRole] = useState("tutor");
  const [previousRole, setPreviousRole] = useState("");
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState("");
  const [academicCredentials, setAcademicCredentials] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (courses.length > 0) {
      setCourseId(courses[0].id);
    }
  }, [courses]);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const validateField = (name: string, value: string) => {
    let message = "";
    if (!value.trim()) {
      message = "This field is required.";
    } else if (name !== "availability" && wordCount(value) > 100) {
      message = "Must be under 100 words.";
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
    return message === "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanedPreviousRole = previousRole.trim();
    const cleanedAvailability = availability.trim();
    const cleanedSkills = skills.trim();
    const cleanedAcademicCredentials = academicCredentials.trim();

    const allValid =
      validateField("previousRole", cleanedPreviousRole) &&
      validateField("availability", cleanedAvailability) &&
      validateField("skills", cleanedSkills) &&
      validateField("academicCredentials", cleanedAcademicCredentials);

    if (!courseId) {
      toast.error("Please select a course.");
      setIsSubmitting(false);
      return;
    }

    if (!allValid) {
      toast.error("Please ensure all fields are valid before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/applications", {
        userId,
        courseId,
        role,
        previousRole: cleanedPreviousRole,
        availability,
        skills: cleanedSkills,
        academicCredentials: cleanedAcademicCredentials,
      });

      toast.success("Application submitted successfully!");
      setErrors({});
      setPreviousRole("");
      setAvailability("");
      setSkills("");
      setAcademicCredentials("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "Error submitting application. Possibly duplicate or server error.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="application-form">
        <h2>Application Form</h2>

        <label htmlFor="course">Course</label>
        <select
          id="course"
          value={courseId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCourseId(e.target.value)}
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
          <option value="tutor">Tutor</option>
          <option value="lab assistant">Lab Assistant</option>
        </select>

        <label htmlFor="previousRole">Previous Role</label>
        <textarea
          id="previousRole"
          rows={4}
          value={previousRole}
          onChange={(e) => {
            setPreviousRole(e.target.value);
            validateField("previousRole", e.target.value);
          }}
        />
        <small>{wordCount(previousRole)} / 100 words</small>
        {errors.previousRole && <p className="field-error">{errors.previousRole}</p>}

        <label htmlFor="availability">Availability</label>
        <select
          id="availability"
          value={availability}
          onChange={(e) => {
            setAvailability(e.target.value);
            validateField("availability", e.target.value);
          }}
        >
          <option value="">Select Availability</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
        </select>
        {errors.availability && <p className="field-error">{errors.availability}</p>}

        <label htmlFor="skills">Skills</label>
        <textarea
          id="skills"
          rows={4}
          value={skills}
          onChange={(e) => {
            setSkills(e.target.value);
            validateField("skills", e.target.value);
          }}
        />
        <small>{wordCount(skills)} / 100 words</small>
        {errors.skills && <p className="field-error">{errors.skills}</p>}

        <label htmlFor="academicCredentials">Academic Credentials</label>
        <textarea
          id="academicCredentials"
          rows={4}
          value={academicCredentials}
          onChange={(e) => {
            setAcademicCredentials(e.target.value);
            validateField("academicCredentials", e.target.value);
          }}
        />
        <small>{wordCount(academicCredentials)} / 100 words</small>
        {errors.academicCredentials && (
          <p className="field-error">{errors.academicCredentials}</p>
        )}

        <button type="submit" className="submit-application-button" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
