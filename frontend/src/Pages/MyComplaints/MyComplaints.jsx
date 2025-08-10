import React, { useState, useEffect } from 'react';
import { complaintAPI, utils } from '../../services/api';
import './MyComplaints.css';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (utils.isAuthenticated()) {
      fetchComplaints();
    } else {
      setError('Please login to view your complaints');
      setLoading(false);
    }
  }, [pagination.page]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintAPI.getMyComplaints({
        page: pagination.page,
        limit: pagination.limit
      });
      
      setComplaints(response.data.complaints);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'acknowledged': return '#2196f3';
      case 'in_progress': return '#9c27b0';
      case 'resolved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'acknowledged': return 'Acknowledged';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (!utils.isAuthenticated()) {
    return (
      <div className="my-complaints-container">
        <div className="error-message">
          Please login to view your complaints.
        </div>
      </div>
    );
  }

  return (
    <div className="my-complaints-container">
      <h2>My Complaints</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading your complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="no-complaints">
          <p>You haven't submitted any complaints yet.</p>
          <p>Click <a href="/">here</a> to submit your first complaint.</p>
        </div>
      ) : (
        <>
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <h3>{complaint.title}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {getStatusLabel(complaint.status)}
                  </span>
                </div>
                
                <div className="complaint-details">
                  <p><strong>Complaint ID:</strong> {complaint.complaint_id}</p>
                  <p><strong>Category:</strong> {complaint.category_name}</p>
                  <p><strong>Location:</strong> {complaint.location || 'Not specified'}</p>
                  <p><strong>Urgency:</strong> {complaint.urgency}</p>
                  <p><strong>Submitted:</strong> {formatDate(complaint.created_at)}</p>
                  {complaint.resolved_at && (
                    <p><strong>Resolved:</strong> {formatDate(complaint.resolved_at)}</p>
                  )}
                </div>

                <div className="complaint-description">
                  <p>{complaint.description}</p>
                </div>

                {complaint.assigned_to_name && (
                  <div className="assignment-info">
                    <p><strong>Assigned to:</strong> {complaint.assigned_to_name}</p>
                  </div>
                )}

                <div className="complaint-actions">
                  <button 
                    className="track-btn"
                    onClick={() => window.location.href = `/status?complaintId=${complaint.complaint_id}`}
                  >
                    Track Status
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="page-btn"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="page-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyComplaints; 