import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BarGraph from '../components/BarGraph';

interface ApplicantStat {
  applicationId: number;
  email: string;
  count: number;
}

interface StatsResponse {
  mostChosen: ApplicantStat;
  leastChosen: ApplicantStat | null;
  notChosen: ApplicantStat[];
}

export default function VisualRepresentation() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get<StatsResponse>('http://localhost:3001/api/visualStats');
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

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
            <li key={applicant.applicationId}>{applicant.email}</li>
          ))}
        </ul>
      ) : (
        <p>All applicants have been chosen</p>
      )}
    </div>
  );
}
