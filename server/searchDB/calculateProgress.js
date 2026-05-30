// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation
// Human Contributions: Providing the business logic and modularizing the progress calculation logic.


const REQUIRED_ITEMS = {
  'Obesity Medicine Specialist': ['insurance', 'labs', 'consult', 'dietitian', 'psychologist'],
  'Endoscopic Obesity Specialist': ['insurance', 'labs', 'consult', 'dietitian', 'psychologist', 'endoscopy', 'cardiology'],
  'Bariatric Surgeon': ['insurance', 'labs', 'consult', 'dietitian', 'psychologist', 'endoscopy', 'cardiology', 'sleep', 'barium', 'hematology'],
};

const isItemComplete = (field, value) => {
  if (field === 'insurance') return value === 'clear' || value === 'self pay';
  return value === 'complete';
};

const computeProgress = (patient) => {
  const required = REQUIRED_ITEMS[patient.visitType] || [];
  const total = required.length;
  const completed = required.filter((field) => isItemComplete(field, patient[field])).length;
  return { completed, total };
};


module.exports = { computeProgress };