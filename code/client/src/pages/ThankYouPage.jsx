// AI-USAGE SUMMARY
// Tools: Claude Code (integration fixes applied by team lead)
// Overall AI Contribution: ~30%
// AI-Assisted Areas: Navbar addition
// Human Contributions: Original component structure and UI (PR #10 author)

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import Navbar from '../components/Navbar';

const ThankYouPage = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No patient ID provided in the URL.');
      setLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      try {
        const data = await apiRequest(`/patients/${id}`);
        setPatientData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your confirmation details...</p>
        </div>
      </>
    );
  }

  if (error || !patientData) {
    return (
      <>
        <Navbar />
        <div className="container mt-5">
          <div className="alert alert-danger text-center">
            <h4>Unable to load confirmation</h4>
            <p>{error || 'Patient data not found.'}</p>
          </div>
        </div>
      </>
    );
  }

  const patientName = patientData.name || '[Patient Name]';
  const specialistName = patientData.visitType || '[Specialist Name/Type]';

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-body p-5">
            <h1 className="mb-4 text-success">Thank You, {patientName}!</h1>

            <p className="lead">
              You have successfully completed your Bariatric Path registration.
            </p>

            <p>
              A confirmation email containing your specialist choice has been sent to your inbox.
              A program coordinator will call you within 1 to 2 business days to schedule your
              initial appointment.
            </p>

            <div className="mt-4 p-4 bg-light rounded">
              <h4 className="mb-3">Your Confirmation Details:</h4>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <strong>Specialist Selected:</strong> {specialistName}
                </li>
              </ul>
            </div>

            <div className="text-center mt-4">
              <Link to="/patient/portal" className="btn btn-primary px-4 py-2 fw-bold">
                View Your Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;
