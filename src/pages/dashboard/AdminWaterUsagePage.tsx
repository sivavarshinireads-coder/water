import React, { useEffect, useMemo, useState } from 'react';
import { Droplets, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWaterUsage, getHouseholds } from '../../api/auth';

const AdminWaterUsagePage: React.FC = () => {
  const [readings, setReadings] = useState<any[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    Promise.all([getWaterUsage(currentMonth), getHouseholds()])
      .then(([usageData, householdData]) => {
        setReadings(Array.isArray(usageData) ? usageData : []);
        setHouseholds(Array.isArray(householdData) ? householdData : []);
      })
      .catch(() => setError('Failed to load water usage data.'))
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const perHousehold = useMemo(() => {
    const householdNameById: Record<number, string> = {};
    households.forEach((h: any) => { householdNameById[h.id] = h.unitNumber; });

    const grouped: Record<number, { householdId: number; unitNumber: string; totalLiters: number; readingCount: number; lastReadingDate?: string }> = {};

    readings.forEach((r: any) => {
      const id = r.householdId;
      if (!grouped[id]) {
        grouped[id] = {
          householdId: id,
          unitNumber: householdNameById[id] || r.unitNumber || `#${id}`,
          totalLiters: 0,
          readingCount: 0,
          lastReadingDate: undefined,
        };
      }
      grouped[id].totalLiters += Number(r.liters) || 0;
      grouped[id].readingCount += 1;
      if (!grouped[id].lastReadingDate || r.readingDate > grouped[id].lastReadingDate!) {
        grouped[id].lastReadingDate = r.readingDate;
      }
    });

    return Object.values(grouped).sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
  }, [readings, households]);

  const chartData = perHousehold.map(h => ({ name: `Unit ${h.unitNumber}`, Liters: h.totalLiters }));

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">Water Usage</h2>
        <p className="page-subtitle">Per-household consumption for {currentMonth}</p>
      </div>

      {perHousehold.length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon bg-primary-50"><Droplets size={20} className="text-primary-600" /></div>
            <div>
              <p className="stat-label">Total Liters</p>
              <p className="stat-value">{perHousehold.reduce((s, h) => s + h.totalLiters, 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-teal-50"><Gauge size={20} className="text-teal-600" /></div>
            <div>
              <p className="stat-label">Households</p>
              <p className="stat-value">{perHousehold.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-amber-50"><Droplets size={20} className="text-amber-600" /></div>
            <div>
              <p className="stat-label">Total Readings</p>
              <p className="stat-value">{perHousehold.reduce((s, h) => s + h.readingCount, 0)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Usage by Household</h3>
          <span className="chart-tag">Liters</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="Liters" fill="#3b97f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center">
            <Droplets size={16} className="text-slate-400" />
            Per-Household Usage — {currentMonth}
          </h3>
          <span className="table-count-label">{perHousehold.length} household{perHousehold.length !== 1 ? 's' : ''}</span>
        </div>

        {perHousehold.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Gauge size={24} /></div>
            <p className="empty-title">No readings this month</p>
            <p className="empty-desc">Per-household usage will appear here once meter readings are logged.</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Household</th>
                <th>Total Liters</th>
                <th>Readings Logged</th>
                <th>Last Reading Date</th>
              </tr>
            </thead>
            <tbody>
              {perHousehold.map(h => (
                <tr key={h.householdId}>
                  <td className="text-semibold">Unit {h.unitNumber}</td>
                  <td className="text-semibold">{h.totalLiters.toLocaleString('en-IN')} L</td>
                  <td>{h.readingCount}</td>
                  <td className="text-muted">{h.lastReadingDate || '—'}</td>
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

export default AdminWaterUsagePage;
