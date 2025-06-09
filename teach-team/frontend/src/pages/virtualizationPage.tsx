import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarGraph from '../components/BarGraph';

interface ChosenStat {
  applicationId: number;
  email: string;
  count: number;
}

interface NotChosenStat {
  userId: number;
  email: string;
}

interface StatsResponse {
  mostChosen: ChosenStat;
  leastChosen: ChosenStat | null;
  notChosen: NotChosenStat[];
}


export default function VisualRepresentation() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchStats() {
      try {
        const res = await axios.get<StatsResponse>('http://localhost:3001/api/visualStats');
        if (res.status === 200) {
          setStats(res.data);
        } else {
          console.warn("No stats found.");
          setStats(null);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            console.warn("No stats found (404).");
            setStats(null);
          } else {
            console.error("Axios error:", error.message);
          }
        } else {
          console.error("Unexpected error:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (!isMounted) return null;
  if (loading) return <div>Loading data...</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div>
      <h1>Visual Representation for Lecturers</h1>

      {stats.mostChosen && stats.leastChosen ? (
        <BarGraph
          most={stats.mostChosen.count}
          least={stats.leastChosen.count}
          mostName={stats.mostChosen.email}
          leastName={stats.leastChosen.email}
        />
      ) : (
        <p>Insufficient data to show bar graph.</p>
      )}

      <h2>Applicants Not Chosen</h2>
      {stats.notChosen.length > 0 ? (
        <ul>
          {stats.notChosen.map((applicant) => (
            <li key={applicant.userId}>{applicant.email}</li>
          ))}
        </ul>
      ) : (
        <p>All applicants have been chosen</p>
      )}
    </div>
  );
}
