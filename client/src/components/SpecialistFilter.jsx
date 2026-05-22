import React from 'react';

const OPTIONS = [
  { value: '', label: 'All Specialists' },
  { value: 'Not Eligible', label: 'Not Eligible' },
  { value: 'Obesity Medicine Specialist', label: 'Obesity Medicine Specialist' },
  { value: 'Endoscopic Obesity Specialist', label: 'Endoscopic Obesity Specialist' },
  { value: 'Bariatric Surgeon', label: 'Bariatric Surgeon' },
];

const SpecialistFilter = ({ value, onChange }) => (
  <select
    className="form-select"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label="Filter by specialist type"
  >
    {OPTIONS.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export default SpecialistFilter;
