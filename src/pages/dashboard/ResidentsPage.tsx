import React, { useEffect, useState } from 'react';
import { Search, UserPlus, Eye, Ban, Trash2, CheckCircle as CheckCircle, X, AlertCircle as AlertCircle, Mail, Send, Phone, User as User2, Calendar, AtSign, ShieldCheck, Clock } from 'lucide-react';
import { getResidents, updateUser, deleteUser, inviteResident } from '../../api/auth';
import { residentCode } from '../../utils/publicCodes';

interface Resident {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
  invitedAt?: string;
  createdAt?: string;
  // Extended profile fields
  phone?: string;
  gender?: string;
  age?: number;
  alternativeEmail?: string;
  profileCompleted?: boolean;
  residentCode?: string;
}

const ResidentsPage: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // View profile modal
  const [viewing, setViewing] = useState<Resident | null>(null);

  // Edit modal
  const [editing, setEditing] = useState<Resident | null>(null);
  const [editName, setEditName] = useState('');
  const [editEnabled, setEditEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const load = () => {
    setLoading(true);
    getResidents()
      .then(setResidents)
      .catch(() => setError('Failed to load residents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (r: Resident) => {
    try {
      await updateUser(r.id, { name: r.name, enabled: !r.enabled });
      load();
      flash(`${r.name} ${!r.enabled ? 'enabled' : 'disabled'} successfully.`);
    } catch {
      setActionError('Failed to update resident.');
    }
  };

  const handleDelete = async (r: Resident) => {
    if (!window.confirm(`Delete ${r.name}? This cannot be undone.`)) return;
    try {
      await deleteUser(r.id);
      load();
      flash('Resident deleted successfully.');
    } catch {
      setActionError('Failed to delete resident.');
    }
  };

  const openEdit = (r: Resident) => {
    setViewing(null);
    setEditing(r);
    setEditName(r.name);
    setEditEnabled(r.enabled);
    setActionError('');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateUser(editing.id, { name: editName, enabled: editEnabled });
      setEditing(null);
      load();
      flash('Resident updated successfully.');
    } catch {
      setActionError('Failed to update resident.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Name and email are required.');
      return;
    }
    setInviting(true);
    setInviteError('');
    try {
      await inviteResident({ name: inviteName, email: inviteEmail });
      setShowInvite(false);
      setInviteName('');
      setInviteEmail('');
      load();
      flash(`Invite sent to ${inviteEmail}. They will receive login credentials by email.`);
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Residents</h2>
          <p className="page-subtitle">Manage residents you are responsible for — invite new ones or update existing accounts</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowInvite(true); setInviteError(''); }}>
          <Mail size={16} /> Invite Resident
        </button>
      </div>

      {successMsg && (
        <div className="alert-box alert-info">
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}
      {actionError && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}

      <div className="data-table-wrap">
        <div className="data-table-header">
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
            />
            <span className="search-input-icon"><Search size={16} /></span>
          </div>
          <span className="table-count-label">{filtered.length} resident{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><UserPlus size={28} /></div>
            <h3 className="empty-title">No residents yet</h3>
            <p className="empty-desc">Use "Invite Resident" to send login credentials to your residents by email.</p>
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setShowInvite(true)}>
              <Mail size={16} /> Invite First Resident
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resident Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Profile</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge badge-info">{residentCode(r)}</span></td>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{r.name.charAt(0).toUpperCase()}</div>
                        <span className="table-user-name">{r.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{r.email}</td>
                    <td>
                      <span className={`badge ${r.enabled ? 'badge-active' : 'badge-inactive'}`}>
                        {r.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      {r.profileCompleted ? (
                        <span className="badge badge-info badge-inline">
                          <ShieldCheck size={11} /> Complete
                        </span>
                      ) : (
                        <span className="badge badge-inactive badge-inline">
                          <Clock size={11} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {r.invitedAt
                        ? new Date(r.invitedAt).toLocaleDateString()
                        : r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn view" title="View Profile" onClick={() => setViewing(r)}><Eye size={14} /></button>
                        <button className="action-btn disable" title={r.enabled ? 'Disable' : 'Enable'} onClick={() => handleToggle(r)}>
                          {r.enabled ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button className="action-btn remove" title="Delete" onClick={() => handleDelete(r)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== View Profile Modal ===== */}
      {viewing && (
        <div className="modal-backdrop" onClick={() => setViewing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="profile-modal-header">
                <div className="profile-avatar-lg">{viewing.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="flex-row-center">
                    <h3 className="profile-modal-name">{viewing.name}</h3>
                    {viewing.profileCompleted && (
                      <span className="badge badge-active badge-inline"><ShieldCheck size={10} /> Verified</span>
                    )}
                  </div>
                  <p className="profile-modal-status">
                    {viewing.enabled ? 'Active Account' : 'Disabled Account'}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewing(null)}><X size={18} /></button>
            </div>

            <div className="modal-body-stack">
              <ProfileRow icon={<AtSign size={15} />} label="Email" value={viewing.email} />

              {viewing.profileCompleted ? (
                <>
                  {viewing.phone && <ProfileRow icon={<Phone size={15} />} label="Phone" value={viewing.phone} />}
                  {viewing.gender && <ProfileRow icon={<User2 size={15} />} label="Gender" value={viewing.gender} />}
                  {viewing.age != null && <ProfileRow icon={<Calendar size={15} />} label="Age" value={`${viewing.age} years`} />}
                  {viewing.alternativeEmail && <ProfileRow icon={<Mail size={15} />} label="Alt. Email" value={viewing.alternativeEmail} />}
                </>
              ) : (
                <div className="info-callout-warning">
                  <Clock size={14} />
                  <span>Profile not yet completed. Additional details will appear once the resident fills in their profile.</span>
                </div>
              )}

              <p className="text-muted" style={{ fontSize: 12 }}>
                {viewing.invitedAt ? `Invited on ${new Date(viewing.invitedAt).toLocaleDateString()}` : viewing.createdAt ? `Joined ${new Date(viewing.createdAt).toLocaleDateString()}` : ''}
              </p>
            </div>

            <div className="modal-footer-actions">
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => openEdit(viewing)}>
                Edit Resident
              </button>
              <button onClick={() => setViewing(null)} className="btn-secondary btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="modal-backdrop" onClick={() => setShowInvite(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Invite Resident</h3>
                <p className="page-subtitle">We'll create their account and email login credentials.</p>
              </div>
              <button className="modal-close" onClick={() => setShowInvite(false)}><X size={18} /></button>
            </div>

            <div className="modal-body-stack">
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Ravi Kumar" className="input-field" />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="e.g. ravi@example.com" className="input-field" />
              </div>

              {inviteError && (
                <div className="alert-box alert-error">
                  <AlertCircle size={15} />
                  <span>{inviteError}</span>
                </div>
              )}

              <div className="info-callout">
                <Mail size={15} />
                <span>A temporary password will be generated and emailed to the resident. They can log in immediately and change their password.</span>
              </div>

              <div className="modal-footer-actions">
                <button onClick={handleInvite} disabled={inviting} className="btn-primary" style={{ flex: 1 }}>
                  {inviting ? (<><span className="spinner-sm" /> Sending Invite...</>) : (<><Send size={15} /> Send Invite</>)}
                </button>
                <button onClick={() => setShowInvite(false)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Resident</h3>
              <button className="modal-close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="modal-body-stack">
              <div>
                <label className="form-label">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="text" value={editing.email} disabled className="input-field input-disabled" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select value={editEnabled ? 'true' : 'false'} onChange={e => setEditEnabled(e.target.value === 'true')} className="input-field input-select">
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              {actionError && (
                <div className="alert-box alert-error"><AlertCircle size={15} /><span>{actionError}</span></div>
              )}
              <div className="modal-footer-actions">
                <button onClick={handleSaveEdit} disabled={saving} className="btn-primary">
                  {saving ? (<><span className="spinner-sm" /> Saving...</>) : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(null)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for profile row
const ProfileRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="profile-row">
    <span className="profile-row-icon">{icon}</span>
    <span className="profile-row-label">{label}</span>
    <span className="profile-row-value">{value}</span>
  </div>
);

export default ResidentsPage;
