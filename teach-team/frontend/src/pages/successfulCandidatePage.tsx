import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { LecturerSelectionService } from "../services/api";
import { LecturerSelection } from "../types/types";

export default function SuccessfulCandidatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingSelections, setPendingSelections] = useState<LecturerSelection[]>([]);
  const [activeCourse, setActiveCourse] = useState<string>("");

  useEffect(() => {
    if (!user || user.accountType !== "lecturer") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    LecturerSelectionService.getPendingSelections(user.id)
      .then(setPendingSelections)
      .catch((err) => console.error("Failed to fetch pending selections", err));
  }, [user]);

  const handleRankAndComment = (selectionId: number, rank: string, comment: string) => {
    setPendingSelections((prev) =>
      prev.map((sel) =>
        sel.id === selectionId ? { ...sel, rank, comment } : sel
      )
    );
  };

  const groupedByCourse = useMemo(() => {
    return pendingSelections.reduce<Record<string, LecturerSelection[]>>((acc, sel) => {
      const courseName = sel.application.course.name;
      if (!acc[courseName]) acc[courseName] = [];
      acc[courseName].push(sel);
      return acc;
    }, {});
  }, [pendingSelections]);

  useEffect(() => {
    const courseNames = Object.keys(groupedByCourse);
    if (!activeCourse && courseNames.length > 0) {
      setActiveCourse(courseNames[0]);
    }
  }, [groupedByCourse, activeCourse]);

  const handleSaveSelections = async () => {
    if (!user) return;

    for (const [courseName, selections] of Object.entries(groupedByCourse)) {
      const ranks = selections.map((sel) => sel.rank || "");
      const comments = selections.map((sel) => sel.comment?.trim() || "");

      if (ranks.some((r) => r === "")) {
        alert(`All applicants in course "${courseName}" must have a rank.`);
        return;
      }

      if (comments.some((c) => c === "")) {
        alert(`All applicants in course "${courseName}" must have a comment.`);
        return;
      }

      const uniqueRanks = new Set(ranks);
      if (uniqueRanks.size !== ranks.length) {
        alert(`Ranks must be unique for course "${courseName}".`);
        return;
      }
    }

    try {
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
      console.error("Error saving selections", error);
      alert("Error saving selections.");
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1>Rank and Comment on Selected Applicants</h1>

      {pendingSelections.length === 0 ? (
        <p>No pending selections to rank.</p>
      ) : (
        <>
          <label className="course-label">
            Select Course:&nbsp;
            <select
              className="course-select"
              value={activeCourse}
              onChange={(e) => setActiveCourse(e.target.value)}
            >
              {Object.keys(groupedByCourse).map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </label>

          <br />
          <br />

          {activeCourse && groupedByCourse[activeCourse] && (
            <div>
              <h2 className="course-hd">{activeCourse}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Rank</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByCourse[activeCourse].map((sel) => (
                    <tr key={sel.id}>
                      <td>{sel.application.user.email}</td>
                      <td>
                        <select
                          value={sel.rank || ""}
                          onChange={(e) =>
                            handleRankAndComment(sel.id, e.target.value, sel.comment || "")
                          }
                        >
                          <option value="">Select Rank</option>
                          {[...Array(groupedByCourse[activeCourse].length)].map((_, i) => (
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
                          onChange={(e) =>
                            handleRankAndComment(sel.id, sel.rank || "", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <br />
          <div className="save-selection-button-container">
            <button className="save-selection-button" onClick={handleSaveSelections}>
              Save Selections
            </button>
          </div>
        </>
      )}
    </div>
  );
}
