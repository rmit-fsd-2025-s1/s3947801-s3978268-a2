import React, { createContext, useContext, useState } from "react";
import { Applicant, ChosenApplicant } from "../types/applicant";
import { applicantService } from "../services/applicantService";

interface ApplicantContextType {
  applicant: Applicant | null;
  chosenApplicant: ChosenApplicant | null;
  submitApplicant: (applicant: Applicant) => Promise<void>;
  getApplicant: (search: string) => Promise<Applicant[]>;
  getChosenApplicant: () => Promise<ChosenApplicant[]>;
  selectApplicant: (chosenApplicant: ChosenApplicant) => Promise<void>;
}

const ApplicantContext = createContext<ApplicantContextType | undefined>(undefined);

export function ApplicantProvider({ children }: { children: React.ReactNode }) {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [chosenApplicant, setChosenApplicant] = useState<ChosenApplicant | null>(null);

  const submitApplicant = async (applicant: Applicant) => {
    setApplicant(applicant);
    await applicantService.submitApplicant(applicant);
  };

  const getApplicant = async (search: string): Promise<Applicant[]> => {
    const applicants = await applicantService.getApplicants();
    const value = search.toLowerCase();
    return applicants.filter(
      (a) =>
        a.tutorName.toLowerCase().includes(value) ||
        a.courseName.toLowerCase().includes(value) ||
        a.availability.toLowerCase().includes(value) ||
        a.skills.toLowerCase().includes(value)
    );
  };

  const getChosenApplicant = async (): Promise<ChosenApplicant[]> => {
    return await applicantService.getChosenApplicants();
  };

  const selectApplicant = async (chosenApplicant: ChosenApplicant) => {
    setChosenApplicant(chosenApplicant);
    await applicantService.selectApplicant(chosenApplicant);
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
    throw new Error("useApplicant must be used within ApplicantProvider");
  }
  return context;
}
