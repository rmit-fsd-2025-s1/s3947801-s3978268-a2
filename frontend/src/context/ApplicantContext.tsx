import React, { createContext, useContext, useEffect, useState } from "react";
import { Applicant, ChosenApplicant, ApplicantSearchField } from "../types/applicant";
import { validateHeaderValue } from "node:http";

interface ApplicantContextType {
    applicant: Applicant | null;
    chosenApplicant: ChosenApplicant | null;
    submitApplicant: (applicant: Applicant | null) => void;
    getApplicant: (value: string) => Applicant [] | null;
    getChosenApplicant: () => ChosenApplicant [] | null;
    selectApplicant: (chosenApplicant: ChosenApplicant) => void;
};

const ApplicantContext = createContext<ApplicantContextType | undefined>(undefined);

export function ApplicantProvider({ children }: {children: React.ReactNode}) {
        const [applicant, setApplicant] = useState<Applicant | null>(null);
        const [chosenApplicant, setChosenApplicant] = useState<ChosenApplicant | null>(null);

        useEffect(() => {
            // Retrieve any stored applicants
            let applicants = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant[];
          }, []);
          

        const submitApplicant = (applicant: Applicant | null) => {
            
        }

        const getApplicant = (value: string): Applicant [] | null => {
            const applicants = JSON.parse(localStorage.getItem("applicants") || "[]") as Applicant [];
            const searchValue = value.toLowerCase();

            const foundApplicants = applicants.filter(
                (a) => a.tutorName.toLowerCase().includes(searchValue) ||
                a.courseName.toLowerCase().includes(searchValue) ||
                a.availability.toLowerCase().includes(searchValue) ||
                a.skills.toLowerCase().includes(searchValue)
            );
            return foundApplicants || [];
        }

        const getChosenApplicant = (): ChosenApplicant [] | null => {
            const chosenApplicants = JSON.parse(localStorage.getItem("chosenApplicants") || "[]") as ChosenApplicant [];
            return chosenApplicants || [];
        }

         const selectApplicant =  (chosenApplicant: ChosenApplicant) => {
            const applicant = chosenApplicant.applicant;
            if (!applicant) return;

            const chosenApplicants = JSON.parse(localStorage.getItem("chosenApplicants") || "[]") as ChosenApplicant [];
            if (chosenApplicants.some(a => a.applicant.id === applicant.id)) return;
            
            chosenApplicants.push(chosenApplicant);
            localStorage.setItem("chosenApplicants", JSON.stringify(chosenApplicants));
            
        }

        return(
            <ApplicantContext.Provider value={{applicant, chosenApplicant, submitApplicant, getApplicant, getChosenApplicant, selectApplicant}}>
                {children}
            </ApplicantContext.Provider>
        );
}

export function useApplicant(){
    const context = useContext(ApplicantContext);
    if (!context) {
        throw new Error("useApplicant function must be used within ApplicantProvider");
    }
    return context;
}
