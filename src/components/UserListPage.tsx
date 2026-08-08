import React, { useEffect, useState } from 'react';
import { Eye, Ban, Trash2, UserPlus, Search, CheckCircle as CheckCircle, X, AlertCircle as AlertCircle, Lock, Phone } from 'lucide-react';
import { updateUser, deleteUser, createUser } from '../api/auth';
import { adminCode, residentCode } from '../utils/publicCodes';

interface UserItem {
  id: number;
  userCode?: string;
  adminCode?: string;
  residentCode?: string;
  name: string;
  email: string;
  role?: string;
  enabled: boolean;
  createdAt?: string;
}

interface Props {
  title: string;
  subtitle: string;
  fetchFn: () => Promise<UserItem[]>;
  showRole?: boolean;
  addLabel?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  /** If provided, clicking "Add" opens the built-in create-admin modal */
  showAddAdmin?: boolean;
}

const UserListPage: React.FC<Props> = ({
  title, subtitle, fetchFn, showRole, addLabel,
  canEdit = true, canDelete = true, showAddAdmin = false
}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEnabled, setEditEnabled] = useState(true);
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Add Admin modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newApartmentName, setNewApartmentName] = useState('');
  const [newApartmentAddress, setNewApartmentAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const load = () => {
    setLoading(true);
    fetchFn()
      .then(setUsers)
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fetchFn]);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (u: UserItem) => {
    setEditing(u);
    setEditName(u.name);
    setEditEnabled(u.enabled);
    setActionError('');
    setSuccessMsg('');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setActionError('');
    try {
      await updateUser(editing.id, { name: editName, enabled: editEnabled });
      flash('User updated successfully.');
      setEditing(null);
      load();
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u: UserItem) => {
    try {
      await updateUser(u.id, { name: u.name, enabled: !u.enabled });
      load();
      flash(`User ${!u.enabled ? 'enabled' : 'disabled'} successfully.`);
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to update user.');
    }
  };

  const handleDelete = async (u: UserItem) => {
    if (!window.confirm(`Are you sure you want to delete ${u.name}? This action cannot be undone.`)) return;
    try {
      await deleteUser(u.id);
      load();
      flash('User deleted successfully.');
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const resetAddForm = () => {
    setNewName(''); setNewEmail(''); setNewPassword('');
    setNewPhone(''); setNewApartmentName(''); setNewApartmentAddress('');
    setCreateError('');
  };

  const handleCreateAdmin = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError('Name, email, and password are required.');
      return;
    }
    if (newPassword.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      await createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        phone: newPhone.trim() || undefined,
        role: 'COMMUNITY_ADMIN',
        apartmentName: newApartmentName.trim() || undefined,
        apartmentAddress: newApartmentAddress.trim() || undefined,
      });
      setShowAddModal(false);
      resetAddForm();
      load();
      flash('Community admin created successfully.');
    } catch (err: any) {
      setCreateError(err.response?.data?.error || err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        {addLabel && (
          <button
            className="btn-primary"
            onClick={() => showAddAdmin ? (resetAddForm(), setShowAddModal(true)) : undefined}
          >
            <UserPlus size={16} /> {addLabel}
          </button>
        )}
      </div>

      {actionError && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}
      {successMsg && (
        <div className="alert-box alert-info">
          <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{successMsg}</span>
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
          <span className="table-count-label">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-desc">No users found.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  {showRole && <th>Role</th>}
                  <th>Status</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const code = u.role === 'RESIDENT' ? residentCode(u) : adminCode(u);
                  return (
                    <tr key={u.id}>
                      <td><span className="badge badge-info">{code}</span></td>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">{u.name.charAt(0).toUpperCase()}</div>
                          <span className="table-user-name">{u.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                    {showRole && (
                      <td>
                        <span className={`badge ${u.role === 'RESIDENT' ? 'badge-active' : 'badge-info'}`}>
                          {u.role === 'RESIDENT' ? 'Resident' : u.role === 'COMMUNITY_ADMIN' ? 'Community Admin' : u.role}
                        </span>
                      </td>
                    )}
                    <td>
                      <span className={`badge ${u.enabled ? 'badge-active' : 'badge-inactive'}`}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          <button className="action-btn view" title="Edit" onClick={() => handleEdit(u)}><Eye size={14} /></button>
                          <button className="action-btn disable" title={u.enabled ? 'Disable' : 'Enable'} onClick={() => handleToggle(u)}>
                            {u.enabled ? <Ban size={14} /> : <CheckCircle size={14} />}
                          </button>
                          {canDelete && (
                            <button className="action-btn remove" title="Delete" onClick={() => handleDelete(u)}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Edit Modal ===== */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
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
                <div className="alert-box alert-error"><AlertCircle size={16} /><span>{actionError}</span></div>
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

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card modal-scroll" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Add Community Admin</h3>
                <p className="page-subtitle">Create a new community admin account directly.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <div className="modal-body-stack">
              <p className="form-section-title">Account Details</p>
              <div>
                <label className="form-label">Full Name <span className="field-required">*</span></label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Suresh Patel" className="input-field" />
              </div>
              <div>
                <label className="form-label">Email Address <span className="field-required">*</span></label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="e.g. suresh@example.com" className="input-field" />
              </div>
              <div>
                <label className="form-label">Password <span className="field-required">*</span></label>
                <div className="input-wrap">
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Phone <span className="form-section-title-muted">(optional)</span></label>
                <div className="input-wrap">
                  <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="e.g. +91-9876543210"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div className="form-divider">
                <p className="form-section-title">
                  Apartment Info <span className="form-section-title-muted">(optional)</span>
                </p>
              </div>
              <div>
                <label className="form-label">Apartment Name</label>
                <input type="text" value={newApartmentName} onChange={e => setNewApartmentName(e.target.value)} placeholder="e.g. Sunrise Residency" className="input-field" />
              </div>
              <div>
                <label className="form-label">Apartment Address</label>
                <input type="text" value={newApartmentAddress} onChange={e => setNewApartmentAddress(e.target.value)} placeholder="e.g. 12 Main Street, City" className="input-field" />
              </div>

              {createError && (
                <div className="alert-box alert-error">
                  <AlertCircle size={15} />
                  <span>{createError}</span>
                </div>
              )}

              <div className="modal-footer-actions">
                <button onClick={handleCreateAdmin} disabled={creating} className="btn-primary" style={{ flex: 1 }}>
                  {creating ? (<><span className="spinner-sm" /> Creating...</>) : (<><UserPlus size={15} /> Create Admin</>)}
                </button>
                <button onClick={() => setShowAddModal(false)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
