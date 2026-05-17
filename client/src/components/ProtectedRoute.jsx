// ProtectedRoute.jsx
// This component protects pages
// from being accessed by the wrong user
//
// How it works:
// Wrap a page with ProtectedRoute
// and tell it which roles are allowed
// If the user does not have
// the right role they get redirected
//
// Example usage in App.jsx:
// <ProtectedRoute allowedRoles={['PATIENT']}>
//   <PatientPortal />
// </ProtectedRoute>

// Navigate redirects to another page
import { Navigate } from 'react-router-dom';

// useAuth gives us the current user and role
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({
  children,      // The page to protect
  allowedRoles   // Array of roles that can see it
}) => {

  // Get current user and their role
  const { currentUser, userRole } = useAuth();

  // If nobody is logged in
  // redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If allowedRoles is specified
  // and user role is not in the list
  // redirect to login page
  // Example: patient trying to access
  // coordinator dashboard gets redirected
  if (allowedRoles &&
      !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // User is logged in and has correct role
  // Render the protected page
  return children;
};

export default ProtectedRoute;