import React, { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";
import { Applicant, ChosenApplicant } from "../types/applicant";
import { applicantService } from "../services/applicantService"; // GraphQL-based service

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
    try {
      await applicantService.submitApplicant(applicant);
      setApplicant(applicant);
      toast.success("✅ Applicant submitted successfully.");
    } catch (error) {
      toast.error("❌ Failed to submit applicant.");
    }
  };

  const getApplicant = async (search: string): Promise<Applicant[]> => {
    try {
      const applicants = await applicantService.getApplicants();
      const value = search.toLowerCase();
      toast.success("✅ Applicants fetched.");
      return applicants.filter(
        (a) =>
          a.tutorName.toLowerCase().includes(value) ||
          a.courseName.toLowerCase().includes(value) ||
          a.availability.toLowerCase().includes(value) ||
          a.skills.toLowerCase().includes(value)
      );
    } catch (error) {
      toast.error("❌ Could not fetch applicants.");
      return [];
    }
  };

  const getChosenApplicant = async (): Promise<ChosenApplicant[]> => {
    try {
      const data = await applicantService.getChosenApplicants();
      toast.success("✅ Chosen applicants loaded.");
      return data;
    } catch (error) {
      toast.error("❌ Failed to load chosen applicants.");
      return [];
    }
  };

  const selectApplicant = async (chosenApplicant: ChosenApplicant) => {
    try {
      await applicantService.selectApplicant(chosenApplicant);
      setChosenApplicant(chosenApplicant);
      toast.success("✅ Applicant selected successfully.");
    } catch (error) {
      toast.error("❌ Failed to select applicant.");
    }
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
  