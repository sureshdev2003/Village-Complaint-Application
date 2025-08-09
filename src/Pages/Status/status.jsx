import React, { useState, useEffect } from 'react';
import './Status.css';

const stages = [
  { label: 'User Submitted' },
  { label: 'Union Office' },
  { label: 'Collector Office' },
  { label: 'CM Office' },
];

const Status = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const submittedDate = new Date();
  const expectedDate = new Date(submittedDate.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days later

  useEffect(() => {
    if (currentStage >= stages.length - 1) return;

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentStage]);

  return (
    <div className="status-page">
      <h2>Your Complaint Status</h2>

      <div className="info-box">
        <h3>Complaint Summary</h3>
        <p><strong>Complaint ID:</strong> CMP123456</p>
        <p><strong>Issue:</strong> Water Leakage in Street</p>
        <p><strong>Description:</strong> Continuous water leakage from a broken pipe near main road junction.</p>

        <h3>User Information</h3>
        <p><strong>Name:</strong> Suresh C</p>
        <p><strong>Location:</strong> Ward 12, East Zone</p>

        <h3>Timeline</h3>
        <p><strong>Submitted On:</strong> {submittedDate.toLocaleDateString()} {submittedDate.toLocaleTimeString()}</p>
        <p><strong>Expected Resolution:</strong> {expectedDate.toLocaleDateString()}</p>
      </div>

      <div className="tracking-container">
        {stages.map((stage, index) => (
          <div className="tracking-step" key={index}>
            <div className={`circle ${index <= currentStage ? 'active' : ''}`}>
              {index + 1}
            </div>
            <div className="label">{stage.label}</div>
            {index < stages.length - 1 && (
              <div className={`bar ${index < currentStage ? 'active' : ''}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="tips-box">
        <h3>Note</h3>
        <ul>
          <li>Your complaint is being processed in real time.</li>
          <li>You will be notified once it reaches the final stage.</li>
          <li>For urgent issues, please contact your local municipal office.</li>
        </ul>
      </div>
    </div>
  );
};

export default Status;
