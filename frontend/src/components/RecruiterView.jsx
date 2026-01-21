
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RecruiterView = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [applications, setApplications] = useState([]);
    const [newProfile, setNewProfile] = useState({ company_name: '', designation: '' });
    const [loading, setLoading] = useState(true);

    const token = user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const profilesRes = await axios.get('http://localhost:5000/api/profiles', config);
            const appsRes = await axios.get('http://localhost:5000/api/applications', config);
            setProfiles(profilesRes.data);
            setApplications(appsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/create_profile', newProfile, config);
            setNewProfile({ company_name: '', designation: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Create failed');
        }
    };

    const handleChangeStatus = async (profile_code, entry_number, newStatus) => {
        try {
            await axios.post('http://localhost:5000/api/application/change_status', {
                profile_code,
                entry_number,
                status: newStatus
            }, config);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Status update failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* Create Profile Section */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Post New Role</h2>
                <form onSubmit={handleCreateProfile} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-700">Company Name</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={newProfile.company_name}
                            onChange={e => setNewProfile({ ...newProfile, company_name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-700">Designation</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={newProfile.designation}
                            onChange={e => setNewProfile({ ...newProfile, designation: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Create
                    </button>
                </form>
            </div>

            {/* Applications List */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Applications</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-3">Candidate</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{app.entry_number}</td>
                                    <td className="p-3">
                                        {/* Ideally app.profile should be joined */}
                                        {app.profile?.designation} ({app.profile?.company_name})
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${app.status === 'Selected' ? 'bg-green-100 text-green-800' :
                                                app.status === 'Accepted' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="p-3 space-x-2">
                                        {app.status === 'Applied' && (
                                            <button
                                                onClick={() => handleChangeStatus(app.profile_code, app.entry_number, 'Selected')}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Mark Selected
                                            </button>
                                        )}
                                        {app.status === 'Selected' && (
                                            <button
                                                onClick={() => handleChangeStatus(app.profile_code, app.entry_number, 'Not Selected')}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {applications.length === 0 && (
                                <tr><td colSpan="4" className="p-4 text-center text-gray-500">No applications found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterView;
