import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, setToken } = useStore();
  
  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      // Store token and redirect
      localStorage.setItem('nebula_token', token);
      setToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setToken]);
  
  return isAuthenticated ? <Dashboard /> : <Auth />;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;