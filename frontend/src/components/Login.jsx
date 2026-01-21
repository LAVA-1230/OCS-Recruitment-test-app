
import React, { useState } from 'react';
import axios from 'axios';
import md5 from 'md5';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
    const [role, setRole] = useState('student');
    const [userid, setUserid] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const password_md5 = md5(password);

            const response = await axios.post('http://localhost:5000/api/login', {
                userid,
                password_md5
            });

            const { token, role: returnedRole } = response.data;

            if (returnedRole !== role) {
                console.warn(`Role mismatch: Selected ${role} but user is ${returnedRole}`);
            }

            login({ token, role: returnedRole, userid });
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
                <div className="mb-8 text-center w-full">
                    <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
                    <p className="mt-2 text-sm text-gray-500">Access your OCS Recruitment Portal</p>
                </div>

                {error && (
                    <div className="mb-6 w-full rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    <div className="w-full">
                        <label htmlFor="role" className="block mb-2.5 text-sm font-medium text-gray-900 text-left">Role</label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full px-3 py-2.5 shadow-sm"
                        >
                            <option value="student">Student</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="w-full">
                        <label htmlFor="userid" className="block mb-2.5 text-sm font-medium text-gray-900 text-left">User ID</label>
                        <input
                            type="text"
                            id="userid"
                            value={userid}
                            onChange={(e) => setUserid(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full px-3 py-2.5 shadow-sm placeholder-gray-400"
                            placeholder="e.g., student1"
                            required
                        />
                    </div>

                    <div className="w-full">
                        <label htmlFor="password" className="block mb-2.5 text-sm font-medium text-gray-900 text-left">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full px-3 py-2.5 shadow-sm placeholder-gray-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 shadow-md transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
