import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '../config/firebase';
import { apiRequest } from '../utils/api';
import { getRouteForRole } from '../utils/roleRedirect';
import { showSuccess, showError } from '../utils/toast';
import GoogleButton from '../components/GoogleButton';
import '../styles/auth.css';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------- Email/Password Login ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Firebase verifies the password
      const userCredential = await signInWithEmailAndPassword(
        auth, formData.email, formData.password
      );
      // 2. Get the token
      const idToken = await userCredential.user.getIdToken();
      // 3. Backend confirms the user + returns their role
      const user = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      setUser(user);
      showSuccess(`Welcome back, ${user.name}!`);
      navigate(getRouteForRole(user.role), { replace: true });
    } catch (err) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        showError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        showError('Too many attempts. Please try again later.');
      } else {
        showError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Google Login ----------
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const user = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });

      showSuccess(`Welcome back, ${user.name}!`);
      console.log("Logged in user:", user);
      console.log("Redirecting to:", getRouteForRole(user.role));
      navigate(getRouteForRole(user.role));
    } catch (err) {
      showError(err.message || 'Google login failed');
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your BariatricPath account</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <label className="auth-form-label">Email</label>
            <Form.Control
              type="email" name="email" value={formData.email}
              onChange={handleChange} required disabled={loading}
              placeholder="jane@example.com"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <label className="auth-form-label">Password</label>
            <div className="password-field">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password" value={formData.password}
                onChange={handleChange} required disabled={loading}
                placeholder="Enter your password"
              />
              <button
                type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </Form.Group>

          <Button
            variant="primary" type="submit"
            className="w-100" disabled={loading}
          >
            {loading
              ? <><Spinner size="sm" className="me-2" />Logging in...</>
              : 'Log In'}
          </Button>
        </Form>

        <div className="auth-divider">or</div>

        <GoogleButton
          onClick={handleGoogleLogin}
          disabled={loading}
          label="Continue with Google"
        />

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;