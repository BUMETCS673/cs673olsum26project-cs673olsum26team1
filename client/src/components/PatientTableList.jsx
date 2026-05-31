// AI-USAGE SUMMARY 
// Tools: Claude Code 
// Overall AI Contribution: ~90% 
// AI-Assisted Areas: Component structure, UI elements, event handling, accessibility attributes
// Human Contributions: Design requirements and business logic provided in prompt, location in directory, testing, and final integration
// Notes: see below for detailed breakdown of contributions and modifications.

import React from 'react';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';

const PatientTableList = ({ patients }) => {
 // AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: This component was originally part of the coordinator dashboard component. 
// I prompted a refactoring to bring it into its own component.
// AI Contribution: Initial draft (~90%) 
// Modifications: 
//  - Refactored from inline code in the coordinator dashboard to a standalone component for better modularity and reusability. 
// Verification: 
// - Manually tested the component in the coordinator dashboard to ensure it renders correctly and updates the patient table as expected.
// Confidence: High
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
            const progress = patient.progress ?? { completed: 0, total: 0 };

            return (
              <tr key={patient.id}>
                <td className="text-nowrap">{patient.mrn}</td>
                <td>{patient.name}</td>
                <td>{patient.bmi}</td>
                <td>
                  <StatusBadge type="specialist" value={patient.visitType} />
                </td>
                <td>
                  <StatusBadge type="insurance" value={patient.insurance} />
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
