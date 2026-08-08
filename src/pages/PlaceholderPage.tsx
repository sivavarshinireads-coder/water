import React from 'react';
import { Construction, Sparkles } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Card';

interface Props {
  title: string;
}

const PlaceholderPage: React.FC<Props> = ({ title }) => (
  <PageLayout>
    <Card padding="none">
      <div className="coming-soon-page">
        <div className="coming-soon-icon-wrap">
          <Construction size={36} />
        </div>
        <h3 className="coming-soon-title">{title}</h3>
        <p className="coming-soon-desc">
          We're building this feature to give you a richer experience.
          Check back soon for updates.
        </p>
        <span className="coming-soon-badge">
          <Sparkles size={14} /> Coming Soon
        </span>
      </div>
    </Card>
  </PageLayout>
);

export default PlaceholderPage;
