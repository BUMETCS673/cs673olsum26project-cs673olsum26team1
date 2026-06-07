// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Component structure, data fetching, UI layout, insurance and clinical PATCH integration, accessibility attributes
// Human Contributions: Design requirements and acceptance criteria provided in prompt, testing, and final integration
// Notes: See below for detailed breakdown of contributions and modifications.

import AIChatWidget from '../components/AIChatWidget';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import ClinicalChecklist from '../components/ClinicalChecklist';
import InsuranceUpdate from '../components/InsuranceUpdate';
import { apiRequest } from '../utils/api';

// AI-ASSISTED: YES
// Tool: Claude Code
// Prompt Summary: Build PatientDetail page with patient header, insurance section, and
//   clinical checklist table connected to PATCH /api/patients/:id/clinical.
// AI Contribution: Initial draft (~90%)
// Modifications: Business logic and acceptance criteria provided by human; integrated existing
//   shared components and apiRequest utility.
// Verification: Manually tested loading, saving indicator, badge update, and progress update.
// Confidence: High
const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiRequest(`/patients/${id}`)
      .then((data) => {
        if (!cancelled) setPatient(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load patient.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <button
          className="btn btn-outline-secondary btn-sm mb-3"
          onClick={() => navigate('/coordinator/dashboard')}
        >
          &larr; Back to Dashboard
        </button>

        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading patient…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && patient && (
          <>
            <PatientHeader patient={patient} onPatientUpdate={setPatient} />
            <ClinicalChecklist patient={patient} onPatientUpdate={setPatient} />
          </>
        )}
      </div>
      <AIChatWidget
      role="COORDINATOR"
      patientContext={{
        patientName: patient?.name,
        insuranceStatus: patient?.insurance || "unknown",
        assignedSpecialist: patient?.visitType || "not assigned",
        bmi: patient?.bmi,
        progress: patient?.progress,
      }}
    />
    </>
  );
};

const PatientHeader = ({ patient, onPatientUpdate }) => {
  const progress = patient.progress ?? { completed: 0, total: 0 };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-start gap-3">
          <div className="flex-grow-1">
            <h3 className="card-title mb-1">{patient.name}</h3>
            <p className="text-muted mb-2">MRN: <strong>{patient.mrn}</strong></p>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="badge bg-light text-dark border fs-6">
              BMI: {patient.bmi ?? 'N/A'}
            </span>
          </div>
        </div>

        <hr />

        <div className="row g-3">
          <div className="col-sm-4">
            <InsuranceUpdate
              patientId={patient.id}
              currentInsurance={patient.insurance}
              onSaved={onPatientUpdate}
            />
          </div>
          <div className="col-sm-4">
            <small className="text-muted d-block mb-1">Specialist</small>
            <StatusBadge type="specialist" value={patient.visitType} />
          </div>
          <div className="col-sm-4">
            <small className="text-muted d-block mb-1">Progress</small>
            <ProgressBar completed={progress.completed} total={progress.total} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
