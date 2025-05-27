import axios from "axios";
import { Application, User, LecturerSelection, Course } from "../types/types";

const API_BASE_URL = "http://localhost:3001/api";

export const userService = {
  createUser: async (user: {
    email: string;
    password: string;
    accountType: "lecturer" | "tutor";
  }): Promise<User> => {
    const res = await axios.post<User>(`${API_BASE_URL}/user`, user);
    return res.data; // This will be your new user (without password)
  },

    login: async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await axios.post<User>(`${API_BASE_URL}/user/login`, credentials);
    return res.data;
  },

};

export const applicationService = {

    getApplications: async (courseIds: number[]): Promise<Application[]> => {
    const res = await axios.get<Application[]>(`${API_BASE_URL}/applications`, {
      params: { courseIds: courseIds.join(",") },
    });
    return res.data;
  },

};

export const CourseService = {

};

export const LecturerSelectionService = {

    getSelectionsByLecturer: async (lecturerId: number): Promise<LecturerSelection[]> => {
    const res = await axios.get<LecturerSelection[]>(`${API_BASE_URL}/lecturerSelections`, {
      params: { lecturerId },
    });
    return res.data;
  },

    upsertSelection: async (selection: {
    applicationId: number;
    lecturerId: number;
    comment?: string;
    rank: string;
  }): Promise<LecturerSelection> => {
    const res = await axios.post<LecturerSelection>(`${API_BASE_URL}/lecturerSelections`, selection);
    return res.data;
  },

};

