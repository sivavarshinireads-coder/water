import React, { useEffect, useState } from 'react';
import { AlertCircle as AlertCircle, Building2, IndianRupee, Save, Calendar, Percent, CheckCircle as CheckCircle } from 'lucide-react';
import { getApartmentsByAdmin, updateApartment } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const TariffsPage: React.FC = () => {
  const { user } = useAuth();
  const [apartments, setApartments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [slab1LimitKl, setSlab1LimitKl] = useState('10');
  const [slab1Rate, setSlab1Rate] = useState('5');
  const [slab2LimitKl, setSlab2LimitKl] = useState('20');
  const [slab2Rate, setSlab2Rate] = useState('10');
  const [slab3LimitKl, setSlab3LimitKl] = useState('30');
  const [slab3Rate, setSlab3Rate] = useState('20');
  const [slab4Rate, setSlab4Rate] = useState('30');
  const [surchargePercent, setSurchargePercent] = useState('20');

  const [dueDateDays, setDueDateDays] = useState('15');
  const [lateFeeAmount, setLateFeeAmount] = useState('150');
  const [lateFeePercentPerMonth, setLateFeePercentPerMonth] = useState('0');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const applyApartment = (apartment: any) => {
    setSelected(apartment);
    setSlab1LimitKl(apartment.slab1LimitKl == null ? '10' : String(apartment.slab1LimitKl));
    setSlab1Rate(apartment.slab1Rate == null ? '5' : String(apartment.slab1Rate));
    setSlab2LimitKl(apartment.slab2LimitKl == null ? '20' : String(apartment.slab2LimitKl));
    setSlab2Rate(apartment.slab2Rate == null ? '10' : String(apartment.slab2Rate));
    setSlab3LimitKl(apartment.slab3LimitKl == null ? '30' : String(apartment.slab3LimitKl));
    setSlab3Rate(apartment.slab3Rate == null ? '20' : String(apartment.slab3Rate));
    setSlab4Rate(apartment.slab4Rate == null ? '30' : String(apartment.slab4Rate));
    setSurchargePercent(apartment.highUsageSurchargePercent == null ? '20' : String(apartment.highUsageSurchargePercent));
    setDueDateDays(apartment.dueDateDays == null ? '15' : String(apartment.dueDateDays));
    setLateFeeAmount(apartment.lateFeeAmount == null ? '150' : String(apartment.lateFeeAmount));
    setLateFeePercentPerMonth(apartment.lateFeePercentPerMonth == null ? '0' : String(apartment.lateFeePercentPerMonth));
  };

  const load = () => {
    if (!user) return;
    getApartmentsByAdmin(user.id)
      .then(list => {
        setApartments(list);
        const apartment = selected ? list.find((a: any) => a.id === selected.id) || list[0] : list[0];
        if (apartment) applyApartment(apartment);
      })
      .catch(() => setError('Unable to load tariff settings.'));
  };

  useEffect(() => { load(); }, [user]);

  const choose = (id: number) => {
    const apartment = apartments.find((a: any) => a.id === id);
    if (apartment) applyApartment(apartment);
    setMessage('');
    setError('');
  };

  const save = async () => {
    const fields = [slab1LimitKl, slab1Rate, slab2LimitKl, slab2Rate, slab3LimitKl, slab3Rate, slab4Rate, surchargePercent, dueDateDays, lateFeeAmount, lateFeePercentPerMonth];
    if (!selected || fields.some(v => v === '') || fields.some(v => Number(v) < 0)) {
      setError('Please fill in valid positive numbers for all slab, surcharge, and late fee fields.');
      return;
    }
    if (Number(dueDateDays) < 1 || Number(dueDateDays) > 31) {
      setError('Last date to pay must be a day of the month between 1 and 31.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateApartment(selected.id, {
        name: selected.name,
        address: selected.address,
        adminId: user?.id,
        slab1LimitKl: Number(slab1LimitKl),
        slab1Rate: Number(slab1Rate),
        slab2LimitKl: Number(slab2LimitKl),
        slab2Rate: Number(slab2Rate),
        slab3LimitKl: Number(slab3LimitKl),
        slab3Rate: Number(slab3Rate),
        slab4Rate: Number(slab4Rate),
        highUsageSurchargePercent: Number(surchargePercent),
        dueDateDays: Number(dueDateDays),
        lateFeeAmount: Number(lateFeeAmount),
        lateFeePercentPerMonth: Number(lateFeePercentPerMonth),
      });
      setMessage('Tariff & late payment settings saved successfully.');
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Unable to save tariff settings.');
    } finally {
      setSaving(false);
    }
  };

  const slabField = (label: string, value: string, onChange: (v: string) => void, placeholder: string, unit: string) => (
    <div>
      <label className="form-label">{label}</label>
      <div className="input-wrap">
        {unit === '₹' ? (
          <IndianRupee size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
        ) : null}
        <input
          className="input-field"
          style={unit === '₹' ? { paddingLeft: 36 } : undefined}
          type="number"
          min="0"
          step={unit === '₹' ? '0.5' : '1'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  return (
    <div className="page-stack content-narrow">
      <div className="page-header">
        <h2 className="page-title">Community Tariff &amp; Late Fee Settings</h2>
        <p className="page-subtitle">Configure the 4-slab water tariff and late payment penalties. Changes apply immediately and can be updated anytime.</p>
      </div>

      <div className="panel-card">
        <h3 className="panel-title"><Building2 size={18} /> Dynamic Tariff Rules</h3>

        {!apartments.length ? (
          <div className="empty-state empty-state-compact">
            <div className="empty-icon"><Building2 size={28} /></div>
            <p className="empty-title">No apartment assigned</p>
            <p className="empty-desc">No apartment is assigned to your account.</p>
          </div>
        ) : (
          <div className="modal-body-stack">
            {apartments.length > 1 && (
              <div>
                <label className="form-label">Select Apartment</label>
                <select className="input-field input-select" value={selected?.id || ''} onChange={e => choose(Number(e.target.value))}>
                  {apartments.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="tariff-preview">
              <strong>Calculation Rules:</strong>
              <ul>
                <li>0 – <strong>{slab1LimitKl || '10'} kL</strong>: ₹<strong>{slab1Rate || '5'}</strong> per kL.</li>
                <li>{slab1LimitKl || '10'} – <strong>{slab2LimitKl || '20'} kL</strong>: ₹<strong>{slab2Rate || '10'}</strong> per kL.</li>
                <li>{slab2LimitKl || '20'} – <strong>{slab3LimitKl || '30'} kL</strong>: ₹<strong>{slab3Rate || '20'}</strong> per kL.</li>
                <li>Above <strong>{slab3LimitKl || '30'} kL</strong>: ₹<strong>{slab4Rate || '30'}</strong> per kL, <strong>plus a {surchargePercent || '20'}% surcharge</strong> on the whole bill — and the household is flagged as a <strong>High Consumption Household</strong>.</li>
                <li>Payment due by the <strong>{dueDateDays || '15'}th of the month</strong>. Every month a bill stays unpaid it adds another ₹<strong>{lateFeeAmount || '150'}</strong> flat fee{Number(lateFeePercentPerMonth) > 0 ? <> plus <strong>{lateFeePercentPerMonth}%</strong> of the bill amount</> : null}.</li>
              </ul>
            </div>

            <div className="form-divider">
              <p className="form-section-title">1. Water Consumption Slabs (per kilolitre)</p>
              <div className="form-grid-2" style={{ marginTop: 14 }}>
                {slabField('Slab 1 Limit (kL) — e.g. 0-10', slab1LimitKl, setSlab1LimitKl, 'e.g. 10', 'kl')}
                {slabField('Slab 1 Rate (₹ per kL)', slab1Rate, setSlab1Rate, 'e.g. 5', '₹')}
                {slabField('Slab 2 Limit (kL) — e.g. 11-20', slab2LimitKl, setSlab2LimitKl, 'e.g. 20', 'kl')}
                {slabField('Slab 2 Rate (₹ per kL)', slab2Rate, setSlab2Rate, 'e.g. 10', '₹')}
                {slabField('Slab 3 Limit (kL) — e.g. 21-30', slab3LimitKl, setSlab3LimitKl, 'e.g. 30', 'kl')}
                {slabField('Slab 3 Rate (₹ per kL)', slab3Rate, setSlab3Rate, 'e.g. 20', '₹')}
                {slabField('Slab 4 Rate (₹ per kL, above Slab 3 limit)', slab4Rate, setSlab4Rate, 'e.g. 30', '₹')}
                <div>
                  <label className="form-label">High Usage Surcharge (%) on the whole bill</label>
                  <div className="input-wrap">
                    <Percent size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                      className="input-field"
                      style={{ paddingLeft: 36 }}
                      type="number"
                      min="0"
                      step="1"
                      value={surchargePercent}
                      onChange={e => setSurchargePercent(e.target.value)}
                      placeholder="e.g. 20"
                    />
                  </div>
                  <span className="form-hint">
                    Applied on top of the full bill once usage crosses the Slab 3 limit.
                  </span>
                </div>
              </div>
            </div>

            <div className="form-divider">
              <p className="form-section-title">2. Due Date &amp; Late Payment Penalty</p>
              <div className="form-grid-2" style={{ marginTop: 14 }}>
                <div>
                  <label className="form-label">Last Date to Pay (Day of Month)</label>
                  <div className="input-wrap">
                    <Calendar size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                      className="input-field"
                      style={{ paddingLeft: 36 }}
                      type="number"
                      min="1"
                      max="31"
                      value={dueDateDays}
                      onChange={e => setDueDateDays(e.target.value)}
                      placeholder="e.g. 15"
                    />
                  </div>
                  <span className="form-hint">e.g. 15 means 15th of every month is the payment due date.</span>
                </div>
                <div />
                <div>
                  <label className="form-label">Late Fee — Flat (₹ per month overdue)</label>
                  <div className="input-wrap">
                    <IndianRupee size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                      className="input-field"
                      style={{ paddingLeft: 36 }}
                      type="number"
                      min="0"
                      step="1"
                      value={lateFeeAmount}
                      onChange={e => setLateFeeAmount(e.target.value)}
                      placeholder="e.g. 50"
                    />
                  </div>
                  <span className="form-hint">Charged once for every month the bill stays unpaid.</span>
                </div>
                <div>
                  <label className="form-label">Late Fee — Tariff (% of bill per month overdue)</label>
                  <div className="input-wrap">
                    <Percent size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                    <input
                      className="input-field"
                      style={{ paddingLeft: 36 }}
                      type="number"
                      min="0"
                      step="0.5"
                      value={lateFeePercentPerMonth}
                      onChange={e => setLateFeePercentPerMonth(e.target.value)}
                      placeholder="e.g. 2"
                    />
                  </div>
                  <span className="form-hint">Simple interest — stacks with the flat fee above.</span>
                </div>
              </div>
            </div>

            {message && (
              <div className="alert-box alert-success">
                <CheckCircle size={16} /> <span>{message}</span>
              </div>
            )}
            {error && (
              <div className="alert-box alert-error">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <button className="btn-primary" onClick={save} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving Settings…' : 'Save Tariff & Penalty Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TariffsPage;
