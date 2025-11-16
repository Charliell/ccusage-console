import React from 'react';
import DashboardDark from './components/DashboardDark';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <DashboardDark />
    </ErrorBoundary>
  );
};

export default App;
