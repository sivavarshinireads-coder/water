import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => (
  <div className={`ui-page-layout ${className}`.trim()}>{children}</div>
);

export default PageLayout;
