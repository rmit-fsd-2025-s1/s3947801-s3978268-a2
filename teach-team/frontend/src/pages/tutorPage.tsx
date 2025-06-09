  import React, { useEffect, useState } from "react";
  import { useAuth } from "../context/AuthContext";
  import { useRouter } from "next/router";
  import axios from "axios";
  import ApplicationForm from "../components/ApplicationForm";

  export default function TutorPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user) {
        router.push("/login?redirect=/tutorPage");
        return;
      }

      if (user.accountType !== "candidate" && user.accountType !== "lecturer") {
        router.push("/");
        return;
      }

      axios
        .get("http://localhost:3001/api/courses")
        .then((res) => setCourses(res.data))
        .catch((err) => console.error("Error fetching courses:", err))
        .finally(() => setLoading(false));
    }, [user, router]);

    if (loading) {
      return (
        <div className="loading-screen">
          <p>Loading course data...</p>
        </div>
      );
    }

    if (!user) return null;

    return (
      <>
        <div className="main-container">
          <h2>Apply for Tutor or Lab Assistant Roles</h2>
        </div>
        <ApplicationForm userId={user.id} courses={courses} />
      </>
    );
  }
