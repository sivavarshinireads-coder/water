import React, { useEffect, useState } from 'react';
import { Building2, Plus, CreditCard as Edit2, Trash2, Search, X, AlertCircle as AlertCircle, CheckCircle as CheckCircle, Users, MapPin, User as User2, DollarSign, RefreshCw } from 'lucide-react';
import {
  getApartments, createApartment, updateApartment, deleteApartment, getCommunityAdmins
} from '../../api/auth';

interface AdminOption {
  id: number;
  name: string;
  email: string;
}

interface Apartment {
  id: number;
  name: string;
  address?: string;
  adminId?: number;
  adminName?: string;
  adminEmail?: string;
  baseRate?: number | null;
  higherRate?: number | null;
  householdCount?: number;
}

const ApartmentsPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formAdminId, setFormAdminId] = useState<string>('');
  const [formBaseRate, setFormBaseRate] = useState('');
  const [formHigherRate, setFormHigherRate] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [apts, adminsData] = await Promise.all([getApartments(), getCommunityAdmins()]);
      setApartments(apts);
      setAdmins(adminsData);
    } catch {
      setError('Failed to load apartments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const filtered = apartments.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.address || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.adminName || '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setFormName(''); setFormAddress(''); setFormAdminId('');
    setFormBaseRate(''); setFormHigherRate('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (a: Apartment) => {
    setEditingId(a.id);
    setFormName(a.name);
    setFormAddress(a.address || '');
    setFormAdminId(a.adminId ? String(a.adminId) : '');
    setFormBaseRate(a.baseRate != null ? String(a.baseRate) : '');
    setFormHigherRate(a.higherRate != null ? String(a.higherRate) : '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { setFormError('Apartment name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: formName.trim(),
        address: formAddress.trim() || undefined,
        adminId: formAdminId ? Number(formAdminId) : undefined,
        baseRate: formBaseRate !== '' ? Number(formBaseRate) : null,
        higherRate: formHigherRate !== '' ? Number(formHigherRate) : null,
      };
      if (editingId !== null) {
        await updateApartment(editingId, payload);
        flash('Apartment updated successfully.');
      } else {
        await createApartment({ name: payload.name, address: payload.address, adminId: payload.adminId });
        flash('Apartment created successfully.');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to save apartment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: Apartment) => {
    if (!window.confirm(`Delete apartment "${a.name}"? This cannot be undone.`)) return;
    try {
      await deleteApartment(a.id);
      load();
      flash('Apartment deleted successfully.');
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to delete apartment.');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error) return <div className="error-center">{error}</div>;

  return (
    <div className="page-stack">
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Apartments</h2>
          <p className="page-subtitle">Create, manage, and assign community admins to apartment blocks</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary btn-sm" onClick={load} title="Refresh">
            <RefreshCw size={15} />
          </button>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Apartment
          </button>
        </div>
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

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary-50"><Building2 size={20} className="text-primary-600" /></div>
          <div>
            <p className="stat-label">Total Apartments</p>
            <p className="stat-value">{apartments.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-teal-50"><User2 size={20} className="text-teal-600" /></div>
          <div>
            <p className="stat-label">Assigned Admins</p>
            <p className="stat-value">{apartments.filter(a => a.adminId).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-50"><AlertCircle size={20} className="text-amber-600" /></div>
          <div>
            <p className="stat-label">Unassigned</p>
            <p className="stat-value">{apartments.filter(a => !a.adminId).length}</p>
          </div>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Search by name, address or admin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field"
            />
            <span className="search-input-icon"><Search size={16} /></span>
          </div>
          <span className="table-count-label">
            {filtered.length} apartment{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Building2 size={30} /></div>
            <h3 className="empty-title">No apartments yet</h3>
            <p className="empty-desc">Click "New Apartment" to create your first apartment block.</p>
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={openCreate}>
              <Plus size={16} /> Create Apartment
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Apartment</th>
                  <th>Address</th>
                  <th>Assigned Admin</th>
                  <th>Custom Rates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar"><Building2 size={14} /></div>
                        <span className="table-user-name">{a.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">
                      {a.address ? (
                        <span className="badge-inline"><MapPin size={12} /> {a.address}</span>
                      ) : '—'}
                    </td>
                    <td>
                      {a.adminName ? (
                        <div>
                          <div className="text-semibold">{a.adminName}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{a.adminEmail}</div>
                        </div>
                      ) : (
                        <span className="badge badge-inactive">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {(a.baseRate != null || a.higherRate != null) ? (
                        <div style={{ fontSize: 12 }}>
                          {a.baseRate != null && (
                            <div className="text-muted">Base: <strong className="text-semibold">₹{a.baseRate}/kL</strong></div>
                          )}
                          {a.higherRate != null && (
                            <div className="text-muted">Excess: <strong className="text-semibold">₹{a.higherRate}/kL</strong></div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>Using community default</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn view" title="Edit" onClick={() => openEdit(a)}><Edit2 size={14} /></button>
                        <button className="action-btn remove" title="Delete" onClick={() => handleDelete(a)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card modal-scroll" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{editingId !== null ? 'Edit Apartment' : 'New Apartment'}</h3>
                <p className="page-subtitle">
                  {editingId !== null ? 'Update apartment details, admin assignment, and billing rates.' : 'Fill in the details to create a new apartment block.'}
                </p>
              </div>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            <div className="modal-body-stack">
              <p className="form-section-title">Basic Info</p>

              <div>
                <label className="form-label">Apartment Name <span className="field-required">*</span></label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Sunrise Residency"
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Address</label>
                <div className="input-wrap">
                  <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    type="text"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="e.g. 45 Park Avenue, Mumbai"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div className="form-divider">
                <p className="form-section-title">
                  Assign Community Admin <span className="form-section-title-muted">(optional)</span>
                </p>
                <div style={{ marginTop: 14 }}>
                  <label className="form-label">Community Admin</label>
                  <div className="input-wrap">
                    <Users size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <select
                      value={formAdminId}
                      onChange={e => setFormAdminId(e.target.value)}
                      className="input-field input-select"
                      style={{ paddingLeft: 36 }}
                    >
                      <option value="">— No Admin Assigned —</option>
                      {admins.map(ad => (
                        <option key={ad.id} value={String(ad.id)}>
                          {ad.name} ({ad.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-divider">
                <p className="form-section-title">
                  Custom Billing Rates <span className="form-section-title-muted">(optional)</span>
                </p>
                <p className="form-hint" style={{ marginBottom: 14 }}>
                  Leave blank to use the community admin's active tariff plan. Base rate applies for first 10 kL; excess rate beyond that.
                </p>
                <div className="form-grid-2">
                  <div>
                    <label className="form-label">Base Rate (₹/kL)</label>
                    <div className="input-wrap">
                      <DollarSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formBaseRate}
                        onChange={e => setFormBaseRate(e.target.value)}
                        placeholder="e.g. 15.00"
                        className="input-field"
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Excess Rate (₹/kL)</label>
                    <div className="input-wrap">
                      <DollarSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formHigherRate}
                        onChange={e => setFormHigherRate(e.target.value)}
                        placeholder="e.g. 25.00"
                        className="input-field"
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="alert-box alert-error">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="modal-footer-actions">
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
                  {saving
                    ? (<><span className="spinner-sm" /> Saving...</>)
                    : editingId !== null
                      ? (<><Edit2 size={15} /> Save Changes</>)
                      : (<><Plus size={15} /> Create Apartment</>)
                  }
                </button>
                <button onClick={() => setModalOpen(false)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentsPage;
