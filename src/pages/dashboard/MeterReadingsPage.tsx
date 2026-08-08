import React, { useState, useEffect, useRef } from 'react';
import { Gauge, UploadCloud as UploadCloud, Trash2, Plus, FileText, AlertCircle as AlertCircle, CheckCircle as CheckCircle } from 'lucide-react';
import {
  getHouseholds,
  getWaterUsage,
  logWaterUsage,
  deleteWaterUsage,
  uploadCsv,
} from '../../api/auth';

const MeterReadingsPage: React.FC = () => {
  const [households, setHouseholds] = useState<any[]>([]);
  const [householdMap, setHouseholdMap] = useState<Record<number, string>>({});
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual entry form
  const [form, setForm] = useState({ householdId: '', readingDate: '', liters: '', meterSerialNumber: '' });
  const [formErrors, setFormErrors] = useState<{ householdId?: string; readingDate?: string; liters?: string; meterSerialNumber?: string }>({});
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // CSV upload
  const [csvHouseholdId, setCsvHouseholdId] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvMsg, setCsvMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const loadReadings = () => {
    getWaterUsage(currentMonth)
      .then((data: any) => setReadings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load meter readings.'))
      .finally(() => setLoading(false));
  };

  const getSuggestedMeterSerial = (h: any) => {
    if (!h) return '';
    const resCode = h.resident?.userCode || h.resident?.residentCode || '';
    const adminCodeStr = h.resident?.communityAdminCode || h.apartment?.admin?.userCode || 'ADM001';
    const adminNumMatch = adminCodeStr.match(/\d+/);
    const adminNum = adminNumMatch ? parseInt(adminNumMatch[0], 10) : 1;
    const resNumMatch = resCode.match(/R(\d+)/i);
    const resSeq = resNumMatch ? resNumMatch[1].padStart(3, '0') : String(h.id || 1).padStart(3, '0');
    return `M${adminNum}${resSeq}`;
  };

  const handleHouseholdSelect = (idStr: string) => {
    const selectedH = households.find((h: any) => String(h.id) === idStr);
    const suggestedSerial = selectedH ? getSuggestedMeterSerial(selectedH) : '';
    setForm(prev => ({
      ...prev,
      householdId: idStr,
      meterSerialNumber: prev.meterSerialNumber || suggestedSerial
    }));
  };

  useEffect(() => {
    getHouseholds()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setHouseholds(list);
        const map: Record<number, string> = {};
        list.forEach((h: any) => {
          map[h.id] = h.resident?.userCode || h.unitNumber;
        });
        setHouseholdMap(map);
      })
      .catch(() => setError('Failed to load households.'))
      .finally(() => setLoading(false));
    loadReadings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Manual entry =====
  const validateForm = () => {
    const errs: typeof formErrors = {};
    if (!form.householdId) errs.householdId = 'Please select a resident.';
    if (!form.readingDate) errs.readingDate = 'Please choose a date.';
    if (!form.liters || Number(form.liters) <= 0) errs.liters = 'Liters must be greater than 0.';
    if (!form.meterSerialNumber.trim()) errs.meterSerialNumber = 'Meter serial number is compulsory.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddReading = () => {
    setFormMsg(null);
    if (!validateForm()) return;
    setSubmitting(true);
    logWaterUsage({
      householdId: Number(form.householdId),
      readingDate: form.readingDate,
      liters: Number(form.liters),
      meterSerialNumber: form.meterSerialNumber.trim(),
    })
      .then(() => {
        setFormMsg({ type: 'success', text: 'Reading added successfully.' });
        setForm({ householdId: '', readingDate: '', liters: '', meterSerialNumber: '' });
        setFormErrors({});
        loadReadings();
      })
      .catch((e: any) => {
        const msg = e?.response?.data?.error || e?.response?.data?.message || 'Failed to add reading.';
        setFormMsg({ type: 'error', text: msg });
      })
      .finally(() => setSubmitting(false));
  };

  // ===== CSV upload =====
  const handleFileSelect = (file: File | null) => {
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setCsvFile(file);
      setCsvMsg(null);
    } else {
      setCsvMsg({ type: 'error', text: 'Please select a valid .csv file.' });
    }
  };

  const handleCsvUpload = () => {
    setCsvMsg(null);
    if (!csvHouseholdId) {
      setCsvMsg({ type: 'error', text: 'Please select a household.' });
      return;
    }
    if (!csvFile) {
      setCsvMsg({ type: 'error', text: 'Please choose a CSV file to upload.' });
      return;
    }
    setCsvUploading(true);
    uploadCsv(Number(csvHouseholdId), csvFile)
      .then((res: any) => {
        const imported = res?.imported ?? res?.importedCount ?? 0;
        const skipped = res?.skipped ?? res?.skippedCount ?? 0;
        const duplicates = res?.duplicates ?? res?.duplicateCount ?? 0;
        setCsvMsg({
          type: 'success',
          text: `Upload complete — Imported: ${imported}, Skipped: ${skipped}, Duplicates: ${duplicates}.`,
        });
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadReadings();
      })
      .catch((e: any) => {
        const msg = e?.response?.data?.error || e?.response?.data?.message || 'Failed to upload CSV.';
        setCsvMsg({ type: 'error', text: msg });
      })
      .finally(() => setCsvUploading(false));
  };

  // ===== Delete =====
  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;
    deleteWaterUsage(id)
      .then(() => loadReadings())
      .catch(() => setError('Failed to delete reading.'));
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner-center" />
      </div>
    );
  }

  if (error) {
    return <div className="error-center">{error}</div>;
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <h2 className="page-title">Meter Readings</h2>
        <p className="page-subtitle">Log and manage water meter readings for your community</p>
      </div>

      {/* Manual entry + CSV upload side by side */}
      <div className="grid-2-2">
        {/* ===== Manual entry ===== */}
        <div className="panel-card">
          <h3 className="panel-title">
            <Gauge size={16} /> Manual Entry
          </h3>

          {formMsg?.type === 'success' && (
            <div className="alert-box alert-info">
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{formMsg.text}</span>
            </div>
          )}
          {formMsg?.type === 'error' && (
            <div className="alert-box alert-error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{formMsg.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Resident Code <span className="field-required">*</span></label>
              <select
                className={`input-field input-select ${formErrors.householdId ? 'has-error' : ''}`}
                value={form.householdId}
                onChange={(e) => handleHouseholdSelect(e.target.value)}
              >
                <option value="">Select resident code</option>
                {households.map((h: any) => {
                  const code = h.resident?.userCode || h.resident?.residentCode || `ADM001-R${String(h.id).padStart(3, '0')}`;
                  const name = h.resident?.name ? ` — ${h.resident.name}` : '';
                  return (
                    <option key={h.id} value={h.id}>
                      {code}{name} (Unit {h.unitNumber})
                    </option>
                  );
                })}
              </select>
              {formErrors.householdId && <p className="form-error">{formErrors.householdId}</p>}
            </div>

            <div>
              <label className="form-label">Meter Serial Number <span className="field-required">*</span></label>
              <input
                type="text"
                className={`input-field ${formErrors.meterSerialNumber ? 'has-error' : ''}`}
                value={form.meterSerialNumber}
                onChange={(e) => setForm({ ...form, meterSerialNumber: e.target.value })}
                placeholder="e.g. M1001"
              />
              {formErrors.meterSerialNumber && <p className="form-error">{formErrors.meterSerialNumber}</p>}
              <p className="form-hint">Compulsory &amp; unique (e.g., M1001 for Admin 1, M2001 for Admin 2)</p>
            </div>

            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                className={`input-field ${formErrors.readingDate ? 'has-error' : ''}`}
                value={form.readingDate}
                onChange={(e) => setForm({ ...form, readingDate: e.target.value })}
              />
              {formErrors.readingDate && <p className="form-error">{formErrors.readingDate}</p>}
            </div>

            <div>
              <label className="form-label">Liters</label>
              <input
                type="number"
                min="0"
                className={`input-field ${formErrors.liters ? 'has-error' : ''}`}
                value={form.liters}
                onChange={(e) => setForm({ ...form, liters: e.target.value })}
                placeholder="e.g. 150"
              />
              {formErrors.liters && <p className="form-error">{formErrors.liters}</p>}
            </div>

            <div>
              <button
                className="btn-primary btn-sm"
                onClick={handleAddReading}
                disabled={submitting}
              >
                {submitting ? <span className="spinner-sm" /> : <Plus size={16} />}
                Add Reading
              </button>
            </div>
          </div>
        </div>

        {/* ===== CSV upload ===== */}
        <div className="panel-card">
          <h3 className="panel-title">
            <UploadCloud size={16} /> CSV Upload
          </h3>

          {csvMsg?.type === 'success' && (
            <div className="alert-box alert-info">
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{csvMsg.text}</span>
            </div>
          )}
          {csvMsg?.type === 'error' && (
            <div className="alert-box alert-error">
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{csvMsg.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Resident Code</label>
              <select
                className="input-field input-select"
                value={csvHouseholdId}
                onChange={(e) => setCsvHouseholdId(e.target.value)}
              >
                <option value="">Select resident code</option>
                {households.map((h: any) => {
                  const code = h.resident?.userCode || h.resident?.residentCode || `ADM001-R${String(h.id).padStart(3, '0')}`;
                  const name = h.resident?.name ? ` — ${h.resident.name}` : '';
                  return (
                    <option key={h.id} value={h.id}>
                      {code}{name} (Unit {h.unitNumber})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="form-label">CSV File</label>
              <div
                className={`drop-zone${dragOver ? ' active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileSelect(e.dataTransfer.files?.[0] ?? null);
                }}
              >
                <div className="drop-zone-icon">
                  <UploadCloud size={22} />
                </div>
                {csvFile ? (
                  <p className="drop-zone-filename">{csvFile.name}</p>
                ) : (
                  <p className="drop-zone-hint">Click to select or drag &amp; drop a .csv file</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
              </div>
              <p className="form-hint">CSV format: date,liters (e.g. 2025-07-01,150)</p>
            </div>

            <div>
              <button
                className="btn-secondary btn-sm"
                onClick={handleCsvUpload}
                disabled={csvUploading}
              >
                {csvUploading ? <span className="spinner-sm" /> : <UploadCloud size={16} />}
                Upload CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Readings table ===== */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <h3 className="flex-row-center">
            <FileText size={16} className="text-slate-400" />
            Readings — {currentMonth}
          </h3>
          <span className="table-count-label">{readings.length} reading{readings.length !== 1 ? 's' : ''}</span>
        </div>

        {readings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Gauge size={24} />
            </div>
            <p className="empty-title">No readings yet</p>
            <p className="empty-desc">Meter readings for this month will appear here.</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Resident Code</th>
                <th>Meter Serial Number</th>
                <th>Liters</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r: any) => {
                const resCode = householdMap[r.householdId] || r.household?.resident?.userCode || r.household?.unitNumber || '—';
                return (
                  <tr key={r.id}>
                    <td>{r.readingDate}</td>
                    <td><span className="badge badge-info">{resCode}</span></td>
                    <td><span className="badge badge-violet">{r.meterSerialNumber || '—'}</span></td>
                    <td className="text-semibold">{r.liters} L</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn remove"
                          onClick={() => handleDelete(r.id)}
                          title="Delete reading"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
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

export default MeterReadingsPage;
