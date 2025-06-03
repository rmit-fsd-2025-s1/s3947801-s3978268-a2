import React, { useState, useEffect } from "react";
import router, { useRouter } from "next/router";
import { Applicant, ChosenApplicant } from "../types/applicant";
import BarGraph from '../components/BarGraph';
import { useAuth } from "@/context/AuthContext";

export default function VirtualizationPage() {
    const { user } = useAuth();
    const [chosenApplicants, setChosenApplicants] = useState<ChosenApplicant[]>([]);
    const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  
    // 1. Load the data from localStorage
    useEffect(() => {
      const storedChosen = JSON.parse(localStorage.getItem("chosenApplicants") || "[]") as ChosenApplicant[];
      setChosenApplicants(storedChosen);
  
      const storedAll = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant[];
      setAllApplicants(storedAll);
    }, []);

    useEffect(() => {
      // If the user is not a lecturer, redirect to home or login
        if (!user || user.accountType !== "lecturer") {
          router.push("/");
        }
      }, [user]);

    // Aggregate the selection counts by applicant (grouped by tutorName)
    const aggregatedCounts = chosenApplicants.reduce((acc, record) => {
       const name = record.applicant.tutorName;
       // Sum up the selection counts for each applicant
       acc[name] = (acc[name] || 0) + (record.selections?.length || 0);
       return acc;
     }, {} as Record<string, number>);
  
     // Convert the aggregated object to an array of numbers
    const aggregatedValues = Object.values(aggregatedCounts);
  
    // “Most” is the maximum aggregated count (or 0 if empty)
    const most = aggregatedValues.length ? Math.max(...aggregatedValues) : 0;
  
    // “Least” is the minimum positive count among aggregated counts
    const positiveAggregated = aggregatedValues.filter(n => n > 0);
    const least = positiveAggregated.length ? Math.min(...positiveAggregated) : 0;  
    

    const mostName = Object.keys(aggregatedCounts).find(name => aggregatedCounts[name] === most) || "N/A";
    const leastName = Object.keys(aggregatedCounts).find(name => aggregatedCounts[name] === least) || "N/A";

    const noneNames = allApplicants
    .map(app => app.tutorName)
    .filter((name, index, self) =>
      // Keep only unique names
      self.indexOf(name) === index &&
    // Exclude tutorNames that appear in any chosen applicant
      !chosenApplicants.some(chosen => chosen.applicant.tutorName === name)
    );
  

        

    return (
        <>
          <div className="bar-graph-container">
            <h1 className="header">Most, Least and None</h1>
            <BarGraph most={most} least={least} mostName={mostName} leastName={leastName} />
          </div>
      
          {noneNames.length > 0 && (
            <div style={{ marginTop: "40px" }}>
              <h2>Applicants Who Were Not Selected</h2>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>Tutor Name</th>
                  </tr>
                </thead>
                <tbody>
                  {noneNames.map((name, index) => (
                    <tr key={index}>
                      <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );
}

function userAuth() {
  throw new Error("Function not implemented.");
}
