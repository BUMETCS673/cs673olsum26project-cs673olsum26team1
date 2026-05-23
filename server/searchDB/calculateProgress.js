// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation
// Human Contributions: Providing the business loggic and modularizing the progress calculation logic. Originally, the AI put it all in searchDB.js.
// Notes: see below for detailed breakdown of contributions and modifications.

const REQUIRED_ITEMS = {
  'Obesity Medicine Specialist': ['insurance', 'labs', 'consult', 'dietitian', 'psychologist'],
  'Endoscopic Obesity Specialist': ['insurance', 'labs', 'consult', 'dietitian', 'psychologist', 'endoscopy', 'cardiology'],
  'Bariatric Surgeon': ['insurance', 'labs', 'consult', 'dietitian', 'psychologist', 'endoscopy', 'cardiology', 'sleep', 'barium', 'hematology'],
};

// Insurance counts as complete when resolved ("clear" or "self pay"); all other items use "complete"
const isItemComplete = (field, value) => {
  if (field === 'insurance') return value === 'clear' || value === 'self pay';
  return value === 'complete';
};

const computeProgress = (patient) => {
    // AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: My prompt included the user story and acceptance tests for the coordinator dashboard, 
// which included the requirement for a patient search endpoint that supports filtering by specialist type and insurance status.
// I prompted a refactoring to bring it into its own component.
// AI Contribution: Initial draft (~90%) 
// Modifications: 
//  - Refactored from inline code in the coordinator dashboard to the searchDB module for better modularity and reusability. 
// Verification: 
// - Manually tested the route in the coordinator dashboard to ensure data is fetched and displayed correctly, and that the search and filter functionalities work as expected.
// Confidence: High
  const required = REQUIRED_ITEMS[patient.visitType] || [];
  const total = required.length;
  const completed = required.filter((field) => isItemComplete(field, patient[field])).length;
  return { completed, total };
};

module.exports = { computeProgress };
