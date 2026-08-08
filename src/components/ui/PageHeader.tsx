import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions, breadcrumb }) => (
  <header className="ui-page-header">
    <div className="ui-page-header-main">
      {breadcrumb && <p className="ui-breadcrumb">{breadcrumb}</p>}
      <h1 className="ui-page-title">{title}</h1>
      {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="ui-page-header-actions">{actions}</div>}
  </header>
);

export default PageHeader;
