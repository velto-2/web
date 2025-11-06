import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { store } from './store';
import { AppRoutes } from './routes';
import './App.css';

const theme = {
  token: {
    colorPrimary: '#667eea',
    borderRadius: 8,
  },
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider theme={theme}>
          <QueryProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </QueryProvider>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
