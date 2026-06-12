import React from "react";

function ReadOnlyBanner() {
    return (
      <div
        className="alert alert-primary d-flex align-items-center rounded-0 mb-0 py-2"
        role="alert"
      >
        <i className="bi bi-eye me-2"></i>
  
        <small className="fw-semibold">
          Read only view — you can view all patient data but cannot make changes
        </small>
      </div>
    );
  }
  
  export default ReadOnlyBanner;