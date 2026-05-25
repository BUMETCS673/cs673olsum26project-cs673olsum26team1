// AI-USAGE SUMMARY
// Tools: ChatGPT-4, Claude
// Overall AI contribution: ~70%
// AI Assisted areas: filling out all the code needed from human made bare code, including form handling, validation, and navigation logic.
// Human input: Initial code structure, debugging, testing, and final verification.

import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { calculateBMI } from '../utils/bmi.js';

function BMICalculationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state;

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const h = Number(height);
    const w = Number(weight);

    if (!height || isNaN(h) || h <= 0 || h > 120) {
      newErrors.height = 'Please enter a valid height (1–120 inches).';
    }
    if (!weight || isNaN(w) || w <= 0 || w > 1500) {
      newErrors.weight = 'Please enter a valid weight (1–1500 lbs).';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const heightInches = Number(height);
    const weightPounds = Number(weight);
    const bmi = calculateBMI(heightInches, weightPounds);
    if (bmi === null) return;

    alert(`Your BMI is ${bmi.toFixed(1)}`);

    if (bmi >= 27) {
      navigate('/patient/portal', { state: { ...user, bmi: bmi.toFixed(1) } });
    } else {
      navigate('/bmi-ineligible', { state: { ...user, bmi: bmi.toFixed(1) } });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="card-title mb-3">BMI Calculation</h2>
                {user && (
                  <p className="text-muted mb-4">
                    Welcome <strong>{user.name}</strong>, let's calculate your BMI.
                  </p>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Height (inches)</label>
                    <input
                      className={`form-control ${errors.height ? 'is-invalid' : ''}`}
                      placeholder="e.g. 68"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    {errors.height && (
                      <div className="invalid-feedback">{errors.height}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Weight (pounds)</label>
                    <input
                      className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                      placeholder="e.g. 160"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    {errors.weight && (
                      <div className="invalid-feedback">{errors.weight}</div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Calculate BMI
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BMICalculationPage;
