import React from 'react';

const OPTIONS = [
  { value: '', label: 'All Insurance Statuses' },
  { value: 'clear', label: 'Clear' },
  { value: 'not clear', label: 'Not Clear' },
  { value: 'self pay', label: 'Self Pay' },
];

const InsuranceFilter = ({ value, onChange }) => (
  <select
    className="form-select"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label="Filter by insurance status"
  >
    {OPTIONS.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export default InsuranceFilter;
