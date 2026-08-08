import React, { useEffect, useMemo, useState } from 'react';
import { Factory as History, Droplet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMyBills } from '../../api/auth';

const formatMonth = (month: string) => {
  if (!month) return '—';
  const m = month.length >= 7 ? month.slice(0, 7) : month;
  const [y, mo] = m.split('-');
  const idx = Number(mo);
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  if (idx >= 1 && idx <= 12) return `${names[idx - 1]} ${y}`;
  return month;
};

const statusBadge = (status: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'PAID') return 'badge-active';
  if (s === 'UNPAID') return 'badge-warning';
  return 'badge-info';
};

const UsageHistoryPage: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyBills()
      .then((data: any) => setBills(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load usage history.'))
      .finally(() => setLoading(false));
  }, []);

  // Last 12 months, oldest to newest, for the chart and table.
  const monthly = useMemo(() => {
    return [...bills]
      .sort((a, b) => (a.month || '').localeCompare(b.month || ''))
      .slice(-12);
  }, [bills]);

  const chartData = monthly.map(b => ({
    month: formatMonth(b.month),
    Liters: b.consumptionLiters ?? b.totalLiters ?? 0,
  }));

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">Usage History</h2>
        <p className="page-subtitle">Your monthly water consumption over the past year</p>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Monthly Consumption</h3>
          <span className="chart-tag">Liters</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Line type="monotone" dataKey="Liters" stroke="#3b97f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b97f6' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center">
            <History size={16} className="text-slate-400" />
            Monthly Readings
          </h3>
          <span className="table-count-label">{monthly.length} month{monthly.length !== 1 ? 's' : ''}</span>
        </div>

        {monthly.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Droplet size={24} /></div>
            <p className="empty-title">No usage history yet</p>
            <p className="empty-desc">Your monthly readings will appear here once meter readings are logged.</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Previous Reading</th>
                <th>Current Reading</th>
                <th>Units Consumed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...monthly].reverse().map(b => (
                <tr key={b.month}>
                  <td>{formatMonth(b.month)}</td>
                  <td>{b.previousReading ?? '—'}</td>
                  <td>{b.currentReading ?? '—'}</td>
                  <td className="text-semibold">{(b.consumptionLiters ?? b.totalLiters ?? 0).toLocaleString('en-IN')} L</td>
                  <td><span className={`badge ${statusBadge(b.status)}`}>{b.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageHistoryPage;
