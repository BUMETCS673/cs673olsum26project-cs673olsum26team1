// AI-USAGE SUMMARY
// Tools: VS Code Copilot, Claude Code (I was experimenting with both tools.)
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation, component structure, UI elements, 
// event handling, debounce, and state management.
// Human Contributions: Providing the business logic and modularizing the search bar 
// as its own component. Originally, all of this was in the coordinator dashboard.
// Notes: see below for detailed breakdown of contributions and modifications.

import React, { useState, useEffect, useRef } from 'react';
import SpecialistFilter from './SpecialistFilter';
import InsuranceFilter from './InsuranceFilter';
import PatientTableList from './PatientTableList';
import {apiRequest} from '../utils/api';

const SearchBar = ({ onPatientClick, disableClick = false, enableSort = false }) => {
        // AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: My prompt included the user story, subtasks, implementation requirements, and acceptance tests for the coordinator dashboard, 
// which included the requirement for a patient search by MRN, Date, and Name that supports filtering by specialist type and insurance status.
// I prompted a refactoring to bring it into its own component.
// AI Contribution: Initial draft (~90%) 
// Modifications: 
//  - Refactored from inline code in the coordinator dashboard to this component for better modularity and reusability. 
// Verification: 
// - Manually tested the search bar functionality in the coordinator dashboard to ensure data is fetched and displayed correctly, 
// and that the search and filter functionalities work as expected.
// Confidence: High
  const [searchTerm, setSearchTerm] = useState('');
  const [specialistType, setSpecialistType] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Fetch patients with debounce; reruns when search or filters change
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        if (specialistType) params.set('specialistType', specialistType);
        if (insuranceStatus) params.set('insuranceStatus', insuranceStatus);

        const qs = params.toString();
        const data = await apiRequest(`/patients${qs ? `?${qs}` : ''}`);
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, specialistType, insuranceStatus]);

  const hasActiveFilters = searchTerm.trim() || specialistType || insuranceStatus;

  // Sorting logic applied on the fetched patients array
  const sortedPatients = [...patients].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name_desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === 'bmi_desc') {
      return (b.bmi || 0) - (a.bmi || 0);
    }
    if (sortBy === 'bmi_asc') {
      return (a.bmi || 0) - (b.bmi || 0);
    }

    const getProgressPct = (p) => {
      const total = p.progress?.total || 0;
      return total > 0 ? (p.progress.completed || 0) / total : 0;
    };

    if (sortBy === 'progress_desc') {
      return getProgressPct(b) - getProgressPct(a);
    }
    if (sortBy === 'progress_asc') {
      return getProgressPct(a) - getProgressPct(b);
    }
    return 0;
  });

  return (
    <>
      {/* Row 1: Filters (Spacious) */}
      <div className="row g-2 mb-3 align-items-end" style={{ maxWidth: 900 }}>
        <div className="col-sm-5">
          <input
            type="search"
            className="form-control"
            placeholder="Search by name, DOB, or MRN"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search patients"
          />
        </div>
        <div className="col-sm-4">
          <SpecialistFilter value={specialistType} onChange={setSpecialistType} />
        </div>
        <div className="col-sm-3">
          <InsuranceFilter value={insuranceStatus} onChange={setInsuranceStatus} />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p className="text-muted">
          {hasActiveFilters ? 'No patients match your filters.' : 'No patients found.'}
        </p>
      ) : (
        <>
          {/* Row 2: Patient count (Left) & Sort controls (Right) */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div className="text-muted small" data-testid="patient-count">
              Showing {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
            </div>
            {enableSort && (
              <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                <span className="text-muted small text-nowrap">Sort by:</span>
                <select
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort patients"
                  style={{ width: 'auto', minWidth: 200 }}
                >
                  <option value="date_desc">Newest registered</option>
                  <option value="progress_desc">Progress: highest first</option>
                  <option value="progress_asc">Progress: lowest first</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="bmi_desc">BMI: highest first</option>
                  <option value="bmi_asc">BMI: lowest first</option>
                </select>
              </div>
            )}
          </div>
          <PatientTableList patients={sortedPatients} onPatientClick={onPatientClick} disableClick={disableClick} />
        </>
      )}
    </>
  );
};

export default SearchBar;
