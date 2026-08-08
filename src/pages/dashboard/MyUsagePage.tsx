import React, { useEffect, useState } from 'react';
import { Droplet, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getResidentReport } from '../../api/auth';

const MyUsagePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getResidentReport()
      .then(setData)
      .catch(() => setError('Failed to load usage data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error) return <div className="error-center">{error}</div>;

  const monthlyData = Object.entries(data.monthlyTotals || {}).map(([month, usage]: [string, any]) => ({
    month,
    usage: Number(usage),
  }));

  const weeklyData = data.weeklyUsage || [];

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">My Water Usage</h2>
        <p className="page-subtitle">Track your consumption patterns and history</p>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon bg-primary-50"><Droplet size={20} className="text-primary-600" /></div>
          <div>
            <p className="stat-label">This Month</p>
            <p className="stat-value">{data.monthTotalLiters} L</p>
            <p className="stat-sub">{data.currentMonth}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-teal-50"><TrendingUp size={20} className="text-teal-600" /></div>
          <div>
            <p className="stat-label">All-Time Usage</p>
            <p className="stat-value">{data.allTimeTotalLiters} L</p>
            <p className="stat-sub">Total recorded</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-50"><Calendar size={20} className="text-amber-600" /></div>
          <div>
            <p className="stat-label">Total Readings</p>
            <p className="stat-value">{data.readingCount}</p>
            <p className="stat-sub">Data points logged</p>
          </div>
        </div>
      </div>

      <div className="grid-2-2">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Usage Trend</h3>
            <span className="chart-tag">Liters</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="usage" stroke="#3b97f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b97f6' }} activeDot={{ r: 5 }} name="Usage (L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">This Week</h3>
            <span className="chart-tag">Daily Liters</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="usage" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Usage (L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3>Daily Readings — {data.currentMonth}</h3>
        </div>
        {data.dailyReadings && data.dailyReadings.length > 0 ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Liters</th>
                  <th>Meter Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyReadings.map((r: any, i: number) => (
                  <tr key={i}>
                    <td className="text-muted">{r.date}</td>
                    <td className="text-semibold">{r.liters} L</td>
                    <td><span className="badge badge-info">{r.meterSerialNumber || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><Droplet size={28} /></div>
            <h3 className="empty-title">No readings yet</h3>
            <p className="empty-desc">Water usage readings will appear here once logged.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUsagePage;
