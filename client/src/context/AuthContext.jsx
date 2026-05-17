// 5-16-2026
// AuthContext.jsx
// Stores the logged in user and role
// For now calls backend which returns
// a hardcoded logged in user
// Firebase auth will be added later
// by whoever implements BARI-7

import { createContext, useContext,
         useState, useEffect }
  from 'react';

import axios from 'axios';

const AuthContext = createContext();

// useAuth hook
// Any component calls this to get
// the current user and their role
export const useAuth = () =>
  useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  // currentUser holds the user object
  // returned from the backend
  // { id, name, email, role }
  const [currentUser, setCurrentUser] =
    useState(null);

  // userRole holds the role string
  // PATIENT, COORDINATOR, PROGRAM_DIRECTOR
  const [userRole, setUserRole] = useState(null);

  // loading prevents the app from
  // rendering before we have user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Call backend to get current user
    // Backend is hardcoded for now
    // to always return a logged in user
    const fetchUser = async () => {
      try {

        // Call GET /api/auth/me
        // Backend returns the user object
        const response = await axios.get(
          'http://localhost:5000/api/auth/me'
        );

        // Store the full user object
        // response.data contains:
        // { id, name, email, role }
        setCurrentUser(response.data);

        // Store role separately for
        // easy access in components
        setUserRole(response.data.role);

      } catch (error) {
        // Backend call failed
        // Could mean not logged in
        // or backend is down
        console.error(
          'Could not get user:',
          error.message
        );

        // Nobody is logged in
        setCurrentUser(null);
        setUserRole(null);
      }

      // Done loading
      setLoading(false);
    };

    fetchUser();

  }, []); // Runs once when app starts

  const value = {
    currentUser,
    userRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};