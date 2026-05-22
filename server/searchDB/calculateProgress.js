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
  const required = REQUIRED_ITEMS[patient.visitType] || [];
  const total = required.length;
  const completed = required.filter((field) => isItemComplete(field, patient[field])).length;
  return { completed, total };
};

module.exports = { computeProgress };
