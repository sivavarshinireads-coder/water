import React from 'react';
import Card, { CardHeader } from './Card';

interface ChartCardProps {
  title: string;
  tag?: string;
  action?: React.ReactNode;
  legend?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, tag, action, legend, children, className = '' }) => (
  <Card className={`ui-chart-card ${className}`.trim()} padding="lg">
    <div className="ui-chart-header">
      <div>
        <h3 className="ui-chart-title">{title}</h3>
        {legend}
      </div>
      <div className="ui-chart-header-right">
        {tag && <span className="ui-chart-tag">{tag}</span>}
        {action}
      </div>
    </div>
    <div className="ui-chart-body">{children}</div>
  </Card>
);

export default ChartCard;
