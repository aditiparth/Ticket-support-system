import React, { useState, useEffect } from 'react';
import { authAPI } from './services/api';
import { getToken, setToken, setUser, removeToken, removeUser } from './utils/auth';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      // Verify token with backend
      authAPI.getCurrentUser()
        .then(response => {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token invalid, remove it
          removeToken();
          removeUser();
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUser();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;