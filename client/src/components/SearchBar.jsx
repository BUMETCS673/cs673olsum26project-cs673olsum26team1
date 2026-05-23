import React, { useState, useEffect, useRef } from 'react';
import SpecialistFilter from './SpecialistFilter';
import InsuranceFilter from './InsuranceFilter';
import PatientTableList from './PatientTableList';

const SearchBar = () => {
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
        const response = await fetch(`/api/patients${qs ? `?${qs}` : ''}`);
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
