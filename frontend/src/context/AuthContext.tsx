import React, { createContext, useContext, useEffect, useState } from "react";
import { User, DUMMY_USERS } from "../types/user";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => User | null;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: {children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        //Clear local storage
        localStorage.removeItem("users");
        const storedUsers = localStorage.getItem("users");
        //Add dummu_users to local storage
        if (!storedUsers){
            localStorage.setItem("users", JSON.stringify(DUMMY_USERS));
        }

        // When validated, adds into current user which gets passed through the application
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser){
            setUser(JSON.parse(storedUser));
        }

    }, []);

    const login = (username: string, password: string): User | null => {
        //Load users from local storage into users
        const users = JSON.parse(localStorage.getItem("users") || "[]") as User [];
        const foundUser = users.find(
            (u) => u.username == username && u.password === password
        ); //Run through users to find a valid user that matched the given username and password inputs

        //Sets user to foundUser and sets currentUser to foundUser
        if (foundUser){
            setUser(foundUser);
            localStorage.setItem("currentUser", JSON.stringify(foundUser));
            return foundUser;
        }
        return null;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("currentUser")
    }

    return(
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth function must be used within AuthProvider");
    }
    return context;
}
