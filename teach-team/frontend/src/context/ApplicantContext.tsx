import React, { createContext, useContext, useEffect, useState } from "react";
import { Applicant, ChosenApplicant } from "../types/applicant";

interface ApplicantContextType {
  applicant: Applicant | null;
  chosenApplicant: ChosenApplicant | null;
  submitApplicant: (applicant: Applicant | null) => void;
  getApplicant: (value: string) => Applicant[] | null;
  getChosenApplicant: () => ChosenApplicant[] | null;
  selectApplicant: (chosenApplicant: ChosenApplicant) => void;
}

const ApplicantContext = createContext<ApplicantContextType | undefined>(undefined);

export function ApplicantProvider({ children }: { children: React.ReactNode }) {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [chosenApplicant, setChosenApplicant] = useState<ChosenApplicant | null>(null);

  useEffect(() => {
    // Initialize storage
    if (!localStorage.getItem("applicants")) {
      localStorage.setItem("applicants", "[]");
    }
    if (!localStorage.getItem("chosenApplicants")) {
      localStorage.setItem("chosenApplicants", "[]");
    }
  }, []);

  const submitApplicant = (applicant: Applicant | null) => {
    if (!applicant) return;

    const applicants = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant[];
    applicants.push(applicant);
    localStorage.setItem("applicants", JSON.stringify(applicants));
    setApplicant(applicant);
  };

  const getApplicant = (value: string): Applicant[] | null => {
    const applicants = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant[];
    const searchValue = value.toLowerCase();

    return applicants.filter(
      (a) =>
        a.tutorName.toLowerCase().includes(searchValue) ||
        a.courseName.toLowerCase().includes(searchValue) ||
        a.availability.toLowerCase().includes(searchValue) ||
        a.skills.toLowerCase().includes(searchValue)
    );
  };

  const getChosenApplicant = (): ChosenApplicant[] | null => {
    return JSON.parse(localStorage.getItem("chosenApplicants") || "[]") as ChosenApplicant[];
  };

  const selectApplicant = (chosenApplicant: ChosenApplicant) => {
    const applicant = chosenApplicant.applicant;
    if (!applicant) return;

    const chosenApplicants = JSON.parse(
      localStorage.getItem("chosenApplicants") || "[]"
    ) as ChosenApplicant[];

    if (chosenApplicants.some((a) => a.applicant.id === applicant.id)) return;

    chosenApplicants.push(chosenApplicant);
    localStorage.setItem("chosenApplicants", JSON.stringify(chosenApplicants));
    setChosenApplicant(chosenApplicant);
  };

  return (
    <ApplicantContext.Provider
      value={{
        applicant,
        chosenApplicant,
        submitApplicant,
        getApplicant,
        getChosenApplicant,
        selectApplicant,
      }}
    >
      {children}
    </ApplicantContext.Provider>
  );
}

export function useApplicant() {
  const context = useContext(ApplicantContext);
  if (!context) {
    throw new Error("useApplicant must be used within an ApplicantProvider");
  }
  return context;
}
