// AI-USAGE SUMMARY 
// Tools: Claude 
// Overall AI Contribution: ~% 50
// AI-Assisted Areas: Bootstrap styling 
// Human Contributions: Component structure, matching styling to current UI design, removed unnecessary condition logic
// Notes: AI-generated code was verified and adjusted to fit our existing design


import React from "react";
 
const SurgeryCleared = () => { 
  return (
    <div
      className="rounded-3 mb-3 text-center px-4 py-3"
      role="alert"
      style={{
        backgroundColor: "#f0faf3",
        border: "2px solid #3d8f3d",
      }}
    >
      <p className="mb-0 fw-semibold" style={{ color: "#1a4d2e", fontSize: "0.95rem" }}>
        You are cleared for surgery!
      </p>
      <p className="mb-0" style={{ color: "#3d6b4f", fontSize: "0.82rem" }}>
        All required pre-operative conditions have been met. Your care team has been notified.
      </p>
    </div>
  );
};
 
export default SurgeryCleared;
 