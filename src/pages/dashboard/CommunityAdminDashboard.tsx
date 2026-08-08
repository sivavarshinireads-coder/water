import React, { useEffect, useState } from 'react';
import { Users, Droplets, CalendarDays, AlertTriangle as AlertTriangle, Clock, FileText, Sparkles, Building2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminSummary } from '../../api/auth';
import {
  PageLayout, DashboardHero, HeroBadge, StatCard, ChartCard,
  SectionHeader, LoadingState,
} from '../../components/ui';
import Card from '../../components/ui/Card';

const CommunityAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminSummary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading community metrics..." />;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <PageLayout>
      <DashboardHero
        title="Community Command Center"
        subtitle="Manage resident onboarding, monitor bulk water distribution, track outstanding bills, and resolve leak alerts."
        badges={
          <>
            <HeroBadge><Building2 size={14} /> Active Cycle: {data.currentCycle}</HeroBadge>
            <HeroBadge><Users size={14} /> {data.totalUsers} Onboarded Residents</HeroBadge>
            <HeroBadge><Sparkles size={14} /> Auto-Billing Enabled</HeroBadge>
          </>
        }
      />

      <SectionHeader title="Overview" description="Community performance metrics" />

      <div className="ui-grid ui-grid--3">
        <StatCard
          label="Total Residents"
          value={data.totalUsers}
          sub="Active community households"
          icon={<Users size={22} className="text-teal-600" />}
          iconBg="bg-teal-50"
          progress={85}
          progressColor="linear-gradient(90deg, #14b8a6, #0ea5e9)"
        />
        <StatCard
          label="Total Water Used"
          value={data.totalWaterUsed}
          sub="Cumulative volume (kL)"
          icon={<Droplets size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          progress={60}
        />
        <StatCard
          label="Current Cycle"
          value={data.currentCycle}
          sub="Active billing period"
          icon={<CalendarDays size={22} className="text-slate-600" />}
          iconBg="bg-slate-50"
          progress={100}
          progressColor="#64748b"
        />
      </div>

      <SectionHeader title="Water Analytics" description="Usage trends and bulk purchases" />

      <div className="ui-grid ui-grid--2">
        <ChartCard title="Monthly Community Water Usage" tag="kL">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyUsage}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Area type="monotone" dataKey="total" stroke="#0d9488" strokeWidth={2.5} fill="url(#usageGrad)" name="Usage (kL)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bulk Water Purchases" tag="kL">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.waterPurchase}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="purchased" fill="#0d9488" radius={[6, 6, 0, 0]} name="Purchased (kL)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeader title="Activity & Alerts" description="Recent updates and pending items" />

      <div className="ui-grid ui-grid--3">
        <Card padding="lg">
          <h3 className="ui-panel-title"><Clock size={18} /> Recent Activity</h3>
          {data.recentActivities.map((a: any) => (
            <div key={a.id} className="activity-row">
              <div className="activity-dot" />
              <div>
                <p className="activity-text">{a.text}</p>
                <p className="activity-time">{a.time}</p>
              </div>
            </div>
          ))}
        </Card>

        <Card padding="lg">
          <h3 className="ui-panel-title"><FileText size={18} className="text-amber-500" /> Pending Invoices</h3>
          {data.pendingBills.map((b: any) => (
            <div key={b.id} className="bill-row">
              <div>
                <p className="bill-unit">Unit {b.unit}</p>
                <p className="bill-due">Due: {b.dueDate}</p>
              </div>
              <span className="bill-amount">{b.amount}</span>
            </div>
          ))}
        </Card>

        <Card padding="lg">
          <h3 className="ui-panel-title"><AlertTriangle size={18} className="text-red-500" /> Active Leak Alerts</h3>
          {data.leakAlerts.map((l: any) => (
            <div key={l.id} className={`leak-row ${l.severity === 'high' ? 'leak-row-high' : 'leak-row-medium'}`}>
              <div className="flex-row-center" style={{ gap: 8 }}>
                <span className={`leak-severity ${l.severity === 'high' ? 'leak-severity-high' : 'leak-severity-medium'}`}>{l.severity}</span>
                <span className="leak-unit">Unit {l.unit}</span>
              </div>
              <p className="leak-message">{l.message}</p>
            </div>
          ))}
        </Card>
      </div>
    </PageLayout>
  );
};

export default CommunityAdminDashboard;
