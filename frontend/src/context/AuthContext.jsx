import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // In a real app, parse from JWT or fetch /me

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Mock decoding token
      setUser({ nim: '1301190001', name: 'Devin Octavian', role: 'student' });
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (nim, password) => {
    // In a real app, fetch /api/v1/auth/login
    // Here we just mock it
    const mockToken = 'mock_jwt_token_for_' + nim;
    setToken(mockToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
