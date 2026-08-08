import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Circle as XCircle, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/auth';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const me = await getMe();
      updateUser({
        approvalStatus: me.approvalStatus,
        profileCompleted: me.profileCompleted,
        name: me.name,
        phone: me.phone,
      });
      if (me.approvalStatus === 'APPROVED') {
        navigate('/dashboard/admin');
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRejected = user?.approvalStatus === 'REJECTED';

  return (
    <div className="status-page">
      <div className="status-card">
        <div className={`status-icon-wrap ${isRejected ? 'rejected' : 'pending'}`}>
          {isRejected ? <XCircle size={40} /> : <Clock size={40} />}
        </div>

        <h1 className="status-title">
          {isRejected ? 'Registration Rejected' : 'Pending Verification'}
        </h1>

        <p className="status-desc">
          {isRejected
            ? `Your registration has been rejected. Reason: ${user?.rejectionReason || 'Not specified'}. Please contact support or register again with valid documents.`
            : 'Your account is currently under review by the Main Admin. You will be able to access the dashboard once your registration is approved. This usually takes 1-2 business days.'}
        </p>

        <div className="status-actions">
          {isRejected ? (
            <>
              <button onClick={() => navigate('/signup')} className="btn-primary">
                Register Again
              </button>
              <button onClick={handleLogout} className="btn-secondary">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCheckStatus} disabled={checking} className="btn-primary">
                {checking
                  ? <><span className="spinner-sm" /> Checking...</>
                  : <><RefreshCw size={16} /> Check Status</>}
              </button>
              <button onClick={handleLogout} className="btn-secondary">
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>

        <div className="status-details-card">
          <h3 className="status-details-title">
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
            Account Details
          </h3>
          <div className="status-details-grid">
            <div>
              <span className="status-detail-label">Name</span>
              <span className="status-detail-value">{user?.name}</span>
            </div>
            <div>
              <span className="status-detail-label">Email</span>
              <span className="status-detail-value">{user?.email}</span>
            </div>
            <div>
              <span className="status-detail-label">Role</span>
              <span className="status-detail-value">Community Admin</span>
            </div>
            <div>
              <span className="status-detail-label">Status</span>
              <span className="status-detail-value" style={{ color: isRejected ? 'var(--red-600)' : 'var(--amber-600)' }}>
                {isRejected ? 'Rejected' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
