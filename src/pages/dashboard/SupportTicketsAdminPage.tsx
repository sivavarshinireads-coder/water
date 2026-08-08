import React, { useEffect, useState } from 'react';
import { AlertCircle, LifeBuoy, Send, MessageSquare } from 'lucide-react';
import { getAllSupportTickets, respondToSupportTicket } from '../../api/auth';

const statusClass: Record<string, string> = {
  OPEN: 'ticket-status-open',
  IN_PROGRESS: 'ticket-status-in_progress',
  RESOLVED: 'ticket-status-resolved',
  CLOSED: 'ticket-status-closed',
};

const priorityClass: Record<string, string> = {
  LOW: 'ticket-priority-low',
  MEDIUM: 'ticket-priority-medium',
  HIGH: 'ticket-priority-high',
  URGENT: 'ticket-priority-urgent',
};

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const PRIORITY_WEIGHTS: Record<string, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const SupportTicketsAdminPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortByUrgency, setSortByUrgency] = useState(true);
  const [drafts, setDrafts] = useState<Record<number, { response: string; status: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = (status?: string) => {
    getAllSupportTickets(status || undefined)
      .then((list: any[]) => {
        setTickets(list);
        setDrafts(prev => {
          const next = { ...prev };
          list.forEach(t => {
            if (!next[t.id]) next[t.id] = { response: t.response || '', status: t.status };
          });
          return next;
        });
      })
      .catch(() => setError('Unable to load support tickets.'));
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const respond = async (id: number) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    setError('');
    setMessage('');
    try {
      await respondToSupportTicket(id, { response: draft.response, status: draft.status });
      setMessage('Reply sent to the user.');
      load(filter);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Unable to send the reply.');
    } finally {
      setSavingId(null);
    }
  };

  // Filter and sort tickets on client-side
  const processedTickets = [...tickets]
    .filter(t => !priorityFilter || t.priority === priorityFilter)
    .sort((a, b) => {
      if (sortByUrgency) {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 2;
        const weightB = PRIORITY_WEIGHTS[b.priority] || 2;
        if (weightA !== weightB) {
          return weightB - weightA; // Higher weights first (Urgent first)
        }
      }
      // Fallback/Default: sort by date descending (newest first)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">Support Tickets</h2>
        <p className="page-subtitle">Issues raised by residents and community admins. Reply and update the status here.</p>
      </div>

      {/* Upgraded filter bar with Priority & Sorting */}
      <div className="card filter-bar" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Status:</label>
          <select className="input-field" style={{ width: 150, margin: 0 }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Priority:</label>
          <select className="input-field" style={{ width: 150, margin: 0 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <input
            type="checkbox"
            id="sortByUrgency"
            checked={sortByUrgency}
            onChange={e => setSortByUrgency(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="sortByUrgency" className="form-label" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
            Sort by Urgency (Urgent First)
          </label>
        </div>
      </div>

      {message && (
        <div className="alert-box alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      <div className="card">
        <h3 className="panel-title">
          <LifeBuoy size={18} /> All Tickets
        </h3>
        {!processedTickets.length ? (
          <div className="empty-state empty-state-compact">
            <div className="empty-icon"><MessageSquare size={24} /></div>
            <p className="empty-title">No tickets found</p>
            <p className="empty-desc">Support issues matching your filters will appear here.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {processedTickets.map((t: any) => {
              const draft = drafts[t.id] || { response: t.response || '', status: t.status };
              return (
                <div key={t.id} className="ticket-card">
                  <div className="ticket-card-header">
                    <div>
                      <p className="ticket-subject">{t.subject}</p>
                      <p className="ticket-category">
                        ID: #{t.id} · <b>{t.raisedByName}</b> ({t.raisedByRole.replace('_', ' ')}) · {t.raisedByEmail}
                        {t.category ? ` · Category: ${t.category}` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`ticket-priority ${priorityClass[t.priority] || 'ticket-priority-medium'}`}>
                        {t.priority || 'MEDIUM'}
                      </span>
                      <span className={`ticket-status ${statusClass[t.status] || 'ticket-status-closed'}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="ticket-body">{t.description}</p>
                  <p className="ticket-time">Raised {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</p>

                  <div className="ticket-admin-form">
                    <div>
                      <label className="form-label">Reply</label>
                      <textarea
                        className="input-field textarea-field"
                        rows={3}
                        value={draft.response}
                        onChange={e => setDrafts(prev => ({ ...prev, [t.id]: { ...draft, response: e.target.value } }))}
                        placeholder="Write a reply to the user"
                      />
                    </div>
                    <div>
                      <label className="form-label">Status</label>
                      <select
                        className="input-field input-select"
                        value={draft.status}
                        onChange={e => setDrafts(prev => ({ ...prev, [t.id]: { ...draft, status: e.target.value } }))}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                      <button className="btn-primary btn-sm ticket-send-btn" onClick={() => respond(t.id)} disabled={savingId === t.id}>
                        <Send size={14} /> {savingId === t.id ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsAdminPage;
