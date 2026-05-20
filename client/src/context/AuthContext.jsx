import { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../config/firebase';
import { apiRequest } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    
  const [loading, setLoading] = useState(true);

  // Refresh authenticated user from backend
const refreshUser = async () => {
    try {
      const dbUser = await apiRequest('/auth/me');
      setUser(dbUser);
  
      return dbUser;
    } catch (error) {
      console.error('refreshUser failed:', error);
  
      setUser(null);
  
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
            if (firebaseUser) {
              await refreshUser();
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          } finally {
            setLoading(false);
          }
        });
    
        return unsubscribe;
      }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}