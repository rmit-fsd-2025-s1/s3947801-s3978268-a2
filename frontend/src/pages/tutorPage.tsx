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
    } else if (user.accountType !== "tutor" && user.accountType !== "lecturer") {
      router.push("/");
    } else {
      axios
        .get("http://localhost:3001/api/courses")
        .then((res) => {
          setCourses(res.data);
        })
        .catch((err) => {
          console.error("Error fetching courses:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  if (!user || loading) return null;

  return (
    <>
  <div className="main-container">
    <h2>Apply for Tutor or Lab Assistant Roles</h2>
  </div>

  <ApplicationForm userId={user.id} courses={courses} />
</>

  );  
}
