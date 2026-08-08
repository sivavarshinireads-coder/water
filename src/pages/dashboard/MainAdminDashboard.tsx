import React, { useEffect, useState } from 'react';
import { Users, Building2, UserCheck, Droplets, Eye, Ban, Trash2, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMainAdminSummary } from '../../api/auth';
import {
  PageLayout, DashboardHero, HeroBadge, StatCard, ChartCard,
  DataTableCard, SectionHeader, LoadingState, Button,
} from '../../components/ui';
import Card from '../../components/ui/Card';

const statusBadge = (status: string) =>
  status === 'active' ? 'badge-active' : 'badge-inactive';

const MainAdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMainAdminSummary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading platform telemetry..." />;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <PageLayout>
      <DashboardHero
        title="Platform Administration Center"
        subtitle="Real-time platform monitoring, community admin permissions, apartment portfolio management, and system water metrics."
        badges={
          <>
            <HeroBadge><ShieldCheck size={14} /> Super Admin Control</HeroBadge>
            <HeroBadge><Building2 size={14} /> {data.totalApartments} Registered Apartments</HeroBadge>
            <HeroBadge><Sparkles size={14} /> Global Telemetry Online</HeroBadge>
          </>
        }
      />

      <SectionHeader title="Key Metrics" description="Platform-wide overview at a glance" />

      <div className="ui-grid ui-grid--4">
        <StatCard
          label="Community Admins"
          value={data.totalCommunityAdmins}
          sub="Assigned administrators"
          icon={<UserCheck size={22} className="text-primary-600" />}
          iconBg="bg-primary-50"
          progress={75}
        />
        <StatCard
          label="Total Apartments"
          value={data.totalApartments}
          sub="Connected complexes"
          icon={<Building2 size={22} className="text-teal-600" />}
          iconBg="bg-teal-50"
          progress={90}
          progressColor="linear-gradient(90deg, #14b8a6, #0ea5e9)"
        />
        <StatCard
          label="Total Users"
          value={data.totalUsers}
          sub="Registered accounts"
          icon={<Users size={22} className="text-blue-600" />}
          iconBg="bg-blue-50"
          progress={65}
        />
        <StatCard
          label="System Water Usage"
          value={data.totalSystemWaterUsage}
          sub="Total kL monitored"
          icon={<Droplets size={22} style={{ color: '#0891b2' }} />}
          iconBg="bg-cyan-50"
          progress={80}
          progressColor="#0891b2"
        />
      </div>

      <SectionHeader title="Analytics" description="System-wide water usage trends" />

      <ChartCard title="System-wide Water Usage Telemetry" tag="kL">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.systemUsage}>
            <defs>
              <linearGradient id="systemGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }} />
            <Area type="monotone" dataKey="usage" stroke="#0d9488" strokeWidth={2.5} fill="url(#systemGrad)" name="Usage (kL)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <SectionHeader
        title="Community Admins"
        description="Manage platform administrators"
        action={<Button size="sm" icon={<UserPlus size={15} />}>Add Admin</Button>}
      />

      <DataTableCard>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Email Contact</th>
                <th className="center">Apartments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.communityAdmins.map((admin: any) => (
                <tr key={admin.id}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">{admin.name.charAt(0)}</div>
                      <span className="table-user-name">{admin.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{admin.email}</td>
                  <td style={{ textAlign: 'center' }}><span className="apartment-count">{admin.apartments}</span></td>
                  <td><span className={`badge ${statusBadge(admin.status)}`}>{admin.status}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn view" title="View"><Eye size={14} /> View</button>
                      <button className="action-btn disable" title="Disable"><Ban size={14} /> Disable</button>
                      <button className="action-btn remove" title="Remove"><Trash2 size={14} /> Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataTableCard>

      <SectionHeader title="Recent Activity" description="Latest platform signups" />

      <Card padding="lg">
        {data.recentSignups.map((s: any) => (
          <div key={s.id} className="signup-row">
            <div className="table-avatar">{s.name.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <p className="signup-name">{s.name}</p>
              <p className="signup-meta">{s.role.replace('_', ' ')} · {s.time}</p>
            </div>
            <span className={`badge ${s.role === 'RESIDENT' ? 'badge-active' : 'badge-info'}`}>
              {s.role === 'RESIDENT' ? 'Resident' : 'Admin'}
            </span>
          </div>
        ))}
      </Card>
    </PageLayout>
  );
};

export default MainAdminDashboard;
