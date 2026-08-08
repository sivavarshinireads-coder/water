import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg?: string;
  progress?: number;
  progressColor?: string;
  trend?: { value: string; positive?: boolean };
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon,
  iconBg = 'bg-primary-50',
  progress,
  progressColor,
  trend,
}) => (
  <div className="ui-stat-card">
    <div className={`ui-stat-icon ${iconBg}`}>{icon}</div>
    <div className="ui-stat-content">
      <p className="ui-stat-label">{label}</p>
      <div className="ui-stat-value-row">
        <p className="ui-stat-value">{value}</p>
        {trend && (
          <span className={`ui-stat-trend ${trend.positive ? 'ui-stat-trend--up' : 'ui-stat-trend--down'}`}>
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="ui-stat-sub">{sub}</p>}
      {progress !== undefined && (
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{
              width: `${Math.min(100, progress)}%`,
              ...(progressColor ? { background: progressColor } : {}),
            }}
          />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
