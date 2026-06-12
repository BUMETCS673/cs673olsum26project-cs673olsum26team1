// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Component structure, metric calculations, UI layout
// Human Contributions: Business logic requirements, metric definitions, testing
// Notes: Displays program-level patient metrics on the Director Dashboard.

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const PatientMetrics = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await apiRequest('/patients');
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  if (loading) return <p>Loading metrics...</p>;
  if (error) return <p className="text-danger">Failed to load metrics.</p>;

  const total = patients.length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newThisWeek = patients.filter(p => new Date(p.createdAt) >= sevenDaysAgo).length;

  const insuranceCleared = patients.filter(p => p.insurance === 'clear').length;
  const insurancePct = total > 0 ? Math.round((insuranceCleared / total) * 100) : 0;

  const surgeryReady = patients.filter(
    p => p.progress && p.progress.completed === p.progress.total && p.progress.total > 0
  ).length;

  const notEligible = patients.filter(p => p.bmi < 27).length;

  const metrics = [
    {
      label: 'Total patients',
      value: total,
      sub: `${newThisWeek} new this week`,
      valueClass: '',
    },
    {
      label: 'Insurance cleared',
      value: insuranceCleared,
      sub: `${insurancePct}% of all patients`,
      valueClass: 'text-success',
    },
    {
      label: 'Surgery ready',
      value: surgeryReady,
      sub: '100% complete',
      valueClass: 'text-primary',
    },
    {
      label: 'Not eligible',
      value: notEligible,
      sub: 'BMI below 27',
      valueClass: '',
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {metrics.map((m) => (
        <div key={m.label} className="col-6 col-md-3">
          <div className="border rounded p-3 bg-light h-100">
            <div className="text-muted small mb-1">{m.label}</div>
            <div className={`fs-3 fw-bold ${m.valueClass}`}>{m.value}</div>
            <div className="text-muted small">{m.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientMetrics;
