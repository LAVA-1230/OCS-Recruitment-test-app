
import React from 'react';
import RecruiterView from './RecruiterView';

// Admin basically has the same capabilities as Recruiter in this UI context (Create profile, View/Manage Applications),
// but for ALL profiles (handled by backend permissions).
// We can reuse RecruiterView or build a more complex one if needed.
// Given "Simple and neat", reusing is smart.

const AdminView = () => {
    return (
        <div>
            <div className="bg-indigo-50 p-4 rounded mb-6 border border-indigo-200">
                <h2 className="text-lg font-bold text-indigo-900">Admin Dashboard</h2>
                <p className="text-indigo-700">You have full access to manage all profiles and applications.</p>
            </div>
            <RecruiterView />
        </div>
    );
};

export default AdminView;
