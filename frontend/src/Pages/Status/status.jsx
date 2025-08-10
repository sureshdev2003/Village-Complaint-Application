import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';
import './Status.css';

const Status = () => {
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const stages = [
    { label: 'Submitted', status: 'pending' },
    { label: 'Acknowledged', status: 'acknowledged' },
    { label: 'In Progress', status: 'in_progress' },
    { label: 'Resolved', status: 'resolved' },
  ];

  const getCurrentStage = () => {
    if (!complaint) return -1;
    
    const statusIndex = stages.findIndex(stage => stage.status === complaint.status);
    return statusIndex >= 0 ? statusIndex : 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!complaintId.trim()) {
      setError('Please enter a complaint ID');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);
    setStatusHistory([]);

    try {
      const response = await complaintAPI.getStatus(complaintId.trim());
      setComplaint(response.data.complaint);
      setStatusHistory(response.data.statusHistory || []);
      setSearched(true);
    } catch (error) {
      setError(error.message || 'Complaint not found. Please check the ID and try again.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="status-page">
      <h2>Track Your Complaint Status</h2>

      {/* Search Form */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Enter Complaint ID (e.g., VCM123456789)"
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            className="complaint-id-input"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {complaint && (
        <>
          {/* Complaint Summary */}
          <div className="info-box">
            <h3>Complaint Summary</h3>
            <div className="complaint-details">
              <p><strong>Complaint ID:</strong> {complaint.complaint_id}</p>
              <p><strong>Title:</strong> {complaint.title}</p>
              <p><strong>Category:</strong> {complaint.category_name}</p>
              <p><strong>Status:</strong> 
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(complaint.status) }}
                >
                  {getStatusLabel(complaint.status)}
                </span>
              </p>
              <p><strong>Urgency:</strong> {complaint.urgency}</p>
              <p><strong>Location:</strong> {complaint.location || 'Not specified'}</p>
              <p><strong>Submitted On:</strong> {formatDate(complaint.created_at)}</p>
              {complaint.resolved_at && (
                <p><strong>Resolved On:</strong> {formatDate(complaint.resolved_at)}</p>
              )}
            </div>

            {complaint.description && (
              <div className="description-section">
                <h4>Description:</h4>
                <p>{complaint.description}</p>
              </div>
            )}

            {complaint.assigned_to_name && (
              <div className="assignment-section">
                <h4>Assigned To:</h4>
                <p>{complaint.assigned_to_name} ({complaint.assigned_to_designation})</p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="tracking-container">
            <h3>Status Timeline</h3>
            <div className="timeline">
              {stages.map((stage, index) => {
                const currentStage = getCurrentStage();
                const isActive = index <= currentStage;
                const isCurrent = index === currentStage;
                
                return (
                  <div className="tracking-step" key={index}>
                    <div className={`circle ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                      {index + 1}
                    </div>
                    <div className="label">{stage.label}</div>
                    {index < stages.length - 1 && (
                      <div className={`bar ${isActive ? 'active' : ''}`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status History */}
          {statusHistory.length > 0 && (
            <div className="status-history">
              <h3>Status History</h3>
              <div className="history-timeline">
                {statusHistory.map((history, index) => (
                  <div key={index} className="history-item">
                    <div className="history-date">
                      {formatDate(history.created_at)}
                    </div>
                    <div className="history-content">
                      <div className="history-status">
                        {history.old_status ? 
                          `${getStatusLabel(history.old_status)} → ${getStatusLabel(history.new_status)}` : 
                          `Status: ${getStatusLabel(history.new_status)}`
                        }
                      </div>
                      {history.comments && (
                        <div className="history-comments">
                          {history.comments}
                        </div>
                      )}
                      {history.changed_by_name && (
                        <div className="history-by">
                          Updated by: {history.changed_by_name} ({history.changed_by_designation})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {searched && !complaint && !error && (
        <div className="no-complaint">
          <p>No complaint found with the provided ID.</p>
          <p>Please check the complaint ID and try again.</p>
        </div>
      )}

      {/* Tips */}
      <div className="tips-box">
        <h3>Note</h3>
        <ul>
          <li>You can track your complaint status using the complaint ID provided when you submitted the complaint.</li>
          <li>Status updates are made in real-time by the concerned authorities.</li>
          <li>For urgent issues, please contact your local municipal office.</li>
          <li>You will be notified via email/SMS when there are status updates (if contact details provided).</li>
        </ul>
      </div>
    </div>
  );
};

export default Status;
