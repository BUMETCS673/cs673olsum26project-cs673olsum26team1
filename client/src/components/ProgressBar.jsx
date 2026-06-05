// AI-USAGE SUMMARY 
// Tools: Claude Code 
// Overall AI Contribution: ~90% 
// AI-Assisted Areas: Component structure, UI elements, event handling, accessibility attributes
// Human Contributions: Design requirements and business logic provided in prompt, location in directory, testing, and final integration
// Notes: see below for detailed breakdown of contributions and modifications.

import React from 'react';

const ProgressBar = ({ completed, total, alwaysGreen = false, striped = false, animated = false, variant = 'simple' }) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  let color = pct === 100 ? 'success' : pct >= 40 ? 'warning' : 'danger';
  if (alwaysGreen) {
    color = 'success';
  }

  const barClasses = [
    'progress-bar',
    `bg-${color}`,
    striped && 'progress-bar-striped',
    animated && 'progress-bar-animated'
  ].filter(Boolean).join(' ');

  if (variant === 'detailed') {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          {/* Top labels */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold">Your overall preparation progress</span>
            <span className="fw-semibold text-primary">
              {completed}/{total} ({pct}%)
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="progress" style={{ height: '14px' }}>
            <div
              className={barClasses}
              role="progressbar"
              style={{ width: `${pct}%` }}
              aria-valuenow={completed}
              aria-valuemin="0"
              aria-valuemax={total}
            />
          </div>

          {/* Bottom labels */}
          <div className="d-flex justify-content-between align-items-center mt-2 small text-muted">
            <span>{completed} items complete</span>
            <span>{total - completed} items remaining</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minWidth: 130 }}>
      <div className="progress mb-1" style={{ height: 14 }}>
        {total > 0 && (
          <div
            className={barClasses}
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
