import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminRole, setAdminRole] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    processingComplaints: 0,
    completedComplaints: 0
  });

  useEffect(() => {
    const role = localStorage.getItem('adminRole');
    const username = localStorage.getItem('adminUsername');
    
    if (!role || !username) {
      navigate('/admin/login');
      return;
    }

    setAdminRole(role);
    setAdminUsername(username);

    // Mock data - In real app, this would be API call
    const mockStats = {
      totalComplaints: 156,
      pendingComplaints: 23,
      processingComplaints: 45,
      completedComplaints: 88
    };

    setStats(mockStats);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'union': return 'Union Office';
      case 'collector': return 'Collector Office';
      case 'cm': return 'CM Office';
      default: return 'Admin';
    }
  };

  const navigateToPanel = () => {
    switch (adminRole) {
      case 'union':
        navigate('/admin/union-office');
        break;
      case 'collector':
        navigate('/admin/collector-office');
        break;
      case 'cm':
        navigate('/admin/cm-office');
        break;
      default:
        navigate('/admin/login');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Welcome, {adminUsername} ({getRoleDisplayName(adminRole)})
          </p>
        </div>
        <div className="admin-nav">
          <button className="admin-nav-btn" onClick={navigateToPanel}>
            Go to {getRoleDisplayName(adminRole)} Panel
          </button>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-stats-grid">
          <div className="stat-card">
            <h3>Total Complaints</h3>
            <p className="stat-number">{stats.totalComplaints}</p>
            <p className="stat-label">All time complaints received</p>
          </div>
          
          <div className="stat-card">
            <h3>Pending Complaints</h3>
            <p className="stat-number">{stats.pendingComplaints}</p>
            <p className="stat-label">Awaiting review</p>
          </div>
          
          <div className="stat-card">
            <h3>Processing Complaints</h3>
            <p className="stat-number">{stats.processingComplaints}</p>
            <p className="stat-label">Currently being handled</p>
          </div>
          
          <div className="stat-card">
            <h3>Completed Complaints</h3>
            <p className="stat-number">{stats.completedComplaints}</p>
            <p className="stat-label">Successfully resolved</p>
          </div>
        </div>

        <div className="complaints-container">
          <div className="complaints-header">
            <h2>Quick Actions</h2>
          </div>
          <div style={{ padding: '30px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              <button 
                className="admin-nav-btn" 
                style={{ padding: '20px', fontSize: '16px' }}
                onClick={() => navigate('/admin/union-office')}
              >
                Union Office Panel
              </button>
              <button 
                className="admin-nav-btn" 
                style={{ padding: '20px', fontSize: '16px' }}
                onClick={() => navigate('/admin/collector-office')}
              >
                Collector Office Panel
              </button>
              <button 
                className="admin-nav-btn" 
                style={{ padding: '20px', fontSize: '16px' }}
                onClick={() => navigate('/admin/cm-office')}
              >
                CM Office Panel
              </button>
            </div>
          </div>
        </div>

        <div className="complaints-container" style={{ marginTop: '30px' }}>
          <div className="complaints-header">
            <h2>System Information</h2>
          </div>
          <div style={{ padding: '30px' }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Admin Panel Features</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                <li>Role-based access control</li>
                <li>Real-time complaint tracking</li>
                <li>Photo evidence management</li>
                <li>Status update capabilities</li>
                <li>Comprehensive dashboard analytics</li>
              </ul>
            </div>
            
            <div style={{ 
              background: '#e7f3ff', 
              padding: '20px', 
              borderRadius: '10px',
              color: '#0066cc'
            }}>
              <h3 style={{ margin: '0 0 15px 0' }}>Current Session</h3>
              <p><strong>Role:</strong> {getRoleDisplayName(adminRole)}</p>
              <p><strong>Username:</strong> {adminUsername}</p>
              <p><strong>Login Time:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 