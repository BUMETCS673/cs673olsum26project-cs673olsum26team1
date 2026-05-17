import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '../config/firebase';
import { apiRequest } from '../utils/api';
import { getRouteForRole } from '../utils/roleRedirect';
import { showSuccess, showError } from '../utils/toast';
import GoogleButton from '../components/GoogleButton';
import '../styles/auth.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //  Email/Password Registration 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      showError('Please enter your full name');
      return;
    }
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the Firebase user (Firebase hashes the password)
      const userCredential = await createUserWithEmailAndPassword(
        auth, formData.email, formData.password
      );
      // 2. Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      // 3. Create the DB record via our backend
      const user = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: formData.name, idToken }),
      });

      showSuccess(`Welcome, ${user.name}! Your account is ready.`);
      navigate(getRouteForRole(user.role));
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        showError('An account with this email already exists. Try logging in.');
      } else if (err.code === 'auth/invalid-email') {
        showError('Please enter a valid email address');
      } else if (err.code === 'auth/weak-password') {
        showError('Password is too weak. Use at least 8 characters.');
      } else {
        showError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  //  Google Sign-Up 
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      let user;
      try {
        user = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: result.user.displayName || 'New Patient',
            idToken,
          }),
        });
      } catch (err) {
        if (err.message.includes('already registered')) {
          user = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
          });
        } else {
          throw err;
        }
      }

      showSuccess(`Welcome, ${user.name}!`);
      navigate(getRouteForRole(user.role));
    } catch (err) {
      showError(err.message || 'Google sign-up failed');
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
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start tracking your bariatric care journey</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <label className="auth-form-label">Full Name</label>
            <Form.Control
              type="text" name="name" value={formData.name}
              onChange={handleChange} required disabled={loading}
              placeholder="Jane Doe"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <label className="auth-form-label">Email</label>
            <Form.Control
              type="email" name="email" value={formData.email}
              onChange={handleChange} required disabled={loading}
              placeholder="jane@example.com"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <label className="auth-form-label">Password</label>
            <div className="password-field">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} required disabled={loading}
                placeholder="At least 8 characters" minLength={8}
              />
              <button
                type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="password-hint">Use at least 8 characters.</p>
          </Form.Group>

          <Form.Group className="mb-4">
            <label className="auth-form-label">Confirm Password</label>
            <div className="password-field">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} required disabled={loading}
                placeholder="Re-enter your password"
              />
            </div>
          </Form.Group>

          <Button
            variant="primary" type="submit"
            className="w-100" disabled={loading}
          >
            {loading
              ? <><Spinner size="sm" className="me-2" />Creating account...</>
              : 'Create Account'}
          </Button>
        </Form>

        <div className="auth-divider">or</div>

        <GoogleButton
          onClick={handleGoogleSignUp}
          disabled={loading}
          label="Sign up with Google"
        />

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;