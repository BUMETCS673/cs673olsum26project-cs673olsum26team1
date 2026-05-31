// AI-USAGE SUMMARY 
// Tools: Claude Code 
// Overall AI Contribution: ~90% 
// AI-Assisted Areas: Component structure, UI elements, event handling, accessibility attributes
// Human Contributions: Design requirements and business logic provided in prompt, location in directory, testing, and final integration
// Notes: see below for detailed breakdown of contributions and modifications.

import React from 'react';

const ProgressBar = ({ completed, total }) => {
 // AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: Show a progress bar indicating the percentage of completed steps out of total steps for a patient.
// I also provided a rough design of the progress bar. 
// Modifications: 
//  - Not much modification. 
// Verification: 
// - Manually tested the component in the coordinator dashboard to ensure it renders correctly and and shows progress as expected.
// Confidence: High
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const color = pct === 100 ? 'success' : pct >= 40 ? 'warning' : 'danger';

  return (
    <div style={{ minWidth: 130 }}>
      <div className="progress mb-1" style={{ height: 14 }}>
        {total > 0 && (
          <div
            className={`progress-bar bg-${color}`}
            role="progressbar"
            style={{ width: `${pct}%` }}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        )}
      </div>
      <small className="text-muted">
        {total === 0 ? 'N/A' : `${completed}/${total} (${pct}%)`}
      </small>
    </div>
  );
};

export default ProgressBar;
