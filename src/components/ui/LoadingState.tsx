import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="ui-loading-state">
    <div className="spinner-center" />
    <p className="loading-text">{message}</p>
  </div>
);

export default LoadingState;
