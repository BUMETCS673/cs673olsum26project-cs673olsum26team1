// AI-USAGE SUMMARY
// Tools: Claude Code (review fixes applied by team lead)
// Overall AI Contribution: ~50%
// AI-Assisted Areas: Initial component structure and BMI calculation logic
// Human Contributions: Fixed eligibility threshold (>= 27), added input validation,
//   replaced alert() with inline display, replaced location.state with AuthContext,
//   wired calculateBMI utility, added Bootstrap styling

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { calculateBMI } from '../utils/bmi';
import { showError } from '../utils/toast';
import { apiRequest } from '../utils/api';

function BMICalculationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const heightInches = Number(height);
    const weightPounds = Number(weight);

    const bmi = calculateBMI(heightInches, weightPounds);

    if (!bmi || isNaN(bmi)) {
      showError('Please enter valid height and weight values.');
      return;
    }

    setBmiResult(bmi.toFixed(1));
  };

  const handleContinue = async () => {
    if (user?.patientId) {
      try {
        await apiRequest(`/patients/${user.patientId}/bmi`, {
          method: 'PATCH',
          body: JSON.stringify({ bmi: Number(bmiResult) }),
        });
      } catch {
        showError('Failed to save BMI. Please try again.');
        return;
      }
    }
    if (Number(bmiResult) >= 27) {
      navigate('/bmi', { state: { bmi: bmiResult } });
    } else {
      navigate('/bmi-ineligible', { state: { ...user, bmi: bmiResult } });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 500 }}>
        <h2>BMI Calculation</h2>
        {user && <p>Welcome {user.name}, let&apos;s calculate your BMI.</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Height (inches)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 65"
              min="1"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Weight (pounds)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 180"
              min="1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Calculate BMI
          </button>
        </form>

        {bmiResult && (
          <div className="mt-4 p-3 border rounded text-center">
            <p className="mb-1 text-muted">Your BMI</p>
            <h3 className="mb-1">{bmiResult}</h3>
            <p className="mb-3 text-muted" style={{ fontSize: 14 }}>
              {Number(bmiResult) >= 27 ? 'You may be eligible for the program.' : 'You may not be eligible for the program.'}
            </p>
            <button className="btn btn-success w-100" onClick={handleContinue}>
              Continue
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default BMICalculationPage;
