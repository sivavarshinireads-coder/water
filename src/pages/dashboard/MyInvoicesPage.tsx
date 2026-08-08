import React, { useEffect, useState } from 'react';
import { Receipt, CreditCard, CheckCircle as CheckCircle, AlertCircle as AlertCircle, Download, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { getMyBills, payBill } from '../../api/auth';
import api from '../../api/axios';

interface BulkPurchaseDetail {
  id: number;
  purchaseCode?: string;
  vendorName?: string;
  totalLiters?: number;
  totalCost?: number;
  purchaseDate?: string;
}

interface Invoice {
  id?: number;
  month: string;
  consumptionLiters?: number;
  totalLiters?: number;
  amount: number;
  baseAmount?: number;
  tariffAmount?: number;
  highUsageAmount?: number;
  sharedAreaCost?: number;
  dueDate?: string;
  lateFee?: number;
  lateFeeApplied?: boolean;
  monthsOverdue?: number;
  highConsumption?: boolean;
  totalAmount?: number;
  status: string;
  bulkPurchases?: BulkPurchaseDetail[];
  slab1LimitKl?: number; slab1Rate?: number; slab1Amount?: number;
  slab2LimitKl?: number; slab2Rate?: number; slab2Amount?: number;
  slab3LimitKl?: number; slab3Rate?: number; slab3Amount?: number;
  slab4Rate?: number; slab4Amount?: number;
  surchargePercent?: number; surchargeAmount?: number;
  lateFeeFlatPerMonth?: number; lateFeePercentPerMonth?: number;
  lateFeeFlatComponent?: number; lateFeePercentComponent?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const formatMonth = (month: string) => {
  if (!month) return '—';
  const m = month.length >= 7 ? month.slice(0, 7) : month;
  const [y, mo] = m.split('-');
  const idx = Number(mo);
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  if (idx >= 1 && idx <= 12) return `${names[idx - 1]} ${y}`;
  return month;
};

const MyInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payMsg, setPayMsg] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    getMyBills()
      .then((data: any) => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load your invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const downloadInvoice = async (billId: number, month: string) => {
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
    } catch {
      setError('Failed to download invoice. Please try again.');
    }
  };

  const handlePay = async (billId: number, amount: number, month: string) => {
    setPayingId(billId);
    setPayMsg('');
    setError('');

    const markPaid = async () => {
      try {
        await payBill(billId);
        setInvoices(prev => prev.map(b => b.id === billId ? { ...b, status: 'PAID' } : b));
        setPayMsg('Payment successful! Your invoice is ready to download.');
        setTimeout(() => setPayMsg(''), 5000);
        await downloadInvoice(billId, month);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Payment confirmation failed on backend.');
      } finally {
        setPayingId(null);
      }
    };

    const simulatePay = async () => {
      const confirmed = window.confirm(
        `Confirm payment of ₹${Number(amount).toLocaleString('en-IN')} for ${formatMonth(month)}?\n\n(Test mode — no real payment is charged)`
      );
      if (confirmed) {
        await markPaid();
      } else {
        setPayingId(null);
      }
    };

    try {
      if (window.Razorpay) {
        const options = {
          key: 'rzp_test_dummy_key_123',
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'AquaTrack Billing',
          description: `Water Bill for ${formatMonth(month)}`,
          handler: async function () {
            await markPaid();
          },
          modal: {
            ondismiss: function () {
              setPayingId(null);
            },
            escape: true,
          },
          theme: { color: '#0ea5e9' },
        };
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function () {
            setError('Payment failed. Please try again.');
            setPayingId(null);
          });
          rzp.open();
        } catch {
          await simulatePay();
        }
      } else {
        await simulatePay();
      }
    } catch {
      setError('Payment initialization failed.');
      setPayingId(null);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">My Invoices</h2>
        <p className="page-subtitle">View detailed bill breakdown, bulk water purchase allocations, pay bills, and download PDFs</p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <AlertCircle size={16} /> <span>{error}</span>
        </div>
      )}
      {payMsg && (
        <div className="alert-box alert-success">
          <CheckCircle size={16} /> <span>{payMsg}</span>
        </div>
      )}

      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center">
            <Receipt size={16} className="text-slate-400" />
            All Invoices
          </h3>
          <span className="table-count-label">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
        </div>

        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Receipt size={24} /></div>
            <p className="empty-title">No invoices yet</p>
            <p className="empty-desc">Your invoices will appear here once bills are generated.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Billing Period</th>
                  <th>Consumption</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const isPaid = (inv.status || '').toUpperCase() === 'PAID';
                  const totalAmt = inv.totalAmount ?? (Number(inv.amount || 0) + Number(inv.sharedAreaCost || 0) + (inv.lateFeeApplied ? Number(inv.lateFee || 0) : 0));
                  const isExpanded = expandedRow === inv.month;
                  return (
                    <React.Fragment key={inv.month}>
                      <tr>
                        <td>
                          <div className="flex-row-center">
                            <button
                              className="expand-btn"
                              onClick={() => setExpandedRow(isExpanded ? null : inv.month)}
                              title="Click for detailed breakdown"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <span className="text-semibold">{formatMonth(inv.month)}</span>
                          </div>
                        </td>
                        <td>{Number(inv.consumptionLiters ?? inv.totalLiters ?? 0).toLocaleString('en-IN')} L</td>
                        <td>
                          {inv.dueDate ? (
                            <span className={inv.lateFeeApplied && !isPaid ? 'text-red-600' : 'text-muted'} style={{ fontSize: 13 }}>
                              {inv.dueDate}
                              {inv.lateFeeApplied && !isPaid && (
                                <span className="badge badge-high" style={{ marginLeft: 6 }}>Overdue</span>
                              )}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="text-semibold">₹{Number(totalAmt).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${isPaid ? 'badge-active' : 'badge-warning'}`}>
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {!isPaid && inv.id && (
                              <button
                                onClick={() => handlePay(inv.id!, totalAmt, inv.month)}
                                disabled={payingId === inv.id}
                                className="btn-primary btn-xs"
                              >
                                {payingId === inv.id ? <span className="spinner-sm" /> : (<><CreditCard size={13} /> Pay Now</>)}
                              </button>
                            )}
                            {inv.id && (
                              <button
                                onClick={() => downloadInvoice(inv.id!, inv.month)}
                                disabled={!isPaid}
                                className="btn-secondary btn-xs"
                                style={{ opacity: isPaid ? 1 : 0.5, cursor: isPaid ? 'pointer' : 'not-allowed' }}
                                title={isPaid ? 'Download PDF' : 'Pay first to download the invoice'}
                              >
                                <Download size={13} /> PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="breakdown-panel">
                            <div className="breakdown-stack">
                              <h4 className="breakdown-title">
                                Itemized Invoice Breakdown — {formatMonth(inv.month)}
                              </h4>

                              {inv.highConsumption && (
                                <div className="alert-box alert-error" style={{ fontSize: 13, marginBottom: 0 }}>
                                  <AlertCircle size={15} />
                                  <span><strong>High Consumption Household</strong> — usage this month crossed the community's top tariff slab, triggering a surcharge below.</span>
                                </div>
                              )}

                              <div>
                                <p className="breakdown-section-label">Water Tariff Slabs</p>
                                <div className="breakdown-stack" style={{ gap: 6, marginTop: 6 }}>
                                  {[
                                    { label: `0–${inv.slab1LimitKl ?? 10} kL`, rate: inv.slab1Rate, amount: inv.slab1Amount ?? inv.baseAmount },
                                    inv.slab2Amount ? { label: `${inv.slab1LimitKl ?? 10}–${inv.slab2LimitKl ?? 20} kL`, rate: inv.slab2Rate, amount: inv.slab2Amount } : null,
                                    inv.slab3Amount ? { label: `${inv.slab2LimitKl ?? 20}–${inv.slab3LimitKl ?? 30} kL`, rate: inv.slab3Rate, amount: inv.slab3Amount } : null,
                                    inv.slab4Amount ? { label: `Above ${inv.slab3LimitKl ?? 30} kL`, rate: inv.slab4Rate, amount: inv.slab4Amount } : null,
                                  ].filter((row): row is { label: string; rate?: number; amount?: number } => !!row && Number(row.amount) > 0).map((row, idx) => (
                                    <div key={idx} className="breakdown-row">
                                      <span>{row.label} {row.rate != null && <span className="text-muted">(₹{row.rate}/kL)</span>}</span>
                                      <span className="breakdown-row-amount">₹{Number(row.amount).toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                  {Number(inv.surchargeAmount || 0) > 0 && (
                                    <div className="breakdown-row breakdown-row-warning">
                                      <span>High Consumption Surcharge ({inv.surchargePercent ?? 20}% of bill)</span>
                                      <span className="breakdown-row-amount">₹{Number(inv.surchargeAmount).toLocaleString('en-IN')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {Number(inv.sharedAreaCost || 0) > 0 && (
                                <div className="breakdown-row">
                                  <span>Shared Bulk Water Purchase Allocation</span>
                                  <span className="breakdown-row-amount">₹{Number(inv.sharedAreaCost).toLocaleString('en-IN')}</span>
                                </div>
                              )}

                              {inv.lateFeeApplied && Number(inv.lateFee || 0) > 0 && (
                                <div>
                                  <p className="breakdown-section-label text-red-600">
                                    Late Payment Fee — {inv.monthsOverdue ?? 1} month{(inv.monthsOverdue ?? 1) > 1 ? 's' : ''} overdue
                                  </p>
                                  <div className="breakdown-stack" style={{ gap: 6, marginTop: 6 }}>
                                    {Number(inv.lateFeeFlatComponent || 0) > 0 && (
                                      <div className="breakdown-row breakdown-row-danger">
                                        <span>Flat Late Fee (₹{inv.lateFeeFlatPerMonth ?? 150} × {inv.monthsOverdue ?? 1} month{(inv.monthsOverdue ?? 1) > 1 ? 's' : ''})</span>
                                        <span className="breakdown-row-amount">₹{Number(inv.lateFeeFlatComponent).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                    {Number(inv.lateFeePercentComponent || 0) > 0 && (
                                      <div className="breakdown-row breakdown-row-danger">
                                        <span>Tariff Interest ({inv.lateFeePercentPerMonth ?? 0}% of bill × {inv.monthsOverdue ?? 1} month{(inv.monthsOverdue ?? 1) > 1 ? 's' : ''})</span>
                                        <span className="breakdown-row-amount">₹{Number(inv.lateFeePercentComponent).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {inv.bulkPurchases && inv.bulkPurchases.length > 0 && (
                                <div className="breakdown-subpanel">
                                  <p className="form-section-title flex-row-center" style={{ marginBottom: 8 }}>
                                    <ShoppingCart size={14} /> Bulk Water Purchase Breakdown for Community
                                  </p>
                                  <div className="breakdown-stack" style={{ gap: 6 }}>
                                    {inv.bulkPurchases.map((bp, idx) => (
                                      <div key={idx} className="breakdown-row">
                                        <span className="text-muted">
                                          Vendor: <strong className="text-semibold">{bp.vendorName}</strong> ({bp.purchaseDate || 'Delivery'}) — {Number(bp.totalLiters || 0).toLocaleString()} L
                                        </span>
                                        <span className="breakdown-row-amount">₹{Number(bp.totalCost || 0).toLocaleString()}</span>
                                      </div>
                                    ))}
                                    <p className="form-hint" style={{ marginTop: 4, fontStyle: 'italic' }}>
                                      This batch cost is split equally across all active residents under your Community Admin.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {inv.lateFeeApplied && !isPaid && (
                                <div className="alert-box alert-error" style={{ fontSize: 13, marginBottom: 0 }}>
                                  <AlertCircle size={15} />
                                  <span>
                                    <strong>Overdue Notice:</strong> Due date was {inv.dueDate}. A late payment fee of ₹{inv.lateFee || 150} has been added to your bill total. Please pay as soon as possible.
                                  </span>
                                </div>
                              )}
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
    </div>
  );
};

export default MyInvoicesPage;
