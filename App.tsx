import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';

const AppContent: React.FC = () => {
  const { isAuthenticated, setToken, isInitializing } = useStore();
  
  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Store token and authenticate
        await setToken(token);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    handleOAuthCallback();
  }, [setToken]);
  
  if (isInitializing) {
    return <Loader />;
  }
  
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