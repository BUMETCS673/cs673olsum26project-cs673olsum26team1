// AI-USAGE SUMMARY
// Tools: Claude Code (integration fixes applied by team lead)
// Overall AI Contribution: ~40%
// AI-Assisted Areas: Integration wiring (useAuth, location.state, apiRequest)
// Human Contributions: Original component structure and UI (PR #9 author)

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/toast';
import Navbar from '../components/Navbar';

export default function BMIForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const patientId = user?.patientId;
  const bmiFromCalc = location.state?.bmi;

  const [bmi, setBmi] = useState(bmiFromCalc || '');
  const [previousSurgery, setPreviousSurgery] = useState('no');
  const [recommendation, setRecommendation] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    const fetchPrevSurgery = async () => {
      try {
        const patientData = await apiRequest(`/patients/${patientId}`);
        if (patientData.prevSurgery) {
          setPreviousSurgery(patientData.prevSurgery);
        }
      } catch {
        // non-fatal — default stays 'no'
      }
    };

    fetchPrevSurgery();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const data = await apiRequest('/patients/recommendation', {
        method: 'POST',
        body: JSON.stringify({ bmi: parseFloat(bmi), previousSurgery }),
      });
      setRecommendation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitChoice = async () => {
    if (!patientId) {
      showError('Unable to identify your patient record. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/patients/${patientId}/specialist`, {
        method: 'PATCH',
        body: JSON.stringify({ specialistChoice: selectedSpecialist }),
      });

      await apiRequest(`/patients/${patientId}/submit`, { method: 'POST' });

      navigate(`/thank-you/${patientId}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: '600px' }}>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h3 className="card-title text-center mb-4 fw-bold">
              Almost There! Let&apos;s Find Out What Specialist You Need.
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Your Calculated BMI</label>
                <input
                  type="number"
                  step="0.1"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  required
                  readOnly
                  className="form-control py-2 bg-light text-muted"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Have you had previous bariatric surgery?
                </label>
                <select
                  value={previousSurgery}
                  onChange={(e) => setPreviousSurgery(e.target.value)}
                  className="form-select py-2"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fs-5"
                disabled={loading || !bmi}
              >
                {loading ? 'Calculating...' : 'Get Recommendation'}
              </button>
            </form>

            {error && <div className="alert alert-danger mt-4">{error}</div>}

            {recommendation && (
              <div className="mt-4 p-4 bg-light border border-primary-subtle rounded text-center shadow-sm">
                <p className="text-muted mb-1 fw-semibold">Your Primary Recommendation</p>
                <h3 className="text-primary mb-3">{recommendation.primary}</h3>

                {recommendation.primary !== 'Not eligible' && (
                  <button
                    type="button"
                    className={`btn ${selectedSpecialist === recommendation.primary ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedSpecialist(recommendation.primary)}
                  >
                    {selectedSpecialist === recommendation.primary ? 'Selected: ' : 'Choose '}
                    {recommendation.primary}
                  </button>
                )}

                {recommendation.alternative && (
                  <>
                    <hr className="my-4 mx-auto" style={{ width: '60%' }} />
                    <p className="text-muted mb-1 fw-semibold">Alternative Option</p>
                    <h5 className="text-secondary mb-3">{recommendation.alternative}</h5>
                    <button
                      type="button"
                      className={`btn ${selectedSpecialist === recommendation.alternative ? 'btn-secondary' : 'btn-outline-secondary'}`}
                      onClick={() => setSelectedSpecialist(recommendation.alternative)}
                    >
                      {selectedSpecialist === recommendation.alternative ? 'Selected: ' : 'Choose '}
                      {recommendation.alternative}
                    </button>
                  </>
                )}

                {selectedSpecialist && (
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn btn-success w-100 py-2 fs-5"
                      onClick={submitChoice}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Choice'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
