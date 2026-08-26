import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = user !== null;

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        await fetch("https://eventora-event-booking-web-app-1.onrender.com/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        setUser(null);
    };

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const res = await fetch(
                    "https://eventora-event-booking-web-app-1.onrender.com/api/auth/me",
                    {
                        credentials: "include",
                    }
                );

                const data = await res.json();

                if (res.ok) {
                    setUser(data.user);
                }
            } catch (error) {
                console.log("Not logged in");
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);