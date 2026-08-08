import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="ui-empty-state">
    <div className="ui-empty-icon">{icon}</div>
    <h3 className="ui-empty-title">{title}</h3>
    <p className="ui-empty-desc">{description}</p>
    {action && <div className="ui-empty-action">{action}</div>}
  </div>
);

export default EmptyState;
