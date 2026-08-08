import React from 'react';

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  badges?: React.ReactNode;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ title, subtitle, badges }) => (
  <div className="ui-dashboard-hero">
    <div className="ui-dashboard-hero-content">
      <h1 className="ui-dashboard-hero-title">{title}</h1>
      <p className="ui-dashboard-hero-subtitle">{subtitle}</p>
      {badges && <div className="ui-dashboard-hero-badges">{badges}</div>}
    </div>
  </div>
);

export const HeroBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="ui-hero-badge">{children}</span>
);

export default DashboardHero;
