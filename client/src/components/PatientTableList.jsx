import React from 'react';
import ProgressBar from './ProgressBar';

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

const PatientTableList = ({ patients }) => {
  if (patients.length === 0) {
    return null;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>MRN</th>
            <th>Name</th>
            <th>BMI</th>
            <th>Specialist</th>
            <th>Insurance</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const specialistLabel = SPECIALIST_LABELS[patient.visitType] ?? patient.visitType;
            const specialistColor = SPECIALIST_COLORS[patient.visitType] ?? 'secondary';
            const insuranceLabel = INSURANCE_LABELS[patient.insurance] ?? patient.insurance;
            const insuranceColor = INSURANCE_COLORS[patient.insurance] ?? 'secondary';
            const progress = patient.progress ?? { completed: 0, total: 0 };

            return (
              <tr key={patient.id}>
                <td className="text-nowrap">{patient.mrn}</td>
                <td>{patient.name}</td>
                <td>{patient.bmi}</td>
                <td>
                  <span className={`badge bg-${specialistColor} text-nowrap`}>
                    {specialistLabel}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${insuranceColor} text-nowrap`}>
                    {insuranceLabel}
                  </span>
                </td>
                <td>
                  <ProgressBar completed={progress.completed} total={progress.total} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTableList;
