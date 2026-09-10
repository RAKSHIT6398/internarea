import React, { useState } from 'react';
import AdminDashboard from '../components/AdminDashboard';
import ApplicationsManagement from '../components/ApplicationsManagement';
import PostInternship from '../components/PostInternship';

export default function AdminPanel() {
  const [activeView, setActiveView] = useState('dashboard');

  switch (activeView) {
    case 'dashboard':
      return <AdminDashboard setView={setActiveView} />;
    case 'applications':
      return <ApplicationsManagement setView={setActiveView} />;
    case 'post-internship':
      return <PostInternship setView={setActiveView} />;
    default:
      return <AdminDashboard setView={setActiveView} />;
  }
}