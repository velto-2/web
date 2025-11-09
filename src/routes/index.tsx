import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { Spin } from "antd";

// Auth Pages
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";

// Dashboard Pages
import { DashboardPage } from "../pages/dashboard/DashboardPage";

// User Management Pages
import { UserListPage } from "../pages/users/UserListPage";

// Test Pages
import { TestListPage } from "../pages/tests/TestListPage";
import { CreateTestPage } from "../pages/tests/CreateTestPage";
import { TestDetailsPage } from "../pages/tests/TestDetailsPage";
import { TestResultsPage } from "../pages/tests/TestResultsPage";

// Imported Calls Pages
import { ImportedCallsListPage } from "../pages/imported-calls/ImportedCallsListPage";
import { UploadCallPage } from "../pages/imported-calls/UploadCallPage";
import { CallDetailPage } from "../pages/imported-calls/CallDetailPage";
import { AnalyticsPage as ImportedCallsAnalyticsPage } from "../pages/imported-calls/AnalyticsPage";

// Analytics Pages
import { AnalyticsPage } from "../pages/analytics/AnalyticsPage";

// Test Schedules Pages
import { TestSchedulesListPage } from "../pages/test-schedules/TestSchedulesListPage";
import { CreateSchedulePage } from "../pages/test-schedules/CreateSchedulePage";

// Test Comparison Pages
import { TestComparisonPage } from "../pages/test-comparison/TestComparisonPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
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

      {/* Protected Routes - All voice testing features require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Voice Tests */}
        <Route path="tests">
          <Route index element={<TestListPage />} />
          <Route path="new" element={<CreateTestPage />} />
          <Route path=":id" element={<TestDetailsPage />} />
          <Route path="runs/:id" element={<TestResultsPage />} />
        </Route>

        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* Test Schedules */}
        <Route path="test-schedules">
          <Route index element={<TestSchedulesListPage />} />
          <Route path="new" element={<CreateSchedulePage />} />
        </Route>

        {/* Test Comparison */}
        <Route path="test-comparison" element={<TestComparisonPage />} />

        {/* Imported Calls */}
        <Route path="imported-calls">
          <Route index element={<ImportedCallsListPage />} />
          <Route path="upload" element={<UploadCallPage />} />
          <Route path="analytics" element={<ImportedCallsAnalyticsPage />} />
          <Route path=":id" element={<CallDetailPage />} />
        </Route>

        {/* User Management */}
        <Route path="users" element={<UserListPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
