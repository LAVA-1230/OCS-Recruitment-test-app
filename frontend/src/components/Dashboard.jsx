
import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentView from './StudentView';
import RecruiterView from './RecruiterView';
import AdminView from './AdminView';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">OCS Portal</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                                {user.userid} ({user.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {user.role === 'student' && <StudentView />}
                {user.role === 'recruiter' && <RecruiterView />}
                {user.role === 'admin' && <AdminView />}
            </main>
        </div>
    );
};

export default Dashboard;
