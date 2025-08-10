import React from 'react';

const ComplaintModal = ({ complaint, onClose, onAction }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      case 'approved': return 'status-completed';
      case 'forwarded': return 'status-completed';
      default: return 'status-pending';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complaint Details - {complaint.id}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
            <span 
              className="complaint-status"
              style={{ 
                backgroundColor: getPriorityColor(complaint.priority),
                color: 'white',
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '15px'
              }}
            >
              {complaint.priority.toUpperCase()} PRIORITY
            </span>
            <span className={`complaint-status ${getStatusColor(complaint.status)}`}>
              {complaint.status.toUpperCase()}
            </span>
          </div>

          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{complaint.title}</h3>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
            {complaint.description}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Complaint Information</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p><strong>Category:</strong> {complaint.category}</p>
              <p><strong>Submitted by:</strong> {complaint.submittedBy}</p>
              <p><strong>Phone:</strong> {complaint.phone}</p>
              <p><strong>Location:</strong> {complaint.location}</p>
              <p><strong>Submitted Date:</strong> {complaint.submittedDate}</p>
              {complaint.forwardedDate && (
                <p><strong>Forwarded Date:</strong> {complaint.forwardedDate}</p>
              )}
              {complaint.cmReceivedDate && (
                <p><strong>CM Received:</strong> {complaint.cmReceivedDate}</p>
              )}
              {complaint.completedDate && (
                <p><strong>Completed Date:</strong> {complaint.completedDate}</p>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Financial Details</h4>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              {complaint.budgetRequired && (
                <p><strong>Budget Required:</strong> {complaint.budgetRequired}</p>
              )}
              {complaint.approvedBudget && (
                <p><strong>Approved Budget:</strong> {complaint.approvedBudget}</p>
              )}
              {complaint.actualCost && (
                <p><strong>Actual Cost:</strong> {complaint.actualCost}</p>
              )}
              {complaint.estimatedCompletion && (
                <p><strong>Estimated Completion:</strong> {complaint.estimatedCompletion}</p>
              )}
            </div>
          </div>
        </div>

        {complaint.unionRemarks && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            borderLeft: '4px solid #667eea'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Union Office Remarks</h4>
            <p style={{ margin: 0, color: '#666' }}>{complaint.unionRemarks}</p>
          </div>
        )}

        {complaint.collectorRemarks && (
          <div style={{ 
            background: '#e7f3ff', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            borderLeft: '4px solid #17a2b8'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Collector Office Remarks</h4>
            <p style={{ margin: 0, color: '#666' }}>{complaint.collectorRemarks}</p>
          </div>
        )}

        {complaint.completionRemarks && (
          <div style={{ 
            background: '#d4edda', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '15px',
            borderLeft: '4px solid #28a745'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Completion Remarks</h4>
            <p style={{ margin: 0, color: '#666' }}>{complaint.completionRemarks}</p>
          </div>
        )}

        {complaint.photos && complaint.photos.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Photo Evidence</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              {complaint.photos.map((photo, index) => (
                <div key={index} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  overflow: 'hidden' 
                }}>
                  <img 
                    src={photo} 
                    alt={`Evidence ${index + 1}`}
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover' 
                    }}
                  />
                  <div style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    background: '#f8f9fa',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    Evidence {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button 
            className="action-btn btn-view"
            onClick={onClose}
          >
            Close
          </button>
          
          {complaint.status === 'pending' && (
            <>
              <button 
                className="action-btn btn-approve"
                onClick={() => {
                  onAction(complaint.id, 'approve');
                  onClose();
                }}
              >
                Approve
              </button>
              <button 
                className="action-btn btn-reject"
                onClick={() => {
                  onAction(complaint.id, 'reject');
                  onClose();
                }}
              >
                Reject
              </button>
            </>
          )}
          
          {complaint.status === 'processing' && (
            <button 
              className="action-btn btn-approve"
              onClick={() => {
                onAction(complaint.id, 'complete');
                onClose();
              }}
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal; 