// AI-USAGE SUMMARY
// Tools: Claude
// Overall AI Contribution: ~40%
// AI-Assisted Areas: component structure, Firebase reset flow, error handling
// Human Contributions: styling integration with existing auth pages, testing
// Notes: uses Firebase's built-in sendPasswordResetEmail — no backend route needed

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';
import { auth, sendPasswordResetEmail } from '../config/firebase';
import { showSuccess, showError } from '../utils/toast';
import '../styles/auth.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      // Always show success even if email doesn't exist
      setSent(true);
      showSuccess('If an account exists, a reset link has been sent.');
    } catch (err) {
      if (err.code === 'auth/invalid-email') {
        showError('Please enter a valid email address');
      } else {
        setSent(true);
        showSuccess('If an account exists, a reset link has been sent.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">B</span>
        </div>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a reset link
        </p>

        {sent ? (
          <div className="text-center">
            <p className="mb-3">
              Check your inbox for a password reset link.
              It may take a few minutes to arrive.
            </p>
            <Link to="/login" className="btn btn-primary w-100">
              Back to Login
            </Link>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <label className="auth-form-label">Email</label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading
                ? <><Spinner size="sm" className="me-2" />Sending...</>
                : 'Send Reset Link'}
            </Button>

            <p className="auth-footer-text">
              <Link to="/login">Back to Login</Link>
            </p>
          </Form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;