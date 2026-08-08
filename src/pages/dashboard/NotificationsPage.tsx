import React, { useEffect, useState } from 'react';
import { Bell, Receipt, AlertTriangle as AlertTriangle, Info, CreditCard } from 'lucide-react';
import { getNotifications } from '../../api/auth';

const typeIcon = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('bill') || t.includes('invoice')) return { Icon: Receipt, cls: 'notification-icon-bill' };
  if (t.includes('alert') || t.includes('leak') || t.includes('usage')) return { Icon: AlertTriangle, cls: 'notification-icon-alert' };
  if (t.includes('payment') || t.includes('paid')) return { Icon: CreditCard, cls: 'notification-icon-payment' };
  return { Icon: Info, cls: 'notification-icon-info' };
};

const NotificationsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .catch(() => [])
      .then((n: any[]) =>
        setItems(
          [...(n || [])].sort((x: any, y: any) =>
            String(y.createdAt).localeCompare(String(x.createdAt))
          )
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner-center" />
        <p className="loading-text">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">Notifications</h2>
        <p className="page-subtitle">Bills, excess water-use alerts, and payment updates.</p>
      </div>

      <div className="panel-card" style={{ padding: items.length ? '16px' : undefined }}>
        {items.length ? (
          items.map(n => {
            const { Icon, cls } = typeIcon(n.type);
            return (
              <div className="notification-item" key={`${n.type}-${n.id}`}>
                <div className={`notification-icon ${cls}`}>
                  <Icon size={18} />
                </div>
                <div className="notification-body">
                  <p className="notification-message">{n.message}</p>
                  <div className="notification-meta">
                    <span className="notification-type-badge">{n.type}</span>
                    <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state" style={{ height: 240 }}>
            <div className="empty-icon"><Bell size={24} /></div>
            <p className="empty-title">No notifications yet</p>
            <p className="empty-desc">New bills and community updates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
