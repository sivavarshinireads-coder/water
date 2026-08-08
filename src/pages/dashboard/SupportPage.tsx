import React, { useEffect, useState } from 'react';
import { AlertCircle, LifeBuoy, Send, Clock, CheckCircle2, MessageSquare, AlertTriangle, ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { raiseSupportTicket, getMySupportTickets } from '../../api/auth';

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

const CATEGORIES = ['Billing', 'Telemetry', 'Leakage', 'Account', 'Other'];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', desc: 'General queries or feedback', color: 'selected-low' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Non-blocking service issues', color: 'selected-medium' },
  { value: 'HIGH', label: 'High', desc: 'Billing errors or sensor glitches', color: 'selected-high' },
  { value: 'URGENT', label: 'Urgent', desc: 'Critical leak or service blockage', color: 'selected-urgent' },
];

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    getMySupportTickets().then(setTickets).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError('Please fill in both a subject and a description of the issue.');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    if (category === 'Other' && !finalCategory) {
      setError('Please specify the custom category.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await raiseSupportTicket({
        subject: subject.trim(),
        description: description.trim(),
        category: finalCategory || undefined,
        priority: priority
      });
      setSubject('');
      setCustomCategory('');
      setCategory('Billing');
      setPriority('MEDIUM');
      setDescription('');
      setMessage('Your issue has been submitted. The super admin will review it and get back to you.');
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Unable to submit your issue right now.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">Support Portal</h2>
        <p className="page-subtitle">Facing an issue or need assistance? Open a support ticket and track its status.</p>
      </div>

      <div className="support-split-layout">
        {/* Left Side: Raise a Ticket Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 className="panel-title" style={{ marginBottom: 20 }}>
              <LifeBuoy size={18} /> Raise a Ticket
            </h3>
            <div className="modal-body-stack">
              <div>
                <label className="form-label">Subject</label>
                <input
                  className="input-field"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What is the issue about? (e.g., Faucet reading mismatch)"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="form-label">Category</label>
                <div className="category-chips-wrap">
                  {CATEGORIES.map(cat => (
                    <div
                      key={cat}
                      className={`category-chip ${category === cat ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
                {category === 'Other' && (
                  <input
                    className="input-field"
                    style={{ marginTop: 10 }}
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    maxLength={50}
                  />
                )}
              </div>

              <div>
                <label className="form-label">Priority Level</label>
                <div className="priority-chips-grid">
                  {PRIORITIES.map(pr => {
                    const isSelected = priority === pr.value;
                    return (
                      <div
                        key={pr.value}
                        className={`priority-chip ${isSelected ? pr.color : ''}`}
                        onClick={() => setPriority(pr.value)}
                      >
                        <span className="priority-chip-title">{pr.label}</span>
                        <span className="priority-chip-desc">{pr.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Description of Issue</label>
                <textarea
                  className="input-field textarea-field"
                  rows={5}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide step-by-step details of the issue so we can investigate it efficiently."
                  maxLength={2000}
                />
              </div>

              {message && (
                <div className="alert-box alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} /> <span>{message}</span>
                </div>
              )}
              {error && (
                <div className="alert-box alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} /> <span>{error}</span>
                </div>
              )}

              <div style={{ marginTop: 8 }}>
                <button
                  className="btn-primary"
                  onClick={submit}
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10 }}
                >
                  <Send size={15} /> {submitting ? 'Submitting…' : 'Submit Support Ticket'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Help Information */}
          <div className="support-info-card">
            <HelpCircle size={20} />
            <div>
              <p style={{ fontWeight: 700, margin: '0 0 4px 0' }}>Need Urgent Utility Assistance?</p>
              <p style={{ margin: 0, opacity: 0.9 }}>
                If you are experiencing active flooding or structural water leakages in your apartment, please bypass this support portal and contact the **Emergency Facility Hotline** directly at +1 (800) 555-0199.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: My Tickets List & Ticket Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Support Ticket Metrics */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 className="panel-title" style={{ marginBottom: 16 }}>
              Ticket Activity Summary
            </h3>
            <div className="support-stats-grid">
              <div className="support-stat-box">
                <div className="support-stat-count" style={{ color: 'var(--slate-700)' }}>{totalTickets}</div>
                <div className="support-stat-label">Total Raised</div>
              </div>
              <div className="support-stat-box" style={{ borderColor: 'var(--amber-200)', background: 'var(--amber-50)/10' }}>
                <div className="support-stat-count" style={{ color: 'var(--amber-600)' }}>{openTickets}</div>
                <div className="support-stat-label">Active</div>
              </div>
              <div className="support-stat-box" style={{ borderColor: 'var(--green-200)', background: 'var(--green-50)/10' }}>
                <div className="support-stat-count" style={{ color: 'var(--green-600)' }}>{resolvedTickets}</div>
                <div className="support-stat-label">Resolved</div>
              </div>
            </div>
          </div>

          {/* Tickets History List */}
          <div className="card">
            <h3 className="panel-title" style={{ marginBottom: 20 }}>
              <MessageSquare size={18} /> Support History
            </h3>
            {!tickets.length ? (
              <div className="empty-state empty-state-compact" style={{ padding: '36px 12px' }}>
                <div className="empty-icon"><MessageSquare size={24} /></div>
                <p className="empty-title">No support tickets</p>
                <p className="empty-desc">Your submitted tickets and technician updates will be shown here.</p>
              </div>
            ) : (
              <div className="ticket-list" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: 4 }}>
                {tickets.map((t: any) => (
                  <div key={t.id} className="ticket-card">
                    <div className="ticket-card-header" style={{ marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p className="ticket-subject" style={{ fontSize: '14px' }}>{t.subject}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {t.category && (
                            <span style={{ fontSize: '10px', background: 'var(--slate-100)', color: 'var(--slate-500)', padding: '2px 8px', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                              {t.category}
                            </span>
                          )}
                          <span className={`ticket-priority ${priorityClass[t.priority] || 'ticket-priority-medium'}`}>
                            {t.priority || 'MEDIUM'}
                          </span>
                        </div>
                      </div>
                      
                      <span className={`ticket-status ${statusClass[t.status] || 'ticket-status-closed'}`}>
                        {t.status === 'RESOLVED' || t.status === 'CLOSED'
                          ? <CheckCircle2 size={12} />
                          : <Clock size={12} />}
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="ticket-body" style={{ fontSize: '13px', marginTop: 8 }}>{t.description}</p>
                    
                    {t.response && (
                      <div className="ticket-reply" style={{ marginTop: 12, padding: 12 }}>
                        <p className="ticket-reply-label" style={{ fontSize: '10px' }}>Super Admin reply</p>
                        <p className="ticket-reply-text" style={{ fontSize: '13px' }}>{t.response}</p>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--slate-100)' }}>
                      <span className="ticket-time" style={{ margin: 0, fontSize: '10px' }}>
                        ID: #{t.id} · Raised {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
