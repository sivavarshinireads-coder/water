import React, { useEffect, useState } from 'react';
import {
  Receipt, Download, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, Building2, Home,
  Calendar, Droplets, Search, Filter, TrendingDown, TrendingUp
} from 'lucide-react';
import { getHouseholdBills } from '../../api/auth';
import api from '../../api/axios';

interface BillRow {
  id?: number;
  month: string;
  unit?: string;
  unitNumber?: string;
  resident?: string;
  consumptionLiters?: number;
  totalLiters?: number;
  amount: number;
  baseAmount?: number;
  sharedAreaCost?: number;
  lateFee?: number;
  lateFeeApplied?: boolean;
  monthsOverdue?: number;
  highConsumption?: boolean;
  totalAmount?: number;
  dueDate?: string;
  status: string;
  slab1LimitKl?: number; slab1Rate?: number; slab1Amount?: number;
  slab2LimitKl?: number; slab2Rate?: number; slab2Amount?: number;
  slab3LimitKl?: number; slab3Rate?: number; slab3Amount?: number;
  slab4Rate?: number; slab4Amount?: number;
  surchargePercent?: number; surchargeAmount?: number;
}

const formatMonth = (month: string) => {
  if (!month) return '—';
  const m = month.length >= 7 ? month.slice(0, 7) : month;
  const [y, mo] = m.split('-');
  const idx = Number(mo);
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (idx >= 1 && idx <= 12) return `${names[idx - 1]} ${y}`;
  return month;
};

