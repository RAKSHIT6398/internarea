import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function ApplicationsManagement({ setView }) {
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchApps = async (statusFilter) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/applications?status=${statusFilter}`, getAuthHeaders());
      setApps(res.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps(filter);
  }, [filter]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/admin/applications/${id}`, { status: newStatus }, getAuthHeaders());
      fetchApps(filter);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button onClick={() => setView('dashboard')} className="mb-4 text-blue-600 hover:underline text-sm font-medium">
        ← Back to Dashboard
      </button>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Applications Management</h2>
        
        {/* Toggle Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map((type) => (
            <button 
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-lg text-sm capitalize transition ${
                filter === type ? 'bg-amber-400 text-neutral-900 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Data Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-800 font-bold">
                <th className="p-3">Company</th>
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Plan Tier</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading applications...</td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400">No applications found in this state.</td></tr>
              ) : (
                apps.map(app => (
                  <tr key={app._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-gray-900">
                      {app.internshipId?.companyName || "Unknown Company"}
                      <span className="text-xs block text-gray-400 mt-0.5">{app.internshipId?.title || "Untitled Role"}</span>
                    </td>
                    <td className="p-3">
                      {app.userId?.name || "Anonymous"}
                      <span className="text-xs block text-gray-400 mt-0.5">{app.userId?.email || "No email"}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 rounded uppercase">
                        {app.userId?.subscriptionPlan || "Free"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-3 text-right flex gap-2 justify-end">
                      {app.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(app._id, 'accepted')} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">Accept</button>
                          <button onClick={() => updateStatus(app._id, 'rejected')} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}