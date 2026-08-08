import React, { useState, useEffect } from 'react';
import { Download, AlertCircle as AlertCircle, Plus, Lock, Archive, Trash2, CheckCircle as CheckCircle, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import {
  getBillingCycles,
  createBillingCycle,
  deleteBillingCycle,
  finalizeBillingCycle,
  archiveBillingCycle
} from '../../api/auth';

const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'cycles'>('bills');
  const [bills, setBills] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [newCycle, setNewCycle] = useState({
    name: '',
    startDate: '',
    endDate: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [billsRes, cyclesRes] = await Promise.all([
        api.get('/api/billing/household-bills'),
        getBillingCycles()
      ]);
      setBills(billsRes.data);
      setCycles(cyclesRes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load billing data.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (billId: number, month: string) => {
    try {
      const res = await api.get(`/api/billing/invoice/${billId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to download PDF invoice.');
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createBillingCycle(newCycle);
      setSuccess(`Billing cycle ${newCycle.name} created successfully.`);
      setOpenModal(false);
      setNewCycle({ name: '', startDate: '', endDate: '', dueDate: '' });
      // Refresh data
      const cyclesRes = await getBillingCycles();
      setCycles(cyclesRes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create billing cycle.');
    }
  };

  const handleFinalizeCycle = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to finalize the billing cycle for ${name}? This will calculate and lock in all bills.`)) return;
    setError('');
    setSuccess('');
    try {
      await finalizeBillingCycle(id);
      setSuccess(`Billing cycle ${name} finalized successfully.`);
      const [billsRes, cyclesRes] = await Promise.all([
        api.get('/api/billing/household-bills'),
        getBillingCycles()
      ]);
      setBills(billsRes.data);
      setCycles(cyclesRes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to finalize billing cycle.');
    }
  };

  const handleArchiveCycle = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to archive the billing cycle for ${name}?`)) return;
    setError('');
    setSuccess('');
    try {
      await archiveBillingCycle(id);
      setSuccess(`Billing cycle ${name} archived successfully.`);
      const cyclesRes = await getBillingCycles();
      setCycles(cyclesRes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to archive billing cycle.');
    }
  };

  const handleDeleteCycle = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the billing cycle for ${name}?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteBillingCycle(id);
      setSuccess(`Billing cycle ${name} deleted successfully.`);
      const cyclesRes = await getBillingCycles();
      setCycles(cyclesRes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete billing cycle.');
    }
  };

  // Helper to pre-populate start and end dates when a month is chosen
  const handleMonthChange = (monthStr: string) => {
    if (!monthStr) {
      setNewCycle({ ...newCycle, name: '', startDate: '', endDate: '' });
      return;
    }
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    // Default due date: e.g. 10th of next month
    let dueYear = year;
    let dueMonth = month + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }
    const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-10`;

    setNewCycle({
      ...newCycle,
      name: monthStr,
      startDate,
      endDate,
      dueDate
    });
  };

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;

  const chartData = bills.map(b => ({
    name: `Unit ${b.unitNumber}`,
    Usage: b.totalLiters,
    Amount: b.amount
  }));

  return (
    <div className="page-stack">
      <div className="page-header flex-between">
        <div>
          <h2 className="page-title">Apartment Billing & Cycles</h2>
          <p className="page-subtitle">Manage billing cycles, due dates, and household bills</p>
        </div>
        {activeTab === 'cycles' && (
          <button className="btn-primary" onClick={() => setOpenModal(true)}>
            <Plus size={16} /> New Billing Cycle
          </button>
        )}
      </div>

      <div className="tabs-underline">
        <button
          onClick={() => setActiveTab('bills')}
          className={`tab-underline ${activeTab === 'bills' ? 'active' : ''}`}
        >
          Household Bills
        </button>
        <button
          onClick={() => setActiveTab('cycles')}
          className={`tab-underline ${activeTab === 'cycles' ? 'active' : ''}`}
        >
          Billing Cycles
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-box alert-success">
          <CheckCircle size={16} /> <span>{success}</span>
        </div>
      )}

      {/* Tab 1: Household Bills */}
      {activeTab === 'bills' && (
        <>
          {/* Comparison Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Household Usage Comparison</h3>
              <span className="chart-tag">Liters</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="Usage" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bills Table */}
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Resident</th>
                  <th>Liters</th>
                  <th>Metered (₹)</th>
                  <th>Shared (₹)</th>
                  <th>Total (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.householdId}>
                    <td>{b.unitNumber}</td>
                    <td>{b.residentName}</td>
                    <td>{b.totalLiters} L</td>
                    <td>₹{Number(b.meteredAmount || b.amount).toFixed(2)}</td>
                    <td>₹{Number(b.sharedAreaCost || 0).toFixed(2)}</td>
                    <td className="text-semibold">₹{Number(b.amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${b.status === 'PAID' ? 'badge-active' : 'badge-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.billId ? (
                        <button className="btn-secondary btn-xs" onClick={() => downloadPdf(b.billId, b.month)}>
                          <Download size={14} /> PDF
                        </button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>Unsaved</span>
                      )}
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr><td colSpan={8} className="table-empty-cell">No bills generated yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab 2: Billing Cycles */}
      {activeTab === 'cycles' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cycle Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.startDate}</td>
                  <td>{c.endDate}</td>
                  <td><strong>{c.dueDate || '—'}</strong></td>
                  <td>
                    <span className={`badge ${
                      c.status === 'OPEN' ? 'badge-active' :
                      c.status === 'FINALIZED' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {c.status === 'OPEN' && (
                        <>
                          <button
                            className="btn-primary btn-xs"
                            onClick={() => handleFinalizeCycle(c.id, c.name)}
                          >
                            <Lock size={12} /> Finalize
                          </button>
                          <button
                            className="btn-danger btn-xs"
                            onClick={() => handleDeleteCycle(c.id, c.name)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </>
                      )}
                      {c.status === 'FINALIZED' && (
                        <button
                          className="btn-secondary btn-xs"
                          onClick={() => handleArchiveCycle(c.id, c.name)}
                        >
                          <Archive size={12} /> Archive
                        </button>
                      )}
                      {c.status === 'ARCHIVED' && (
                        <span className="text-muted" style={{ fontSize: 12 }}>None</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {cycles.length === 0 && (
                <tr><td colSpan={6} className="table-empty-cell">No billing cycles configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Cycle Modal */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Billing Cycle</h3>
              <button className="modal-close" onClick={() => setOpenModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCycle} className="modal-body-stack">
              <div>
                <label className="form-label">Cycle Month</label>
                <input
                  type="month"
                  required
                  className="form-input"
                  onChange={e => handleMonthChange(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newCycle.startDate}
                  onChange={e => setNewCycle({ ...newCycle, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newCycle.endDate}
                  onChange={e => setNewCycle({ ...newCycle, endDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Payment Due Date</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newCycle.dueDate}
                  onChange={e => setNewCycle({ ...newCycle, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-footer-actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setOpenModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
