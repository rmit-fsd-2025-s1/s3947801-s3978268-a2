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
};
