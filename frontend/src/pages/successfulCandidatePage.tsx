import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { LecturerSelectionService } from "../services/api";
import { LecturerSelection } from "../types/types";

export default function SuccessfulCandidatePage() {
  const { user } = useAuth();
  const router = useRouter();

  // State: selections pending ranking/commenting
  const [pendingSelections, setPendingSelections] = useState<LecturerSelection[]>([]);

  // Redirect if not logged in or not lecturer
  useEffect(() => {
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user, router]);

  // Load pending selections from backend on mount
  useEffect(() => {
    if (!user) return;

    LecturerSelectionService.getPendingSelections(user.id)
      .then((data) => setPendingSelections(data))
      .catch((err) => {
        console.error("Failed to fetch pending selections", err);
      });
  }, [user]);

  // Handle rank or comment changes
  const handleRankAndComment = (selectionId: number, rank: string, comment: string) => {
    setPendingSelections(prev =>
      prev.map(sel => {
        if (sel.id === selectionId) {
          return {
            ...sel,
            rank,
            comment,
          };
        }
        return sel;
      })
    );
  };

  // Validate unique, non-empty ranks per course before saving

  const handleSaveSelections = async () => {
  if (!user) return;

  // Group selections by course name
  const groupedByCourse = pendingSelections.reduce<Record<string, LecturerSelection[]>>((acc, sel) => {
    const courseName = sel.application.course.name;
    if (!acc[courseName]) acc[courseName] = [];
    acc[courseName].push(sel);
    return acc;
  }, {});

  // Validate ranks and comments per course
  for (const [courseName, selections] of Object.entries(groupedByCourse)) {
    const ranks = selections.map(sel => sel.rank || "");
    const comments = selections.map(sel => sel.comment?.trim() || "");

    // Check all ranks are assigned
    if (ranks.some(r => r === "")) {
      alert(`All applicants in course "${courseName}" must have a rank.`);
      return;
    }

    // Check all comments are filled
    if (comments.some(c => c === "")) {
      alert(`All applicants in course "${courseName}" must have a comment.`);
      return;
    }

    // Check rank uniqueness
    const uniqueRanks = new Set(ranks);
    if (uniqueRanks.size !== ranks.length) {
      alert(`Ranks must be unique for course "${courseName}".`);
      return;
    }
  }

  try {
    // Save all selections
    for (const sel of pendingSelections) {
      await LecturerSelectionService.upsertSelection({
        applicationId: sel.application.id,
        lecturerId: user.id,
        rank: sel.rank,
        comment: sel.comment,
      });
    }
    alert("Selections saved successfully!");
    router.push("/");
  } catch (error) {
    alert("Error saving selections.");
    console.error(error);
  }
};


  if (!user) return null;

  return (
    <div>
      <h1>Rank and Comment on Selected Applicants</h1>
      {pendingSelections.length === 0 ? (
        <p>No pending selections to rank.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tutor Name</th>
              <th>Course</th>
              <th>Rank</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {pendingSelections.map(sel => (
              <tr key={sel.id}>
                <td>{sel.application.user.email}</td>
                <td>{sel.application.course.name}</td>
                <td>
                  <select
                    value={sel.rank || ""}
                    onChange={(e) => handleRankAndComment(sel.id, e.target.value, sel.comment || "")}
                  >
                    <option value="">Select Rank</option>
                    {[...Array(pendingSelections.length)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={sel.comment || ""}
                    onChange={(e) => handleRankAndComment(sel.id, sel.rank || "", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={handleSaveSelections}>Save Selections</button>
    </div>
  );
}
