import React, { useState, useEffect } from 'react';


// TODO: Replace with actual patient ID from useAuth context when available
// Hardcoded to 230 for testing. 
export default function BMIForm({ patientId = 230 }) {
  const [bmi, setBmi] = useState('');
  const [previousSurgery, setPreviousSurgery] = useState('no');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPatient, setFetchingPatient] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/patients/${patientId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load patient data');
        }

        const patientData = await response.json();
        if (patientData.bmi) {
          setBmi(patientData.bmi);
        }
        if (patientData.prevSurgery) {
          setPreviousSurgery(patientData.prevSurgery);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setFetchingPatient(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);
    setSaveStatus(null);

    try {
      // Using 127.0.0.1 instead of localhost to bypass common IPv6 resolution bugs
      const response = await fetch('http://127.0.0.1:5001/api/patients/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bmi: parseFloat(bmi),
          previousSurgery
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChoose = async (specialist) => {
    setSaveStatus(null);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/patients/${patientId}/specialist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialistChoice: specialist })
      });

      if (!response.ok) {
        throw new Error('Failed to save choice');
      }

      setSaveStatus({ type: 'success', message: `Successfully saved your choice: ${specialist}` });
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4 fw-bold">Almost There! Let's Find Out What Specialist You Need.</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Your Calculated BMI</label>
              <input
                type="number"
                step="0.1"
                placeholder={fetchingPatient ? "Loading..." : "Enter your BMI"}
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                required
                readOnly
                className="form-control py-2 bg-light text-muted"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Have you had previous bariatric surgery?</label>
              <select
                value={previousSurgery}
                onChange={(e) => setPreviousSurgery(e.target.value)}
                className="form-select py-2"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fs-5" disabled={loading || !bmi}>
              {loading ? 'Calculating...' : 'Get Recommendation'}
            </button>
          </form>

          {error && <div className="alert alert-danger mt-4">{error}</div>}

          {recommendation && (
            <div className="mt-4 p-4 bg-light border border-primary-subtle rounded text-center shadow-sm">
              <p className="text-muted mb-1 fw-semibold">Your Primary Recommendation</p>
              <h3 className="text-primary mb-3">{recommendation.primary}</h3>
              {recommendation.primary !== 'Not eligible' && (
                <button type="button" className="btn btn-outline-primary" onClick={() => handleChoose(recommendation.primary)}>
                  Choose {recommendation.primary}
                </button>
              )}

              {recommendation.alternative && (
                <>
                  <hr className="my-4 mx-auto" style={{ width: '60%' }} />
                  <p className="text-muted mb-1 fw-semibold">Alternative Option</p>
                  <h5 className="text-secondary mb-3">{recommendation.alternative}</h5>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => handleChoose(recommendation.alternative)}>
                    Choose {recommendation.alternative}
                  </button>
                </>
              )}

              {saveStatus && (
                <div className={`alert alert-${saveStatus.type === 'success' ? 'success' : 'danger'} mt-4 mb-0`}>
                  {saveStatus.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
