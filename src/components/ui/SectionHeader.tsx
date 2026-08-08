import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, action }) => (
  <div className="ui-section-header">
    <div>
      <h2 className="ui-section-title">{title}</h2>
      {description && <p className="ui-section-desc">{description}</p>}
    </div>
    {action}
  </div>
);

export default SectionHeader;
