// AI-USAGE SUMMARY 
// Tools: Claude Code 
// Overall AI Contribution: ~90% 
// AI-Assisted Areas: Component structure, UI elements, event handling, accessibility attributes 
// Human Contributions: Prompt with design requirements, location in directory, testing, and final integration 
// Notes: see below for detailed breakdown of contributions and modifications.

import React from 'react';

const OPTIONS = [
  { value: '', label: 'All Specialists' },
  { value: 'Not Eligible', label: 'Not Eligible' },
  { value: 'Obesity Medicine Specialist', label: 'Obesity Medicine Specialist' },
  { value: 'Endoscopic Obesity Specialist', label: 'Endoscopic Obesity Specialist' },
  { value: 'Bariatric Surgeon', label: 'Bariatric Surgeon' },
];

const SpecialistFilter = ({ value, onChange }) => (
// AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: This component was originally part of the coordinator dashboard component. 
// I prompted a refactoring to bring it into its own component.
// AI Contribution: Initial draft (~90%) 
// Modifications: 
//  - Refactored from inline code in the coordinator dashboard to a standalone component for better modularity and reusability. 
// Verification: 
// - Manually tested the component in the coordinator dashboard to ensure it renders correctly and updates the filter state as expected.
// Confidence: High

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
