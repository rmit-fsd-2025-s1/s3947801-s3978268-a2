export type User = {
    id: string;
    username: string;
    password: string;
    accountType: string; // "lecturer" or "tutor"
};

export const DUMMY_USERS: User[] = [
    {id: "1", username: "sonianair", password: "sonia123", accountType: "lecturer"},
    {id: "2", username: "nguyen", password: "nguyen123", accountType: "tutor"},
    {id: "3", username: "johnsmith", password: "john123", accountType: "tutor"},
    {id: "4", username: "sonia", password: "sonia123", accountType: "lecturer"},
    {id: "5", username: "janedoe", password: "doe123", accountType: "tutor"},
];