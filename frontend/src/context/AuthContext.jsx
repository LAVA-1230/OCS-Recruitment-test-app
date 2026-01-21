
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token in localStorage on mount
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userid = localStorage.getItem('userid');

        if (token && role && userid) {
            setUser({ token, role, userid });
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userid', data.userid);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userid');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
