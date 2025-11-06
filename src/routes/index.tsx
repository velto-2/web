import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Dashboard Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';

// Job Pages
import { JobListPage } from '../pages/jobs/JobListPage';
import { JobDetailsPage } from '../pages/jobs/JobDetailsPage';
import { CreateJobPage } from '../pages/jobs/CreateJobPage';

// Offer Pages
import { OfferListPage } from '../pages/offers/OfferListPage';

// Contract Pages
import { ContractListPage } from '../pages/contracts/ContractListPage';

// Payment Pages
import { PaymentListPage } from '../pages/payments/PaymentListPage';

// User Management Pages
import { UserListPage } from '../pages/users/UserListPage';

// Calculator Page
import { CalculatorPage } from '../pages/calculator/CalculatorPage';

// Test Pages
import { TestListPage } from '../pages/tests/TestListPage';
import { CreateTestPage } from '../pages/tests/CreateTestPage';
import { TestDetailsPage } from '../pages/tests/TestDetailsPage';
import { TestResultsPage } from '../pages/tests/TestResultsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route index element={<LoginPage />} />
      </Route>
      
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route index element={<RegisterPage />} />
      </Route>

      {/* Tests - Public for testing (bypass auth) */}
      <Route
        path="/"
        element={<AppLayout />}
      >
        <Route path="tests">
          <Route index element={<TestListPage />} />
          <Route path="new" element={<CreateTestPage />} />
          <Route path=":id" element={<TestDetailsPage />} />
          <Route path="runs/:id" element={<TestResultsPage />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/tests" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Job Management */}
        <Route path="jobs">
          <Route index element={<JobListPage />} />
          <Route path="new" element={<CreateJobPage />} />
          <Route path=":id" element={<JobDetailsPage />} />
        </Route>
        
        {/* Offers */}
        <Route path="offers" element={<OfferListPage />} />
        
        {/* Contracts */}
        <Route path="contracts" element={<ContractListPage />} />
        
        {/* Payments */}
        <Route path="payments" element={<PaymentListPage />} />
        
        {/* User Management */}
        <Route path="users" element={<UserListPage />} />
        
        {/* Calculator */}
        <Route path="calculator" element={<CalculatorPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/tests" replace />} />
    </Routes>
  );
};