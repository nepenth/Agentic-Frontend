import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider, useSelector } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './store';
import { getTheme } from './theme';
import type { RootState } from './store';

// Components
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import WorkflowList from './components/WorkflowList';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Utilities from './pages/Utilities';
import Settings from './pages/Settings';
import WorkflowTemplate from './pages/WorkflowTemplate';

// Workflow modules
import EmailAssistant from './modules/email-assistant/EmailAssistant';
import DocumentAnalyzer from './modules/document-analyzer/DocumentAnalyzer';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// App content with routing - this runs inside the Redux provider
const AppContent: React.FC = () => {
  console.log('AppContent: Starting AppContent component');
  
  try {
    console.log('AppContent: Getting theme from Redux store...');
    const { theme: themeMode } = useSelector((state: RootState) => state.ui);
    console.log('AppContent: Theme mode:', themeMode);
    
    console.log('AppContent: Creating theme...');
    const currentTheme = getTheme(themeMode);
    console.log('AppContent: Theme created:', currentTheme);

    console.log('AppContent: Rendering theme provider and router...');
    return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with layout */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/utilities"
            element={
              <PrivateRoute>
                <Layout>
                  <Utilities />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            }
          />
          
          {/* Workflow routes */}
          <Route
            path="/workflows"
            element={
              <PrivateRoute>
                <Layout>
                  <WorkflowTemplate 
                    title="Workflows"
                    description="Select and manage your AI workflows"
                    status="active"
                  >
                    <WorkflowList />
                  </WorkflowTemplate>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/workflows/email-assistant"
            element={
              <PrivateRoute>
                <Layout>
                  <EmailAssistant />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/workflows/document-analyzer"
            element={
              <PrivateRoute>
                <Layout>
                  <DocumentAnalyzer />
                </Layout>
              </PrivateRoute>
            }
          />
          
          {/* Default redirects - FIXED: redirect to login first, let PrivateRoute handle dashboard redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
  } catch (error) {
    console.error('AppContent: Error in AppContent:', error);
    return <div style={{padding: '20px', color: 'red'}}>AppContent Error: {String(error)}</div>;
  }
};

// Main App component with providers
const App: React.FC = () => {
  console.log('App.tsx: App component rendering');
  
  try {
    console.log('App.tsx: Creating Redux Provider with store:', store);
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </Provider>
    );
  } catch (error) {
    console.error('App.tsx: Error in App component:', error);
    return <div>Error loading app: {String(error)}</div>;
  }
};

export default App;