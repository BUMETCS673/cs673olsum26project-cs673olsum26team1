// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~10%
// AI-Assisted Areas: Make sure the boostrap styling is comsistent and fix syntax errors
// Human Contributions: core component structure, styling, and testing
// Notes: This component was created to display a read-only banner on the Director Dashboard, indicating that the user has view-only access to patient data.
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
