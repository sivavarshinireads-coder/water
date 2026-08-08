import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle as CheckCircle, Circle as XCircle, AlertCircle as AlertCircle, RefreshCw, Phone, Mail, CreditCard } from 'lucide-react';
import { getPendingApprovals, approveOrRejectAdmin } from '../../api/auth';

interface PendingAdmin {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  approvalStatus: string;
  idProofType: string;
  idProofNumber: string;
  idProofImage: string;
  rejectionReason: string;
}

const PendingApprovalsPage: React.FC = () => {
  const [pending, setPending] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPendingApprovals();
      setPending(data);
    } catch {
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await approveOrRejectAdmin(id, { action: 'APPROVE' });
      setPending(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    setActionLoading(id);
    try {
      await approveOrRejectAdmin(id, { action: 'REJECT', rejectionReason: rejectReason });
      setPending(prev => prev.filter(a => a.id !== id));
      setRejecting(null);
      setRejectReason('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner-center" />
        <p className="loading-text">Loading pending verifications...</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header-row">
        <div className="page-header">
          <h2 className="page-title">Pending Verifications</h2>
          <p className="page-subtitle">Review and approve new Community Admin registrations</p>
        </div>
        <button onClick={fetchPending} className="btn-secondary">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {pending.length === 0 ? (
        <div className="panel-card">
          <div className="empty-state empty-state-compact">
            <div className="empty-icon"><UserCheck size={24} /></div>
            <p className="empty-title">All caught up!</p>
            <p className="empty-desc">No pending registrations to review.</p>
          </div>
        </div>
      ) : (
        <div className="review-list">
          {pending.map((admin) => (
            <div key={admin.id} className="review-card">
              <div className="review-card-body">
                <div className="review-card-header">
                  <div className="review-user-block">
                    <div className="review-avatar">{admin.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className="review-name">{admin.name}</h3>
                      <span className="badge badge-warning badge-inline">Pending Review</span>
                    </div>
                  </div>
                </div>

                <div className="review-meta-grid">
                  <div className="review-meta-item">
                    <Mail size={14} />
                    <span>{admin.email}</span>
                  </div>
                  <div className="review-meta-item">
                    <Phone size={14} />
                    <span>{admin.phone || 'N/A'}</span>
                  </div>
                  <div className="review-meta-item">
                    <CreditCard size={14} />
                    <span>{admin.idProofType}: {admin.idProofNumber}</span>
                  </div>
                </div>

                {admin.idProofImage && (
                  <div className="review-id-proof">
                    <div className="review-id-proof-label">ID Proof Document</div>
                    <img src={admin.idProofImage} alt="ID Proof" className="review-id-proof-img" />
                  </div>
                )}

                {rejecting === admin.id ? (
                  <div className="review-reject-form">
                    <label className="form-label">Rejection Reason</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="input-field textarea-field"
                    />
                    <div className="review-actions">
                      <button onClick={() => handleReject(admin.id)} disabled={actionLoading === admin.id} className="btn-danger">
                        {actionLoading === admin.id ? <span className="spinner-sm" /> : 'Confirm Reject'}
                      </button>
                      <button onClick={() => { setRejecting(null); setRejectReason(''); }} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="review-actions">
                    <button onClick={() => handleApprove(admin.id)} disabled={actionLoading === admin.id} className="btn-success">
                      {actionLoading === admin.id ? <span className="spinner-sm" /> : <><CheckCircle size={16} /> Approve</>}
                    </button>
                    <button onClick={() => setRejecting(admin.id)} disabled={actionLoading === admin.id} className="btn-danger">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsPage;
