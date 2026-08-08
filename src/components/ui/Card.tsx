import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'ui-card--pad-sm',
  md: 'ui-card--pad-md',
  lg: 'ui-card--pad-lg',
};

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md', hover = false }) => (
  <div className={`ui-card ${paddingMap[padding]} ${hover ? 'ui-card--hover' : ''} ${className}`.trim()}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, icon, className = '' }) => (
  <div className={`ui-card-header ${className}`.trim()}>
    <div className="ui-card-header-text">
      {icon && <span className="ui-card-header-icon">{icon}</span>}
      <div>
        <h3 className="ui-card-title">{title}</h3>
        {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="ui-card-header-action">{action}</div>}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`ui-card-body ${className}`.trim()}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`ui-card-footer ${className}`.trim()}>{children}</div>
);

export default Card;
