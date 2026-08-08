import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle as AlertCircle, CheckCircle as CheckCircle, Droplet, IndianRupee, Plus, ShoppingCart, X } from 'lucide-react';
import api from '../../api/axios';
import { getCommunityAdmins } from '../../api/auth';
import { adminCode } from '../../utils/publicCodes';

type Admin = { id: number; name: string; email: string; adminCode?: string; userCode?: string };
type Purchase = {
  id: number;
  purchaseCode?: string;
  communityAdminCode?: string;
  communityAdminName?: string;
  apartmentName?: string;
  cycleMonth: string;
  totalLiters: number;
  totalCost: number;
  vendorName?: string;
  purchaseDate: string;
  eligibleResidentCount?: number;
  costPerResident?: number;
};

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

const BulkPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    cycleMonth: new Date().toISOString().slice(0, 7),
    purchaseDate: new Date().toISOString().slice(0, 10),
    totalLiters: '',
    totalCost: '',
    vendorName: '',
  });

  let user: any = null;
  try { user = JSON.parse(localStorage.getItem('wm_user') || 'null'); } catch { /* no-op */ }
  const main = user?.role === 'MAIN_ADMIN';

  const load = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        api.get('/api/purchases').then(r => r.data),
        main ? getCommunityAdmins() : Promise.resolve([]),
      ]);
      setPurchases(p);
      setAdmins(a);
    } catch {
      setNotice({ type: 'error', text: 'Unable to load purchases.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(
    () => purchases.reduce(
      (s, p) => ({ cost: s.cost + Number(p.totalCost), liters: s.liters + Number(p.totalLiters) }),
      { cost: 0, liters: 0 }
    ),
    [purchases]
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = main ? Number(adminId) : Number(user?.id);
    if (!selected) { setNotice({ type: 'error', text: 'Select a Community Admin.' }); return; }
    try {
      await api.post('/api/purchases', {
        ...form,
        totalLiters: Number(form.totalLiters),
        totalCost: Number(form.totalCost),
        vendorName: form.vendorName || null,
        communityAdminId: selected,
      });
      setOpen(false);
      setNotice({ type: 'success', text: 'Purchase saved and allocated equally to this community\'s active residents.' });
      load();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Could not save purchase.' });
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;

  return (
    <div className="page-stack">
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Bulk Water Purchases</h2>
          <p className="page-subtitle">Community-scoped purchases with fair resident allocation.</p>
        </div>
        <button className="btn-primary" onClick={() => { setAdminId(main ? '' : String(user?.id || '')); setOpen(true); }}>
          <Plus size={16} /> Record Purchase
        </button>
      </div>

      {notice.text && (
        <div className={`alert-box ${notice.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {notice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary-50"><ShoppingCart size={20} className="text-primary-600" /></div>
          <div>
            <p className="stat-label">Purchases</p>
            <p className="stat-value">{purchases.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-teal-50"><Droplet size={20} className="text-teal-600" /></div>
          <div>
            <p className="stat-label">Water Bought</p>
            <p className="stat-value">{totals.liters.toLocaleString()} L</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-50"><IndianRupee size={20} className="text-amber-600" /></div>
          <div>
            <p className="stat-label">Total Cost</p>
            <p className="stat-value">{money(totals.cost)}</p>
          </div>
        </div>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center">
            <ShoppingCart size={16} className="text-slate-400" />
            Purchase History
          </h3>
          <span className="table-count-label">{purchases.length} record{purchases.length !== 1 ? 's' : ''}</span>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><ShoppingCart size={28} /></div>
            <p className="empty-title">No purchases recorded</p>
            <p className="empty-desc">Record a bulk water purchase to allocate costs across residents.</p>
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>
              <Plus size={16} /> Record First Purchase
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Purchase</th>
                  {main && <th>Community</th>}
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Volume</th>
                  <th>Cost</th>
                  {main && <th>Allocation</th>}
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-info">{p.purchaseCode || `PUR${String(p.id).padStart(3, '0')}`}</span></td>
                    {main && (
                      <td>
                        <div className="text-semibold">{p.communityAdminCode || 'ADM—'}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{p.communityAdminName || p.apartmentName}</div>
                      </td>
                    )}
                    <td className="text-muted">{p.purchaseDate}</td>
                    <td>{p.vendorName || '—'}</td>
                    <td className="text-semibold">{Number(p.totalLiters).toLocaleString()} L</td>
                    <td className="text-semibold">{money(Number(p.totalCost))}</td>
                    {main && (
                      <td>
                        {p.eligibleResidentCount ? (
                          <>
                            <span className="text-semibold">{p.eligibleResidentCount} residents</span>
                            <div className="text-muted" style={{ fontSize: 12 }}>{money(Number(p.costPerResident))} each</div>
                          </>
                        ) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Record Bulk Purchase</h3>
                <p className="page-subtitle">Enter the delivery details, then AquaLedger allocates the cost fairly.</p>
              </div>
              <button className="modal-close" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={save} className="modal-body-stack">
              {main && (
                <div className="info-callout">
                  <ShoppingCart size={15} />
                  <div>
                    <label className="form-label">Community</label>
                    <select className="input-field input-select" value={adminId} required onChange={e => setAdminId(e.target.value)}>
                      <option value="">Select Community Admin</option>
                      {admins.map(a => (
                        <option key={a.id} value={a.id}>{adminCode(a)} — {a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Billing Cycle</label>
                  <input type="month" required className="input-field" value={form.cycleMonth} onChange={e => setForm({ ...form, cycleMonth: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Purchase Date</label>
                  <input type="date" required className="input-field" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Volume (L)</label>
                  <input type="number" min="1" required className="input-field" value={form.totalLiters} onChange={e => setForm({ ...form, totalLiters: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Total Cost (₹)</label>
                  <input type="number" min="0.01" step="0.01" required className="input-field" value={form.totalCost} onChange={e => setForm({ ...form, totalCost: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="form-label">Vendor <span className="form-section-title-muted">(optional)</span></label>
                <input className="input-field" value={form.vendorName} onChange={e => setForm({ ...form, vendorName: e.target.value })} placeholder="Vendor name" />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Record &amp; Allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkPurchasesPage;
