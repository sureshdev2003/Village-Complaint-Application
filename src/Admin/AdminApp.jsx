import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './Auth/AdminLogin';
import UnionOffice from './Panels/UnionOffice';
import CollectorOffice from './Panels/CollectorOffice';
import CMOffice from './Panels/CMOffice';
import AdminDashboard from './Dashboard/AdminDashboard';
import './Admin.css';

const AdminApp = () => {
  return (
    <div className="admin-app">
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/union-office" element={<UnionOffice />} />
        <Route path="/collector-office" element={<CollectorOffice />} />
        <Route path="/cm-office" element={<CMOffice />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default AdminApp; 