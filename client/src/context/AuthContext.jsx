import { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '../config/firebase';
import { apiRequest } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const dbUser = await apiRequest('/auth/me');
    setUser(dbUser);
    return dbUser;
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