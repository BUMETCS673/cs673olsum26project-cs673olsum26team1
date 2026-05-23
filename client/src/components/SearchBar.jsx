// AI-USAGE SUMMARY
// Tools: VS Code Copilot, Claude Code (I was experimenting with both tools.)
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation, component structure, UI elements, 
// event handling, debounce, and state management.
// Human Contributions: Providing the business loggic and modularizing the search bar 
// as its own component. Originally, all of this was in the coordinator dashboard.
// Notes: see below for detailed breakdown of contributions and modifications.

import React, { useState, useEffect, useRef } from 'react';
import SpecialistFilter from './SpecialistFilter';
import InsuranceFilter from './InsuranceFilter';
import PatientTableList from './PatientTableList';
const API_URL = import.meta.env.VITE_API_URL;

const SearchBar = () => {
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
        const response = await fetch(`${API_URL}/patients${qs ? `?${qs}` : ''}`);
        if (!response.ok) throw new Error('Unable to load patients');
        setPatients(await response.json());
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

  return (
    <>
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
        <PatientTableList patients={patients} />
      )}
    </>
  );
};

export default SearchBar;
