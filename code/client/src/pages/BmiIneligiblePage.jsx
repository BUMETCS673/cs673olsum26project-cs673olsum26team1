// AI-USAGE SUMMARY
// Tools: Claude Code (review fixes applied by team lead)
// Overall AI Contribution: ~50%
// AI-Assisted Areas: Initial component structure and layout
// Human Contributions: Removed unused useNavigate import, removed dead style objects,
//   converted inline styles to Bootstrap classes

import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

function BmiIneligible() {
  const location = useLocation();
  const user = location.state;

  return (
    <>
      <Navbar />
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card p-4 text-center" style={{ maxWidth: 400 }}>
          <h2 className="mb-3">BMI Not Eligible</h2>

          {user?.bmi && (
            <p className="fs-5 mb-2">
              Your BMI: <strong>{user.bmi}</strong>
            </p>
          )}

          <p className="mb-2">
            Based on your BMI, you are currently not eligible for the program.
          </p>

          <p className="text-muted" style={{ fontSize: 14 }}>
            Please consult a healthcare provider for next steps or consider
            lifestyle changes and try again later.
          </p>
        </div>
      </div>
    </>
  );
}

export default BmiIneligible;
