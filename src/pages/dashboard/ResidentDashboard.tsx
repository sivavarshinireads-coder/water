import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, DollarSign, AlertTriangle as AlertTriangle, Info, CheckCircle as CheckCircle, Sparkles, Activity, ShieldCheck, ChevronRight, Leaf } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUserSummary } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { residentCode } from '../../utils/publicCodes';
import {
  PageLayout, DashboardHero, HeroBadge, StatCard, ChartCard,
  SectionHeader, LoadingState, Button
} from '../../components/ui';
import Card from '../../components/ui/Card';
import { getConservationTier } from '../../utils/waterTipsData';

const alertIcon = (type: string) => {
  if (type === 'warning') return <AlertTriangle size={18} className="text-amber-500" />;
  if (type === 'success') return <CheckCircle size={18} className="text-teal-500" />;
  return <Info size={18} className="text-primary-600" />;
};

const alertClass = (type: string) => {
  if (type === 'warning') return 'alert-row-warning';
  if (type === 'success') return 'alert-row-success';
  return 'alert-row-info';
};

const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserSummary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading consumption telemetry..." />;
  if (error) return <div className="error-center">{error}</div>;

  // Extract usage data to determine the tier
  let myUsage = 0;
  let avgUsage = 3000;

  if (data?.monthlyUsage && data.monthlyUsage.length > 0) {
    const latestMonth = data.monthlyUsage[data.monthlyUsage.length - 1];
    myUsage = latestMonth.usage || 0;
  }

  if (data?.apartmentComparison && data.apartmentComparison.length > 0) {
    const latestComp = data.apartmentComparison[data.apartmentComparison.length - 1];
    if (latestComp.avgUsage) {
      avgUsage = latestComp.avgUsage;
    }
  }

  const tier = getConservationTier(myUsage, avgUsage);

  return (
    <PageLayout>
      <DashboardHero
        title={`Welcome back, ${user?.name || 'Resident'}`}
        subtitle="Your live household water telemetry, consumption breakdown, and active billing cycle status."
        badges={
          <>
            <HeroBadge><ShieldCheck size={14} /> Unit: {residentCode(user)}</HeroBadge>
            <HeroBadge><Activity size={14} /> Billing Cycle: {data.billingCycle}</HeroBadge>
            <HeroBadge><Sparkles size={14} /> Telemetry Active</HeroBadge>
          </>
        }
      />

      <SectionHeader title="Today's Summary" description="Current usage and estimated billing" />

      <div className="ui-grid ui-grid--2">
        <StatCard
          label="Today's Usage"
          value={data.todayUsage}
          sub={`Cycle: ${data.billingCycle}`}
          icon={<Droplet size={22} className="text-primary-600" />}
          iconBg="bg-primary-50"
          progress={42}
        />
        <StatCard
          label="Estimated Bill"
          value={data.currentBill}
          sub="Calculated for current billing cycle"
          icon={<DollarSign size={22} className="text-teal-600" />}
          iconBg="bg-teal-50"
          progress={65}
          progressColor="linear-gradient(90deg, #14b8a6, #0ea5e9)"
        />
      </div>

      {/* Eco Efficiency Standing Section */}
      <div className="eco-dashboard-widget" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: tier.badgeClass.includes('saver') ? 'var(--green-50)' : tier.badgeClass.includes('balanced') ? 'var(--brand-50)' : 'var(--amber-50)',
            padding: 12,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: tier.badgeClass.includes('saver') ? 'var(--green-200)' : tier.badgeClass.includes('balanced') ? 'var(--brand-200)' : 'var(--amber-200)'
          }}>
            <Leaf size={24} className={tier.badgeClass.includes('saver') ? 'text-green-600' : tier.badgeClass.includes('balanced') ? 'text-brand-600' : 'text-amber-600'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--slate-800)', margin: 0 }}>Eco-Efficiency Standing</h4>
              <span className={`eco-badge ${tier.badgeClass}`}>{tier.name}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--slate-600)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              {tier.feedback}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase' }}>Eco-Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--slate-800)', lineHeight: 1 }}>
              {tier.score}
              <span style={{ fontSize: 12, color: 'var(--slate-400)', fontWeight: 500 }}>/100</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/dashboard/user/tips')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            Water Tips Portal <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      <SectionHeader title="Usage Analytics" description="Monthly and weekly consumption trends" />

      <div className="ui-grid ui-grid--2">
        <ChartCard title="Monthly Consumption Trend" tag="Liters (L)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthlyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Line type="monotone" dataKey="usage" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} name="Usage (L)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="This Week Daily Breakdown" tag="Daily Liters">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weeklyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="usage" fill="#0d9488" radius={[6, 6, 0, 0]} name="Usage (L)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeader title="Alerts & Comparison" description="Notifications and apartment benchmarks" />

      <div className="ui-grid ui-grid--2">
        <Card padding="lg">
          <h3 className="ui-panel-title"><Sparkles size={18} /> Recent Telemetry Alerts</h3>
          {data.recentAlerts.map((alert: any) => (
            <div key={alert.id} className={`alert-row ${alertClass(alert.type)}`}>
              <div style={{ marginTop: 2 }}>{alertIcon(alert.type)}</div>
              <div style={{ flex: 1 }}>
                <p>{alert.message}</p>
                <p className="alert-time">{alert.time}</p>
              </div>
            </div>
          ))}
        </Card>

        <ChartCard
          title="Usage vs. Apartment Average"
          legend={
            <div className="legend" style={{ marginTop: 4 }}>
              <span className="flex-row-center"><span className="legend-dot legend-dot-primary" /> You</span>
              <span className="flex-row-center"><span className="legend-dot legend-dot-slate" /> Apt Avg</span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.apartmentComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="myUsage" stroke="#0d9488" strokeWidth={2.5} dot={false} name="My Usage" />
              <Line type="monotone" dataKey="avgUsage" stroke="#cbd5e1" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Apt. Avg" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageLayout>
  );
};

export default ResidentDashboard;
