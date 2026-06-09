import React from 'react';

const NeedHelpCard = ({ assignedCoordinator }) => {
  return (
    <div className="card shadow-sm mb-4 bg-white">
      <div className="card-body p-4 text-start">
        <h5 className="fw-bold text-dark mb-3">Need help?</h5>
        <p className="text-muted mb-3" style={{ fontSize: '1.02rem', lineHeight: '1.5' }}>
          Your coordinator will contact you to schedule your next steps. If you have questions contact your program coordinator.
        </p>
        <div className="d-flex align-items-center text-dark fw-semibold">
          <svg className="me-2 text-secondary" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>
            {assignedCoordinator
              ? `Assigned coordinator: ${assignedCoordinator}`
              : 'No coordinator is assigned.'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NeedHelpCard;
