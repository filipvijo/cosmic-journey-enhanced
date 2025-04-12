import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Import auth from your config

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up onAuthStateChanged listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // --- Add Logging ---
      console.log('AuthContext: onAuthStateChanged triggered.');
      if (user) {
        console.log('AuthContext: User found:', user.uid);
      } else {
        console.log('AuthContext: No user found.');
      }
      // --- End Logging ---

      setCurrentUser(user);
      setLoading(false);
      console.log('AuthContext: Loading set to false.');
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('AuthContext: Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
  };

  // --- Add Logging ---
  console.log('AuthContext: Provider rendering. Loading:', loading, 'CurrentUser:', !!currentUser);
  // --- End Logging ---

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
