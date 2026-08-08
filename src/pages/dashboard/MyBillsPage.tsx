import React, { useState, useEffect } from 'react';
import { Receipt, Droplet, FileText, IndianRupee, CreditCard, CheckCircle as CheckCircle, AlertCircle as AlertCircle, Download } from 'lucide-react';
import { getMyBills, getActiveTariff, payBill } from '../../api/auth';
import api from '../../api/axios';

interface Bill {
  id?: number;
  month: string;
  totalLiters?: number;
  amount: number;
  readingCount?: number;
  status: string;
  consumptionLiters?: number;
  previousReading?: number;
  currentReading?: number;
}

interface Tariff {
  name?: string;
  ratePerLiter?: number;
  baseRate?: number;
  higherRate?: number;
  slabLimitLiters?: number;
  slabs?: { from: number; to: number | null; rate: number }[];
}

const statusBadge = (status: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'PAID' || s === 'ACTIVE' || s === 'SETTLED') return 'badge-active';
  if (s === 'PENDING' || s === 'UNPAID' || s === 'WARNING') return 'badge-warning';
  return 'badge-info';
};

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

const MyBillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [tariff, setTariff] = useState<Tariff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMsg, setPayMsg] = useState('');

  useEffect(() => {
    Promise.all([
      getMyBills().then((data: any) => (Array.isArray(data) ? (data as Bill[]) : [])),
      getActiveTariff().then((data: any) => (data || null)).catch(() => null),
    ])
      .then(([b, t]) => {
        setBills(b);
        setTariff(t);
      })
      .catch(() => setError('Failed to load your bills.'))
      .finally(() => setLoading(false));
  }, []);

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  const handlePay = async (billId: number, amount: number, billMonth: string) => {
    setPayingId(billId);
    setPayMsg('');
    setError('');

    const markPaid = async () => {
      try {
        await payBill(billId);
        setBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'PAID' } : b));
        setPayMsg('Payment successful! Downloading your invoice...');
        setTimeout(() => setPayMsg(''), 5000);
        // Auto-trigger the invoice PDF download right after a successful payment.
        await downloadInvoice(billId, billMonth);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Payment confirmation failed on backend.');
      } finally {
        setPayingId(null);
      }
    };

    try {
      if (window.Razorpay) {
        const options = {
          key: 'rzp_test_TFndriycnkKZmN',
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'AquaTrack Billing',
          description: `Water Bill for ${formatMonth(billMonth)}`,
          image: 'https://cdn-icons-png.flaticon.com/512/424/424074.png',
          handler: async function () {
            await markPaid();
          },
          modal: {
            ondismiss: function () {
              // User closed the modal without paying
              setPayingId(null);
            },
            escape: true,
          },
          prefill: {
            name: 'AquaTrack Resident',
            email: 'resident@aquatrack.com',
            contact: '9999999999',
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
          // Razorpay failed to open (e.g. invalid key in test) — fallback to simulation
          await simulatePay(amount, billMonth, markPaid);
        }
      } else {
        // SDK not loaded — fallback to simulation
        await simulatePay(amount, billMonth, markPaid);
      }
    } catch {
      setError('Payment initialization failed.');
      setPayingId(null);
    }
  };

  const simulatePay = async (
    amount: number,
    billMonth: string,
    markPaid: () => Promise<void>
  ) => {
    const confirmed = window.confirm(
      `Confirm payment of ₹${Number(amount).toLocaleString('en-IN')} for ${formatMonth(billMonth)}?\n\n(Test mode — no real payment is charged)`
    );
    if (confirmed) {
      await markPaid();
    } else {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner-center" />
      </div>
    );
  }

  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentBill =
    bills.find((b) => (b.month || '').slice(0, 7) === currentMonthKey) ||
    bills[0];
  const totalReadings = bills.reduce((sum, b) => sum + (b.readingCount || 0), 0);
  const allTimeLiters = bills.reduce((sum, b) => sum + (b.totalLiters || b.consumptionLiters || 0), 0);

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">My Bills</h2>
        <p className="page-subtitle">Your monthly water bills and the current rate card</p>
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

      {/* Summary stats */}
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon bg-primary-50">
            <IndianRupee size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="stat-label">Current Month Bill</p>
            <p className="stat-value">
              ₹{currentBill ? Number(currentBill.amount).toLocaleString('en-IN') : 0}
            </p>
            <p className="stat-sub">
              {currentBill ? formatMonth(currentBill.month) : 'No bill yet'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-teal-50">
            <FileText size={20} className="text-teal-600" />
          </div>
          <div>
            <p className="stat-label">Total Readings</p>
            <p className="stat-value">{totalReadings.toLocaleString('en-IN')}</p>
            <p className="stat-sub">Across all billed months</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-amber-50">
            <Droplet size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="stat-label">All-Time Liters</p>
            <p className="stat-value">{allTimeLiters.toLocaleString('en-IN')}</p>
            <p className="stat-sub">Lifetime consumption</p>
          </div>
        </div>
      </div>

      {/* Active tariff rate card */}
      {tariff && (
        <div className="card">
          <h3 className="panel-title">
            <Receipt size={16} /> Active Tariff
            {tariff.name ? (
              <span className="badge badge-active" style={{ marginLeft: 4 }}>
                {tariff.name}
              </span>
            ) : null}
          </h3>

          {Array.isArray(tariff.slabs) && tariff.slabs.length > 0 ? (
            <div className="data-table-wrap" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
              <div className="table-scroll">
                <table className="data-table">
                <thead>
                  <tr>
                    <th>From (L)</th>
                    <th>To (L)</th>
                    <th>Rate (₹/L)</th>
                  </tr>
                </thead>
                <tbody>
                  {tariff.slabs.map((s, i) => (
                    <tr key={i}>
                      <td>{s.from}</td>
                      <td>{s.to === null || s.to === undefined ? '∞' : s.to}</td>
                      <td>₹{Number(s.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : (
            <p className="stat-sub" style={{ marginTop: 0 }}>
              {typeof tariff.ratePerLiter === 'number'
                ? `Flat rate: ₹${Number(tariff.ratePerLiter).toFixed(2)} per liter`
                : typeof tariff.baseRate === 'number'
                  ? 'First ' + Number(tariff.slabLimitLiters || 10000).toLocaleString() + ' L: ₹' + Number(tariff.baseRate).toFixed(3) + '/L · Above that: ₹' + Number(tariff.higherRate ?? tariff.baseRate).toFixed(3) + '/L'
                  : 'Tariff details unavailable.'}
            </p>
          )}
        </div>
      )}

      {/* Monthly bills table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center">
            <Receipt size={16} className="text-slate-400" />
            Monthly Bills
          </h3>
          <span className="table-count-label">{bills.length} bill{bills.length !== 1 ? 's' : ''}</span>
        </div>

        {bills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Receipt size={24} />
            </div>
            <p className="empty-title">No bills yet</p>
            <p className="empty-desc">Your monthly water bills will appear here once generated.</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Consumption (L)</th>
                <th>Amount (₹)</th>
                <th>Readings</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.month}>
                  <td>{formatMonth(b.month)}</td>
                  <td>{Number(b.consumptionLiters || b.totalLiters || 0).toLocaleString('en-IN')}</td>
                  <td>₹{Number(b.amount || 0).toLocaleString('en-IN')}</td>
                  <td>{b.readingCount ?? 0}</td>
                  <td>
                    <span className={`badge ${statusBadge(b.status)}`}>
                      {b.status || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {b.status?.toUpperCase() === 'UNPAID' && b.id ? (
                        <button
                          onClick={() => handlePay(b.id!, b.amount, b.month)}
                          disabled={payingId === b.id}
                          className="btn-primary btn-xs"
                        >
                          {payingId === b.id ? (
                            <span className="spinner-sm" />
                          ) : (
                            <><CreditCard size={13} /> Pay Now</>
                          )}
                        </button>
                      ) : b.status?.toUpperCase() === 'PAID' ? (
                        <span className="badge badge-active badge-inline">
                          <CheckCircle size={12} /> Paid
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                      )}
                      {b.id && (
                        <button
                          onClick={() => downloadInvoice(b.id!, b.month)}
                          className="btn-secondary btn-xs"
                          title="Download PDF Invoice"
                        >
                          <Download size={13} /> Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBillsPage;
