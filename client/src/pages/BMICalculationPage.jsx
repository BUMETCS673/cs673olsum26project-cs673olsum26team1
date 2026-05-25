import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import {calculateBMI} from '../utils/bmi.js';


function BMICalculationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state; // data passed from Register

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
    const weightPounds = Number(weight)
    const bmi = calculateBMI(heightInches, weightPounds);

    alert(`Your BMI is ${bmi.toFixed(1)}`);

    // later: save to backend here

    
    if (bmi >= 27) {
      navigate('/patient/portal', {
        state: {
          ...user,
          bmi: bmi.toFixed(1),
        },
      });
    } else {
      navigate('/bmi-ineligible', {
        state: {
          ...user,
          bmi: bmi.toFixed(1),
        },
      });
    }
  };

  return (
    <>
    <Navbar />
    <div style={{ padding: 20 }}>
      <h2>BMI Calculation</h2>

      {user && <p>Welcome {user.name}, let's calculate your BMI.</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Height (inches)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
          {errors.height && <p style={{ color: 'red', margin: '4px 0' }}>{errors.height}</p>}

        <br />

        <input
          placeholder="Weight (pounds)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <br />
        {errors.weight && <p style={{ color: 'red', margin: '4px 0' }}>{errors.weight}</p>}

        <button type="submit">Calculate BMI</button>
      </form>
    </div>
    </>
  );
}

export default BMICalculationPage;