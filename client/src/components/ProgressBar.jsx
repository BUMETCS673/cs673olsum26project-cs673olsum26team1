import React from 'react';

const ProgressBar = ({ completed, total }) => {
  if (total === 0) {
    return <span className="text-muted small">N/A</span>;
  }

  const pct = Math.round((completed / total) * 100);
  const color = pct >= 80 ? 'success' : pct >= 40 ? 'warning' : 'danger';

  return (
    <div style={{ minWidth: 130 }}>
      <div className="progress mb-1" style={{ height: 14 }}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <small className="text-muted">
        {completed}/{total} ({pct}%)
      </small>
    </div>
  );
};

export default ProgressBar;
