import React, { useState, useEffect } from 'react';
import './Status.css';

const Status = () => {
  const [status, setStatus] = useState(null); // 'Progress' or 'Delivered'

  useEffect(() => {
    // Simulate API call or fetch from localStorage/backend
    const fetchStatus = () => {
      // Example: you already submitted the complaint, now it returns status
      const exampleStatus = 'Progress'; // or 'Delivered'
      setStatus(exampleStatus);
    };

    fetchStatus();
  }, []);

  return (
    <div className="status-page">
      <h2>Your Complaint Status</h2>

      {status === 'Progress' && (
        <div className="status-box progress">
          <p>Status: {status}</p>
        </div>
      )}

      {status === 'Delivered' && (
        <div className="status-box delivered">
          <p>Status: {status}</p>
        </div>
      )}
    </div>
  );
};

export default Status;
