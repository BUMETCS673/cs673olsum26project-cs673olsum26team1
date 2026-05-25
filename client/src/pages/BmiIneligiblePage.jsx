// AI-USAGE SUMMARY
// Tools: ChatGPT-4, Claude
// OVerall AI contribution: ~50%
// AI Assisted areas: styles section and fixing code formatting
// Human input: created the code structure and logic for the page and what the messages should say, debugging AI input code

import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function BmiIneligible() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state; // data passed from BMI page

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>BMI Not Eligible</h2>

          {user?.bmi && (
            <p style={styles.bmiText}>
              Your BMI: <strong>{user.bmi}</strong>
            </p>
          )}

          <p style={styles.message}>
            Based on your BMI, you are currently not eligible for the program.
          </p>

          <p style={styles.subMessage}>
            Please consult a healthcare provider.
          </p>

        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
    padding: 20,
  },
  card: {
    maxWidth: 400,
    padding: 25,
    border: '1px solid #ddd',
    borderRadius: 10,
    textAlign: 'center',
  },
  title: {
    marginBottom: 15,
  },
  bmiText: {
    fontSize: 18,
    marginBottom: 10,
  },
  message: {
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: 10,
    width: '100%',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
};

export default BmiIneligible;
