import React, { useState, useEffect, useRef } from "react";
//import { apiRequest } from "../utils/api";

const CoordinatorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchDebounceRef = useRef(null);

  // Fetch patients from backend and apply server-side search with debounce
  useEffect(() => {
    const fetchPatients = async (query = "") => {
      try {
        setLoading(true);
        setError(null);
        const endpoint = `/api/patients${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Unable to load patients');
        }
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchPatients(searchTerm);
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchTerm]);

  // Patients are already filtered by the backend search endpoint
  const filteredPatients = patients;

  return (
    <div className="container mt-5">
      <h1>Coordinator Dashboard</h1>

      <div className="mb-3" style={{ maxWidth: 480 }}>
        <input
          type="search"
          className="form-control"
          placeholder="Search patients by name, DOB (YYYY-MM-DD) or MRN"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search patients"
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading patients...</p>
      ) : filteredPatients.length === 0 ? (
        <p className="text-muted">
          {searchTerm.trim() ? "No patients match your search." : "No patients found."}
        </p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>MRN</th>
              <th>Date of Birth</th>
              <th>BMI</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.name}</td>
                <td>{patient.mrn}</td>
                <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                <td>{patient.bmi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CoordinatorDashboard;