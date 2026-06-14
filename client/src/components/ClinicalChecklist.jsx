// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Component structure, UI layout, clinical PATCH integration, accessibility attributes
// Human Contributions: Design requirements and acceptance criteria provided in prompt,
//   refactoring decision to extract into standalone component, testing, and final integration
// Notes: Extracted from PatientDetail.jsx. Manages all clinical checklist state and API calls.

import { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';
import { apiRequest } from '../utils/api';

const CHECKLIST_OPTIONS = ['not required', 'not complete', 'ordered', 'in progress', 'complete'];

const CLINICAL_COLUMNS = [
  { key: 'consult',      label: 'Consult' },
  { key: 'labs',         label: 'Labs' },
  { key: 'hematology',   label: 'Hematology' },
  { key: 'nephrology',   label: 'Nephrology' },
  { key: 'dietitian',    label: 'Dietitian' },
  { key: 'psychologist', label: 'Psychologist' },
  { key: 'endoscopy',    label: 'Endoscopy' },
  { key: 'barium',       label: 'Barium Swallow' },
  { key: 'cardiology',   label: 'Cardiology' },
  { key: 'colonoscopy',  label: 'Colonoscopy' },
  { key: 'sleep',        label: 'Sleep Study' },
];

// AI-ASSISTED: YES
// Tool: Claude Code
// Prompt Summary: Refactor clinical checklist out of PatientDetail into its own component.
// AI Contribution: Initial draft (~90%)
// Modifications: Human provided refactoring requirements; component extracted from
//   PatientDetail.jsx with no logic changes.
// Verification: Manually tested after extraction to confirm same behavior.
// Confidence: High
const ClinicalChecklist = ({ patient, onPatientUpdate }) => (
  <div className="card shadow-sm mb-4">
    <div className="card-body">
      <h5 className="card-title mb-3">Clinical Checklist</h5>
      <div className="table-responsive">
        <table className="table table-striped align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Order Item</th>
              <th>Status</th>
              <th>Update</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {CLINICAL_COLUMNS.map(({ key, label }) => (
              <ClinicalRow
                key={key}
                patientId={patient.id}
                column={key}
                label={label}
                currentValue={patient[key]}
                onSaved={onPatientUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const normalizeValue = (v) => (v === 'not booked' ? 'not complete' : v) ?? 'not required';

const ClinicalRow = ({ patientId, column, label, currentValue, onSaved }) => {
  const [selected, setSelected] = useState(normalizeValue(currentValue));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setSelected(normalizeValue(currentValue));
  }, [currentValue]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await apiRequest(`/patients/${patientId}/clinical`, {
        method: 'PATCH',
        body: JSON.stringify({ column, value: selected }),
      });
      onSaved(updated);
    } catch (err) {
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = selected !== currentValue;

  return (
    <tr>
      <td className="fw-medium">{label}</td>
      <td>
        <StatusBadge type="checklist" value={currentValue} />
      </td>
      <td>
        <select
          className="form-select form-select-sm"
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setSaveError(null); }}
          disabled={saving}
          aria-label={`Change ${label} status`}
          style={{ minWidth: '140px' }}
        >
          {CHECKLIST_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        {saveError && (
          <div className="text-danger small mt-1">{saveError}</div>
        )}
      </td>
      <td>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving || !hasChanged}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
              Saving…
            </>
          ) : 'Save'}
        </button>
      </td>
    </tr>
  );
};

export default ClinicalChecklist;
