export type Applicant = {
    id: string;
    role: string;
    tutorName: string;
    courseName: string;
    previousRole: string;
    availability: string;
    skills: string;
    academicCredentials: string;
    status?: string;  // Added, optional property for submission status
};

export type ChosenApplicant = {
  applicant: Applicant;
  selections: LecturerSelection[];
};

export type LecturerSelection = {
  lecturerName: string;
  lecturerComment: string;
  lecturerRank: string;
  rejected?: boolean;
};

// export const DUMMY_APPLICANTS: Applicant[] = [
//     {
//       id: "1", role: "Tutor", tutorName: "nguyen", 
//       courseName: "Full Stack Development", 
//       previousRole: "Lab Assistant",  
//       availability: "Full Time",
//       skills: "React Programmer, Java, C++",
//       academicCredentials: "HD Full Stack Dev, HD Machine Learning, HD Data Science",
//       status: "Pending"  
//     },
//     {
//       id: "2", role: "Lab Assistant", tutorName: "nguyen", 
//       courseName: "Data Science", 
//       previousRole: "Lab Assistant", 
//       availability: "Part Time",
//       skills: "Problem Solving, Python",
//       academicCredentials: "HD Full Stack Dev, HD Machine Learning, HD Data Science",
//       status: "Pending"
//     },
//     {
//       id: "3", role: "Lab Assistant", tutorName: "nguyen", 
//       courseName: "Full Stack Development", 
//       previousRole: "Lab Assistant", 
//       availability: "Part Time",
//       skills: "Web Design",
//       academicCredentials: "HD Full Stack Dev, HD Data Science",
//       status: "Pending"
//     },
//     {
//       id: "4", role: "Lab Assistant", tutorName: "nguyen", 
//       courseName: "Algorithm & Analysis", 
//       previousRole: "Lab Assistant", 
//       availability: "Part Time",
//       skills: "Python",
//       academicCredentials: "HD Algorithm & Analysis, HD Data Science",
//       status: "Pending"
//     },
// ];

export type ApplicantSearchField = "tutorName" | "courseName" | "availability" | "skills";
