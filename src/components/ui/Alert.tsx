import React from 'react';
import { AlertCircle as AlertCircle, CheckCircle as CheckCircle, Info } from 'lucide-react';

type AlertVariant = 'error' | 'info' | 'success';

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const icons: Record<AlertVariant, React.ReactNode> = {
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
  success: <CheckCircle size={16} />,
};

const Alert: React.FC<AlertProps> = ({ variant = 'info', children, className = '' }) => (
  <div className={`alert-box alert-${variant} ui-alert ${className}`.trim()}>
    <span className="ui-alert-icon">{icons[variant]}</span>
    <span>{children}</span>
  </div>
);

export default Alert;
