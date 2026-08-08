import React from 'react';
import { Settings, Bell, Shield, Database, Palette } from 'lucide-react';
import PageLayout from '../../components/ui/PageLayout';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';

const settingsSections = [
  {
    icon: <Bell size={18} />,
    title: 'Notifications',
    description: 'Configure email alerts, usage thresholds, and billing reminders.',
    status: 'Coming soon',
  },
  {
    icon: <Shield size={18} />,
    title: 'Security & Access',
    description: 'Manage authentication policies, session timeouts, and role permissions.',
    status: 'Coming soon',
  },
  {
    icon: <Database size={18} />,
    title: 'Data & Integrations',
    description: 'Connect meter hardware, export data, and configure API access.',
    status: 'Coming soon',
  },
  {
    icon: <Palette size={18} />,
    title: 'Appearance',
    description: 'Customize branding, colors, and dashboard layout preferences.',
    status: 'Coming soon',
  },
];

const SettingsPage: React.FC = () => (
  <PageLayout>
    <PageHeader
      title="System Settings"
      subtitle="Configure platform preferences, notifications, and integrations"
      breadcrumb="Administration"
    />

    <SectionHeader
      title="General"
      description="Core platform configuration options"
    />

    <div className="ui-grid ui-grid--2">
      {settingsSections.map(section => (
        <Card key={section.title} hover padding="lg">
          <CardHeader
            icon={section.icon}
            title={section.title}
            subtitle={section.description}
            action={<span className="badge badge-inactive">{section.status}</span>}
          />
        </Card>
      ))}
    </div>

    <SectionHeader title="Platform Info" />

    <Card padding="lg">
      <CardBody>
        <div className="ui-settings-info">
          <div className="ui-settings-info-row">
            <Settings size={20} />
            <div>
              <p className="ui-settings-info-label">Application</p>
              <p className="ui-settings-info-value">AquaTrack v4.0</p>
            </div>
          </div>
          <div className="ui-settings-info-row">
            <Database size={20} />
            <div>
              <p className="ui-settings-info-label">Environment</p>
              <p className="ui-settings-info-value">Production</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  </PageLayout>
);

export default SettingsPage;
