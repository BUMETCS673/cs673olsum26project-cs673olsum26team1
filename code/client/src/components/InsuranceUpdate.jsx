// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Component structure, UI layout, insurance PATCH integration, accessibility attributes
// Human Contributions: Design requirements and acceptance criteria provided in prompt,
//   refactoring decision to extract into standalone component, testing, and final integration
// Notes: Extracted from PatientDetail.jsx. Manages insurance dropdown state and API call.

import { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';
import { apiRequest } from '../utils/api';

const INSURANCE_OPTIONS = ['clear', 'not clear', 'self pay', 'in review'];

// AI-ASSISTED: YES
// Tool: Claude Code
// Prompt Summary: Refactor insurance update section out of PatientDetail into its own component.
// AI Contribution: Initial draft (~90%)
// Modifications: Human provided refactoring requirements; component extracted from
//   PatientDetail.jsx with no logic changes.
// Verification: Manually tested after extraction to confirm same behavior.
// Confidence: High
const InsuranceUpdate = ({ patientId, currentInsurance, onSaved }) => {
  const [selected, setSelected] = useState(currentInsurance ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    setSelected(currentInsurance ?? '');
  }, [currentInsurance]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await apiRequest(`/patients/${patientId}/insurance`, {
        method: 'PATCH',
        body: JSON.stringify({ insurance: selected }),
      });
      onSaved(updated);
    } catch (err) {
      setSaveError(err.message || 'Failed to save insurance status.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanged = selected !== currentInsurance;

  return (
    <div className="text-center">
      <small className="text-muted d-block mb-1">Insurance</small>
      <StatusBadge type="insurance" value={currentInsurance} />
      <div className="mt-2 d-flex justify-content-center align-items-center gap-2">
        <select
          className="form-select form-select-sm"
          value={selected}
          onChange={(e) => { setSelected(e.target.value); setSaveError(null); }}
          disabled={saving}
          aria-label="Change insurance status"
          style={{ maxWidth: '160px' }}
        >
          {INSURANCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'not clear' ? 'Not Started' : opt === 'self pay' ? 'Self Pay' : opt === 'in review' ? 'In Review' : 'Clear'}
            </option>
          ))}
        </select>
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
      </div>
      {saveError && (
        <div className="alert alert-danger mt-2 py-1 px-2 small" role="alert">
          {saveError}
        </div>
      )}
    </div>
  );
};

export default InsuranceUpdate;
