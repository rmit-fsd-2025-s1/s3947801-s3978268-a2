export interface User {
  id: number;                // number in DB, not string
  email: string;
  password: string;          // will NOT be sent from API after login!
  accountType: "lecturer" | "candidate";
  date_joined: string;       // ISO date string from backend (e.g., "2023-05-26T14:45:00Z")

  courses?: Course[];        // Add this line for assigned courses
}



export interface Application {
  id: number;
  user: User;                 // The applicant user
  course: Course;             // The course they applied for
  role: "tutor" | "lab assistant";
  previousRole?: string;
  availability?: string;
  skills?: string;
  academicCredentials?: string;
  status?: string;
  date_applied: string;       // ISO date from backend
}


export interface Course {
  id: number;
  name: string;
  lecturers: User[];           // Only users with accountType: "lecturer"
}


export interface LecturerSelection {
  id: number;
  application: Application;
  lecturer: User;             // Only users with accountType: "lecturer"
  comment?: string;
  rank: string;
  rejected?: boolean;
}
