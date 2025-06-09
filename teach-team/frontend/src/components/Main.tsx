import ProfileInfoCard from "./ProfileInfoCard";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Main() {
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; 

  if (user) {
    return (
      <div>
        <main>
          <h2>Welcome {user.email}!</h2>
          <p>
            The TeachTeam (TT) website is where casual candidates can be hired for offered courses at the School of Computer Science.
          </p>
        </main>

        <div style={{ textAlign: "center" }}>
          <ProfileInfoCard user={user} />
        </div>
      </div>
    );
  }

  return (
    <main>
      <h2>Welcome!</h2>
      <p>
        The TeachTeam (TT) website is where casual candidates can be hired for offered courses at the School of Computer Science.
      </p>
    </main>
  );
}
