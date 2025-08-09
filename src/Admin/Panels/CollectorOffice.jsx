import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintModal from '../Components/ComplaintModal';

const CollectorOffice = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const role = localStorage.getItem('adminRole');
    if (role !== 'collector') {
      navigate('/admin/login');
      return;
    }

    // Mock data - In real app, this would be API call
    const mockComplaints = [
      {
        id: 'CMP001',
        title: 'Water Leakage in Street',
        description: 'Continuous water leakage from broken pipe near main road junction causing inconvenience to residents.',
        category: 'Water Supply Issues',
        status: 'processing',
        submittedBy: 'Suresh C',
        phone: '9876543210',
        location: 'Ward 12, East Zone',
        submittedDate: '2024-01-15',
        forwardedDate: '2024-01-16',
        photos: ['https://via.placeholder.com/300x200?text=Water+Leakage+1', 'https://via.placeholder.com/300x200?text=Water+Leakage+2'],
        priority: 'high',
        unionRemarks: 'Issue verified. Requires immediate attention.',
        budgetRequired: '₹25,000'
      },
      {
        id: 'CMP004',
        title: 'Garbage Dump Overflow',
        description: 'Municipal garbage dump overflowing and causing health hazards.',
        category: 'Sanitation & Drainage',
        status: 'pending',
        submittedBy: 'Lakshmi R',
        phone: '9876543213',
        location: 'Ward 8, South Zone',
        submittedDate: '2024-01-17',
        forwardedDate: '2024-01-18',
        photos: ['https://via.placeholder.com/300x200?text=Garbage+1', 'https://via.placeholder.com/300x200?text=Garbage+2'],
        priority: 'high',
        unionRemarks: 'Critical health issue. Immediate action required.',
        budgetRequired: '₹15,000'
      },
      {
        id: 'CMP005',
        title: 'School Building Repair',
        description: 'Government school building requires urgent repair work.',
        category: 'Education Facilities',
        status: 'processing',
        submittedBy: 'Teacher Kumar',
        phone: '9876543214',
        location: 'Government School, Central Zone',
        submittedDate: '2024-01-16',
        forwardedDate: '2024-01-17',
        photos: ['https://via.placeholder.com/300x200?text=School+1'],
        priority: 'medium',
        unionRemarks: 'Structural issues identified. Safety concern.',
        budgetRequired: '₹50,000'
      }
    ];

    setComplaints(mockComplaints);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const handleComplaintAction = (complaintId, action) => {
    setComplaints(prev => prev.map(complaint => {
      if (complaint.id === complaintId) {
        let newStatus = complaint.status;
        if (action === 'approve') {
          newStatus = 'processing';
        } else if (action === 'forward') {
          newStatus = 'forwarded';
        } else if (action === 'reject') {
          newStatus = 'rejected';
        }
        return { ...complaint, status: newStatus };
      }
      return complaint;
    }));
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'forwarded': return 'status-completed';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Collector Office Admin Panel</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Review and forward complaints to higher authorities
          </p>
        </div>
        <div className="admin-nav">
          <button className="admin-nav-btn" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
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
            <p className="stat-number">{complaints.length}</p>
            <p className="stat-label">Forwarded from Union Office</p>
          </div>
          
          <div className="stat-card">
            <h3>Pending Review</h3>
            <p className="stat-number">{complaints.filter(c => c.status === 'pending').length}</p>
            <p className="stat-label">Awaiting collector review</p>
          </div>
          
          <div className="stat-card">
            <h3>Processing</h3>
            <p className="stat-number">{complaints.filter(c => c.status === 'processing').length}</p>
            <p className="stat-label">Under collector review</p>
          </div>
          
          <div className="stat-card">
            <h3>Forwarded to CM</h3>
            <p className="stat-number">{complaints.filter(c => c.status === 'forwarded').length}</p>
            <p className="stat-label">Sent to CM Office</p>
          </div>
        </div>

        <div className="complaints-container">
          <div className="complaints-header">
            <h2>Complaints Review</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
              >
                <option value="all">All Complaints</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="forwarded">Forwarded</option>
              </select>
            </div>
          </div>
          
          <div className="complaints-list">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="complaint-item">
                <div className="complaint-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="complaint-id">{complaint.id}</span>
                    <span 
                      className="complaint-status"
                      style={{ 
                        backgroundColor: getPriorityColor(complaint.priority),
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 8px'
                      }}
                    >
                      {complaint.priority.toUpperCase()}
                    </span>
                    <span className={`complaint-status ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    Forwarded: {complaint.forwardedDate}
                  </span>
                </div>
                
                <div className="complaint-details">
                  <div className="complaint-title">{complaint.title}</div>
                  <div className="complaint-description">{complaint.description}</div>
                </div>
                
                <div className="complaint-meta">
                  <span><strong>Category:</strong> {complaint.category}</span>
                  <span><strong>Submitted by:</strong> {complaint.submittedBy}</span>
                  <span><strong>Location:</strong> {complaint.location}</span>
                  <span><strong>Budget Required:</strong> {complaint.budgetRequired}</span>
                </div>

                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '5px', 
                  margin: '10px 0',
                  fontSize: '14px'
                }}>
                  <strong>Union Office Remarks:</strong> {complaint.unionRemarks}
                </div>
                
                <div className="complaint-actions">
                  <button 
                    className="action-btn btn-view"
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowModal(true);
                    }}
                  >
                    View Details
                  </button>
                  
                  {complaint.status === 'pending' && (
                    <>
                      <button 
                        className="action-btn btn-approve"
                        onClick={() => handleComplaintAction(complaint.id, 'approve')}
                      >
                        Start Review
                      </button>
                      <button 
                        className="action-btn btn-reject"
                        onClick={() => handleComplaintAction(complaint.id, 'reject')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {complaint.status === 'processing' && (
                    <>
                      <button 
                        className="action-btn btn-approve"
                        onClick={() => handleComplaintAction(complaint.id, 'forward')}
                      >
                        Forward to CM Office
                      </button>
                      <button 
                        className="action-btn btn-reject"
                        onClick={() => handleComplaintAction(complaint.id, 'reject')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedComplaint && (
        <ComplaintModal 
          complaint={selectedComplaint}
          onClose={() => setShowModal(false)}
          onAction={handleComplaintAction}
        />
      )}
    </div>
  );
};

export default CollectorOffice; 