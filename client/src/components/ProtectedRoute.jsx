
// AI-USAGE SUMMARY
// Tools: ChatGPT
// Overall AI Contribution: ~10%
// AI-Assisted Areas: Minor configuration guidance
// Human Contributions: Main implementation, integration, and verification
// Notes: File primarily implemented and validated manually.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

/**
 * Wraps routes that require login. Optionally restricts by role.
 * Usage: <ProtectedRoute allowedRoles={['COORDINATOR']}><Dashboard/></ProtectedRoute>
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;