const fmt = (n: number) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const AdminInvoicesPage: React.FC = () => {
  const [bills, setBills] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getHouseholdBills()
      .then((data: any) => {
        if (Array.isArray(data)) {
          const mapped = data.map((b: any) => ({
            ...b,
            id: b.id || b.billId,
            resident: b.resident || b.residentName,
          }));
          setBills(mapped);
        }
      })
      .catch(() => setError('Failed to load household invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadInvoice = async (billId: number, month: string) => {
    setDownloadingId(billId);
    setError('');
    try {
      const res = await api.get(`/api/billing/invoice/${billId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`Invoice for ${formatMonth(month)} downloaded successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setError('Failed to download invoice.');
    } finally {
      setDownloadingId(null);
    }
  };

  const months = [...new Set(bills.map(b => b.month))].sort().reverse();

  const filtered = bills.filter(b => {
    const unit = b.unitNumber || b.unit || '';
    const resident = b.resident || '';
    const matchSearch = !searchTerm || unit.toLowerCase().includes(searchTerm.toLowerCase()) || resident.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || (b.status || '').toUpperCase() === filterStatus;
    const matchMonth = !filterMonth || b.month === filterMonth;
    return matchSearch && matchStatus && matchMonth;
  });

  const totalPaid = filtered.filter(b => (b.status || '').toUpperCase() === 'PAID').length;
  const totalUnpaid = filtered.filter(b => (b.status || '').toUpperCase() !== 'PAID').length;
  const totalRevenue = filtered.filter(b => (b.status || '').toUpperCase() === 'PAID')
    .reduce((s, b) => s + (b.totalAmount ?? (Number(b.amount || 0) + Number(b.sharedAreaCost || 0) + (b.lateFeeApplied ? Number(b.lateFee || 0) : 0))), 0);
  const totalPending = filtered.filter(b => (b.status || '').toUpperCase() !== 'PAID')
    .reduce((s, b) => s + (b.totalAmount ?? (Number(b.amount || 0) + Number(b.sharedAreaCost || 0) + (b.lateFeeApplied ? Number(b.lateFee || 0) : 0))), 0);

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;

  return (
    <div className="page-stack">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Household Invoices</h2>
          <p className="page-subtitle">View, track, and download bills for all households under your community</p>
        </div>
      </div>

      {error && <div className="alert-box alert-error"><AlertCircle size={16} /> <span>{error}</span></div>}
      {successMsg && <div className="alert-box alert-success"><CheckCircle size={16} /> <span>{successMsg}</span></div>}

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 4 }}>
        {[
          { label: 'Total Bills', value: filtered.length, icon: Receipt, color: '#0d9488', bg: '#f0fdf4' },
          { label: 'Paid', value: totalPaid, icon: CheckCircle, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Unpaid', value: totalUnpaid, icon: TrendingDown, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Pending Revenue', value: `₹${fmt(totalPending)}`, icon: TrendingUp, color: '#d97706', bg: '#fef3c7' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="input-wrap" style={{ flex: '1 1 220px', maxWidth: 300 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by unit or resident..."
            className="input-field"
            style={{ paddingLeft: 36, height: 38 }}
          />
        </div>
        <div className="input-wrap" style={{ flex: '0 0 160px' }}>
          <Filter size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field input-select" style={{ paddingLeft: 36, height: 38 }}>
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
        <div className="input-wrap" style={{ flex: '0 0 180px' }}>
          <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="input-field input-select" style={{ paddingLeft: 36, height: 38 }}>
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center"><Receipt size={16} className="text-slate-400" /> All Household Bills</h3>
          <span className="table-count-label">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Receipt size={24} /></div>
            <p className="empty-title">No invoices found</p>
            <p className="empty-desc">Try adjusting your filters, or no bills have been generated yet.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Unit</th>
                  <th>Resident</th>
                  <th>Billing Period</th>
                  <th>Consumption</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Invoice PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill, idx) => {
                  const isPaid = (bill.status || '').toUpperCase() === 'PAID';
                  const rowKey = `${bill.id ?? idx}-${bill.month}`;
                  const isExpanded = expandedRow === rowKey;
                  const totalAmt = bill.totalAmount ?? (Number(bill.amount || 0) + Number(bill.sharedAreaCost || 0) + (bill.lateFeeApplied ? Number(bill.lateFee || 0) : 0));
                  const isOverdue = bill.lateFeeApplied && !isPaid;
                  return (
                    <React.Fragment key={rowKey}>
                      <tr style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td>
                          <button className="expand-btn" onClick={() => setExpandedRow(isExpanded ? null : rowKey)}>
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Home size={13} style={{ color: '#0d9488' }} />
                            <strong style={{ fontSize: 13 }}>Unit {bill.unitNumber || bill.unit}</strong>
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: '#475569' }}>{bill.resident || '—'}</td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={12} style={{ color: '#94a3b8' }} />
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{formatMonth(bill.month)}</span>
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Droplets size={12} style={{ color: '#0d9488' }} />
                            {fmt(Number(bill.consumptionLiters ?? bill.totalLiters ?? 0))} L
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: isOverdue ? '#dc2626' : '#64748b' }}>
                            {bill.dueDate || '—'}
                            {isOverdue && <span className="badge badge-high" style={{ marginLeft: 6, fontSize: 10 }}>Overdue</span>}
                          </span>
                        </td>
                        <td><span style={{ fontWeight: 700, color: '#1e293b' }}>₹{fmt(totalAmt)}</span></td>
                        <td>
                          <span className={`badge ${isPaid ? 'badge-active' : isOverdue ? 'badge-high' : 'badge-warning'}`}>
                            {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          {bill.id ? (
                            <button
                              className="btn-secondary btn-xs"
                              disabled={downloadingId === bill.id}
                              onClick={() => downloadInvoice(bill.id!, bill.month)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                            >
                              {downloadingId === bill.id ? <span className="spinner-sm" /> : <Download size={13} />}
                              PDF
                            </button>
                          ) : '—'}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="breakdown-panel">
                            <div className="breakdown-stack">
                              <h4 className="breakdown-title">
                                Itemized Breakdown — Unit {bill.unitNumber || bill.unit} · {formatMonth(bill.month)}
                              </h4>

                              {bill.highConsumption && (
                                <div className="alert-box alert-error" style={{ fontSize: 13 }}>
                                  <AlertCircle size={14} />
                                  <span><strong>High Consumption Household</strong> — usage crossed top tariff slab, triggering a surcharge.</span>
                                </div>
                              )}

                              <div>
                                <p className="breakdown-section-label">Water Tariff Slabs</p>
                                <div className="breakdown-stack" style={{ gap: 6, marginTop: 6 }}>
                                  {[
                                    { label: `0–${bill.slab1LimitKl ?? 10} kL`, rate: bill.slab1Rate, amount: bill.slab1Amount ?? bill.baseAmount },
                                    bill.slab2Amount ? { label: `${bill.slab1LimitKl ?? 10}–${bill.slab2LimitKl ?? 20} kL`, rate: bill.slab2Rate, amount: bill.slab2Amount } : null,
                                    bill.slab3Amount ? { label: `${bill.slab2LimitKl ?? 20}–${bill.slab3LimitKl ?? 30} kL`, rate: bill.slab3Rate, amount: bill.slab3Amount } : null,
                                    bill.slab4Amount ? { label: `Above ${bill.slab3LimitKl ?? 30} kL`, rate: bill.slab4Rate, amount: bill.slab4Amount } : null,
                                  ].filter((r): r is { label: string; rate?: number; amount?: number } => !!r && Number(r.amount) > 0)
                                    .map((row, i) => (
                                      <div key={i} className="breakdown-row">
                                        <span>{row.label} {row.rate != null && <span className="text-muted">(₹{row.rate}/kL)</span>}</span>
                                        <span className="breakdown-row-amount">₹{fmt(Number(row.amount))}</span>
                                      </div>
                                    ))}
                                  {Number(bill.surchargeAmount || 0) > 0 && (
                                    <div className="breakdown-row breakdown-row-warning">
                                      <span>High Consumption Surcharge ({bill.surchargePercent ?? 20}%)</span>
                                      <span className="breakdown-row-amount">₹{fmt(Number(bill.surchargeAmount))}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {Number(bill.sharedAreaCost || 0) > 0 && (
                                <div className="breakdown-row">
                                  <span>Shared Bulk Water Purchase Allocation</span>
                                  <span className="breakdown-row-amount">₹{fmt(Number(bill.sharedAreaCost))}</span>
                                </div>
                              )}

                              {bill.lateFeeApplied && Number(bill.lateFee || 0) > 0 && (
                                <div className="breakdown-row breakdown-row-danger">
                                  <span>Late Payment Fee ({bill.monthsOverdue ?? 1} month{(bill.monthsOverdue ?? 1) > 1 ? 's' : ''} overdue)</span>
                                  <span className="breakdown-row-amount">₹{fmt(Number(bill.lateFee))}</span>
                                </div>
                              )}

                              <div style={{ borderTop: '2px solid #0d9488', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Total Due</span>
                                <span style={{ fontWeight: 800, fontSize: 16, color: '#0d9488' }}>₹{fmt(totalAmt)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revenue Summary Card */}
      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', borderRadius: 12, padding: '20px 24px', color: '#fff' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Total Collected Revenue</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>₹{fmt(totalRevenue)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>from {totalPaid} paid invoice{totalPaid !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #dc2626, #9f1239)', borderRadius: 12, padding: '20px 24px', color: '#fff' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Outstanding Revenue</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>₹{fmt(totalPending)}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>from {totalUnpaid} unpaid invoice{totalUnpaid !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesPage;
