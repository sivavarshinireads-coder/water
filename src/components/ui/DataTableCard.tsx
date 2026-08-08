import React from 'react';
import Card, { CardHeader } from './Card';

interface DataTableCardProps {
  title?: string;
  action?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DataTableCard: React.FC<DataTableCardProps> = ({ title, action, toolbar, children, className = '' }) => (
  <Card className={`ui-table-card ${className}`.trim()} padding="none">
    {(title || action || toolbar) && (
      <div className="ui-table-toolbar">
        {title ? <CardHeader title={title} action={action} /> : action}
        {toolbar}
      </div>
    )}
    <div className="ui-table-body">{children}</div>
  </Card>
);

export default DataTableCard;
