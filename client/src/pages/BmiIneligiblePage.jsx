// AI-USAGE SUMMARY
// Tools: ChatGPT-4, Claude
// Overall AI contribution: ~50%
// AI Assisted areas: styles section and fixing code formatting
// Human input: created the code structure and logic for the page and what the messages should say, debugging AI input code

import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function BmiIneligible() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state;

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm text-center">
              <div className="card-body p-4">
                <div className="mb-3">
                  <span className="display-4">⚠️</span>
                </div>

                <h2 className="card-title mb-3">Not Eligible</h2>

                {user?.bmi && (
                  <p className="fs-5 mb-3">
                    Your BMI: <strong>{user.bmi}</strong>
                  </p>
                )}

                <p className="text-muted mb-2">
                  Based on your BMI, you are currently not eligible for the program.
                </p>

                <p className="text-muted small mb-4">
                  Please consult a healthcare provider for guidance.
                </p>

                <button
                  className="btn btn-danger w-100 mb-2"
                  onClick={() => navigate('/bmi-calculation', { state: user })}
                >
                  Recalculate BMI
                </button>

                <button
                  className="btn btn-secondary w-100"
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BmiIneligible;
