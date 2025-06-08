import axios from "axios";
import { Applicant, ChosenApplicant } from "../types/applicant";

const API_BASE_URL = "http://localhost:3001/api";

export const applicantService = {
  getApplicants: async (): Promise<Applicant[]> => {
    const res = await axios.get(`${API_BASE_URL}/applicants`);
    return res.data;
  },

  getChosenApplicants: async (): Promise<ChosenApplicant[]> => {
    const res = await axios.get(`${API_BASE_URL}/chosenApplicants`);
    return res.data;
  },

  selectApplicant: async (chosenApplicant: ChosenApplicant): Promise<void> => {
    await axios.post(`${API_BASE_URL}/chosenApplicants`, chosenApplicant);
  },

  submitApplicant: async (applicant: Applicant): Promise<void> => {
    await axios.post(`${API_BASE_URL}/applicants`, applicant);
  },
};
