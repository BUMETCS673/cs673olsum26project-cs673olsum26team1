// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~60%
// AI-Assisted Areas: Component extraction and structure
// Human Contributions: Design requirement, reusability decision, type-based API design, checklist status colors

const SPECIALIST_LABELS = {
  'Not Eligible': 'Not Eligible',
  'Obesity Medicine Specialist': 'Obesity Med.',
  'Endoscopic Obesity Specialist': 'Endoscopic',
  'Bariatric Surgeon': 'Bariatric Surgeon',
};

const SPECIALIST_COLORS = {
  'Not Eligible': 'secondary',
  'Obesity Medicine Specialist': 'info',
  'Endoscopic Obesity Specialist': 'warning',
  'Bariatric Surgeon': 'danger',
};

const INSURANCE_LABELS = {
  'clear': 'Clear',
  'not clear': 'Not Clear',
  'self pay': 'Self Pay',
};

const INSURANCE_COLORS = {
  'clear': 'success',
  'not clear': 'danger',
  'self pay': 'warning',
};

const CHECKLIST_LABELS = {
  'not required': 'Not Required',
  'not complete': 'Not Complete',
  'ordered':      'Ordered',
  'in progress':  'In Progress',
  'complete':     'Complete',
};

const CHECKLIST_COLORS = {
  'not required': 'secondary',
  'not complete': 'danger',
  'ordered':      'primary',
  'in progress':  'warning',
  'complete':     'success',
};

const StatusBadge = ({ type, value }) => {
  let label = value;
  let color = 'secondary';

  if (type === 'specialist') {
    label = SPECIALIST_LABELS[value] ?? value;
    color = SPECIALIST_COLORS[value] ?? 'secondary';
  }

  if (type === 'insurance') {
    label = INSURANCE_LABELS[value] ?? value;
    color = INSURANCE_COLORS[value] ?? 'secondary';
  }

  if (type === 'checklist') {
    label = CHECKLIST_LABELS[value] ?? value;
    color = CHECKLIST_COLORS[value] ?? 'secondary';
  }

  return (
    <span className={`badge bg-${color} text-nowrap`}>
      {label}
    </span>
  );
};

export default StatusBadge;
