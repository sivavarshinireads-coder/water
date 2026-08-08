import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart2, Droplet, TrendingUp, Users, Home, FileText,
  Download, FileDown, Table2, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getResidentReport, getAdminReport, getMainAdminReport } from '../../api/auth';

type ReportRole = 'RESIDENT' | 'COMMUNITY_ADMIN' | 'MAIN_ADMIN';

// ─── Brand colour palette ──────────────────────────────
const PIE_COLORS = ['#0d9488', '#2563eb', '#d97706', '#7c3aed', '#e11d48'];

// ─── Custom tooltip ────────────────────────────────────
const ReportTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="report-tooltip">
      <p className="report-tooltip-label">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="report-tooltip-value">
          {p.name}: {Number(p.value).toLocaleString()} L
        </p>
      ))}
    </div>
  );
};

// ─── KPI card ──────────────────────────────────────────
const KpiCard = ({ icon, label, value, unit, accent }: any) => (
  <div className={`report-kpi-card kpi-${accent}`}>
    <div className="report-kpi-icon">{icon}</div>
    <div>
      <p className="report-kpi-label">{label}</p>
      <p className="report-kpi-value">{typeof value === 'number' ? value.toLocaleString() : value ?? '–'}</p>
      {unit && <p className="report-kpi-unit">{unit}</p>}
    </div>
  </div>
);

// ─── Peak-bar table row ─────────────────────────────────
const PeakBar = ({ pct }: { pct: number }) => (
  <div className="peak-bar-wrap">
    <div className="peak-bar-track">
      <div className="peak-bar-fill" style={{ width: `${pct}%` }} />
    </div>
    <span className="peak-bar-pct">{pct}%</span>
  </div>
);

const trendIcon = (curr: number, prev: number | undefined) => {
  if (prev === undefined) return <span className="trend-flat">–</span>;
  if (curr > prev) return <span className="trend-up">↑</span>;
  if (curr < prev) return <span className="trend-down">↓</span>;
  return <span className="trend-flat">→</span>;
};

// ─── CSV download helper ────────────────────────────────
function downloadCSV(chartData: { month: string; usage: number }[], summary: Record<string, any>, householdDetails?: any[]) {
  const rows: string[][] = [
    ['Month', 'Usage (Liters)'],
    ...chartData.map(d => [d.month, String(d.usage)]),
    [],
    ['Summary Metric', 'Value'],
    ...Object.entries(summary).map(([k, v]) => [k, String(v)]),
  ];

  if (householdDetails && householdDetails.length > 0) {
    rows.push([]);
    rows.push(['Household Breakdown (Current Month)']);
    rows.push(['Apartment', 'Unit', 'Usage (Liters)']);
    householdDetails.forEach(h => {
      rows.push([String(h.apartment), String(h.unitNumber), String(h.liters)]);
    });
  }

  const csv = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `water-report-${new Date().toISOString().slice(0, 7)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF download helper (jsPDF + html2canvas) ────────────────────────
async function downloadPDF(
  chartData: { month: string; usage: number }[],
  summary: Record<string, any>,
  role: ReportRole
) {
  // Dynamically import so it doesn't block initial render
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 15;
  let y = 15;

  // Header
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageW, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AquaTrack — Water Usage Report', margin, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const roleLabel = role === 'RESIDENT' ? 'Resident Report' : role === 'COMMUNITY_ADMIN' ? 'Community Admin Report' : 'System Report';
  doc.text(`${roleLabel}  ·  Generated ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, margin, 19);
  
  y = 35;
  
  // Summary section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Summary Overview', margin, y);
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  Object.entries(summary).forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`${k}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(v), margin + 50, y);
    y += 6;
  });
  
  y += 5;

  // Capture charts if they exist
  try {
    const areaChartEl = document.getElementById('report-area-chart');
    if (areaChartEl) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Monthly Usage Trend', margin, y);
      y += 4;
      
      const canvas = await html2canvas(areaChartEl, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfW = pageW - margin * 2;
      const pdfH = (imgProps.height * pdfW) / imgProps.width;
      
      if (y + pdfH > pageH - 20) { doc.addPage(); y = 20; }
      doc.addImage(imgData, 'PNG', margin, y, pdfW, pdfH);
      y += pdfH + 10;
    }

    const comparisonEl = document.getElementById('report-comparison-charts');
    if (comparisonEl) {
      if (y + 50 > pageH - 20) { doc.addPage(); y = 20; }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('System Comparisons', margin, y);
      y += 4;

      const canvas = await html2canvas(comparisonEl, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfW = pageW - margin * 2;
      const pdfH = (imgProps.height * pdfW) / imgProps.width;
      
      if (y + pdfH > pageH - 20) { doc.addPage(); y = 20; }
      doc.addImage(imgData, 'PNG', margin, y, pdfW, pdfH);
      y += pdfH + 10;
    }
  } catch (err) {
    console.error("Failed to capture charts for PDF", err);
  }

  // Monthly breakdown table
  if (y + 20 > pageH - 20) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Monthly Data', margin, y);
  y += 5;
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  doc.setFillColor(240, 253, 250);
  doc.rect(margin, y - 3, pageW - margin * 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('MONTH', margin + 2, y + 2);
  doc.text('USAGE (L)', 90, y + 2);
  doc.text('% OF PEAK', 130, y + 2);
  y += 7;

  const peakUsage = Math.max(...chartData.map(d => d.usage), 1);
  doc.setFont('helvetica', 'normal');
  chartData.forEach((d, i) => {
    if (y > pageH - 20) { doc.addPage(); y = 20; }
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 3, pageW - margin * 2, 7, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.text(d.month, margin + 2, y + 2);
    doc.setTextColor(13, 148, 136);
    doc.text(d.usage.toLocaleString(), 90, y + 2);
    doc.setTextColor(100, 116, 139);
    doc.text(`${Math.round((d.usage / peakUsage) * 100)}%`, 130, y + 2);
    y += 7;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('AquaTrack Water Management System', margin, pageH - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin - 15, pageH - 10);
  }

  doc.save(`water-report-${new Date().toISOString().slice(0, 7)}.pdf`);
}

// ══════════════════════════════════════════════════════════
//  Main Component
// ══════════════════════════════════════════════════════════
const ReportsPage: React.FC<{ role: ReportRole }> = ({ role }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);

  const isAdmin = role === 'COMMUNITY_ADMIN' || role === 'MAIN_ADMIN';

  useEffect(() => {
    const fetcher =
      role === 'RESIDENT'
        ? getResidentReport
        : role === 'COMMUNITY_ADMIN'
          ? getAdminReport
          : getMainAdminReport;

    fetcher()
      .then(setData)
      .catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) return <div className="loading-center"><div className="spinner-center" /></div>;
  if (error)   return <div className="error-center">{error}</div>;

  // ── Chart data ──────────────────────────────────────────
  const chartData: { month: string; usage: number }[] =
    Object.entries(data.monthlyTotals || {}).map(([month, usage]) => ({
      month,
      usage: Number(usage),
    }));

  const peakUsage = Math.max(...chartData.map(d => d.usage), 1);

  // ── Resident weekly avg ─────────────────────────────────
  const weekly = data.weeklyUsage || [];
  const weeklyAvg = weekly.length
    ? Math.round(weekly.reduce((sum: number, w: any) => sum + (w.usage || 0), 0) / weekly.length)
    : 0;

  // ── Pie chart data (admin only) ─────────────────────────
  const pieData = isAdmin
    ? [
        { name: 'Residents', value: Number(data.totalResidents) || 0 },
        { name: 'Admins', value: Number(data.totalAdmins) || 0 },
        { name: 'Households', value: Number(data.totalHouseholds) || 0 },
      ].filter(p => p.value > 0)
    : [];

  // ── Summary dict for export ─────────────────────────────
  const summaryForExport: Record<string, any> = {
    'Report Period': data.currentMonth || 'N/A',
    'Current Month Usage (L)': data.monthTotalLiters,
    'All-Time Total (L)': data.allTimeTotalLiters,
    ...(isAdmin
      ? {
          'Total Residents': data.totalResidents,
          'Total Admins': data.totalAdmins,
          'Total Households': data.totalHouseholds,
          'Total Readings': data.totalReadings,
        }
      : {
          'Total Readings': data.readingCount,
          'Weekly Avg (L/day)': weeklyAvg,
        }),
  };

  // ── Page labels ─────────────────────────────────────────
  const headerTitle =
    role === 'RESIDENT' ? 'My Usage Report'
      : role === 'COMMUNITY_ADMIN' ? 'Community Reports'
      : 'System Reports';

  const headerSub =
    role === 'RESIDENT' ? 'Track your water consumption over time'
      : role === 'COMMUNITY_ADMIN' ? 'Water usage insights for your community'
      : 'Platform-wide water usage analytics';

  // ── KPI cards config ────────────────────────────────────
  const kpiCards = [
    {
      icon: <Droplet size={20} />, label: 'Current Month', accent: 'teal',
      value: data.monthTotalLiters, unit: 'liters used this month',
    },
    {
      icon: <Activity size={20} />, label: 'All-Time Total', accent: 'blue',
      value: data.allTimeTotalLiters, unit: 'liters all time',
    },
    {
      icon: <FileText size={20} />, label: 'Total Readings', accent: 'amber',
      value: isAdmin ? data.totalReadings : data.readingCount, unit: 'meter records',
    },
    role === 'RESIDENT'
      ? { icon: <TrendingUp size={20} />, label: 'Weekly Avg', accent: 'violet', value: weeklyAvg, unit: 'liters per day' }
      : role === 'COMMUNITY_ADMIN'
        ? { icon: <Home size={20} />, label: 'Households', accent: 'violet', value: data.totalHouseholds, unit: 'registered units' }
        : { icon: <Users size={20} />, label: 'Residents', accent: 'violet', value: data.totalResidents, unit: 'registered users' },
  ];

  return (
    <div className="reports-page">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">{headerTitle}</h2>
          <p className="page-subtitle">{headerSub}</p>
        </div>
      </div>

      {/* ── Export bar ──────────────────────────────────── */}
      <div className="export-bar">
        <span className="export-bar-label">
          <Download size={15} />
          Export full report data
        </span>
        <div className="export-actions">
          <button
            className="btn-export btn-export-csv"
            disabled={exporting !== null}
            onClick={() => {
              setExporting('csv');
              try { downloadCSV(chartData, summaryForExport, data.householdDetails); } finally { setExporting(null); }
            }}
          >
            <Table2 size={14} />
            {exporting === 'csv' ? 'Generating…' : 'Download CSV'}
          </button>
          <button
            className="btn-export btn-export-pdf"
            disabled={exporting !== null}
            onClick={async () => {
              setExporting('pdf');
              try { await downloadPDF(chartData, summaryForExport, role); }
              finally { setExporting(null); }
            }}
          >
            <FileDown size={14} />
            {exporting === 'pdf' ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────── */}
      <p className="reports-section-label">Key Metrics</p>
      <div className="report-kpi-grid">
        {kpiCards.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* ── Area trend (full width) ──────────────────────── */}
      <p className="reports-section-label">Usage Trend</p>
      <div id="report-area-chart" className="report-chart-card">
        <div className="chart-header">
          <p className="report-chart-title">
            <Activity size={16} style={{ color: '#0d9488' }} />
            Monthly Usage Trend
          </p>
          <span className="report-chart-sub">Last 7 months · liters</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ReportTooltip />} />
            <Area
              type="monotone" dataKey="usage" name="Usage"
              stroke="#0d9488" strokeWidth={2.5}
              fill="url(#areaGrad)" dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Comparison charts (admin only) ──────────────── */}
      {isAdmin && (
        <>
          <p className="reports-section-label">Comparison Charts</p>
          <div id="report-comparison-charts" className="reports-charts-grid">

            {/* Bar chart — monthly comparison */}
            <div className="report-chart-card">
              <div className="chart-header">
                <p className="report-chart-title">
                  <BarChart2 size={16} style={{ color: '#2563eb' }} />
                  Monthly Bar Comparison
                </p>
                <span className="report-chart-sub">volume · liters</span>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ReportTooltip />} />
                  <Bar dataKey="usage" name="Usage" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => {
                      // Gradient effect: peak month gets the darkest teal
                      const ratio = entry.usage / peakUsage;
                      const opacity = 0.4 + ratio * 0.6;
                      return <Cell key={`cell-${index}`} fill={`rgba(13,148,136,${opacity})`} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — system composition */}
            <div className="report-chart-card">
              <div className="chart-header">
                <p className="report-chart-title">
                  <PieChartIcon size={16} style={{ color: '#7c3aed' }} />
                  System Composition
                </p>
                <span className="report-chart-sub">users &amp; units</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    outerRadius={85} innerRadius={45}
                    dataKey="value"
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_entry, i) => (
                      <Cell key={`pie-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any, name: string) => [Number(v).toLocaleString(), name]}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="report-legend">
                {pieData.map((p, i) => (
                  <div key={i} className="report-legend-item">
                    <div className="report-legend-dot" style={{ background: PIE_COLORS[i] }} />
                    {p.name}: <strong>{p.value.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Monthly breakdown table ──────────────────────── */}
      <p className="reports-section-label">Monthly Breakdown</p>
      <div className="report-table-card">
        <div className="report-table-header">
          <p className="report-table-title">
            <Table2 size={16} style={{ color: '#0d9488' }} />
            Detailed Monthly Data
          </p>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {chartData.length} months shown
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="report-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Usage (L)</th>
                <th>% of Peak</th>
                <th>vs Prev Month</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => {
                const prev = chartData[i - 1]?.usage;
                const pct = Math.round((row.usage / peakUsage) * 100);
                return (
                  <tr key={row.month}>
                    <td className="month-label">{row.month}</td>
                    <td className="usage-val">{row.usage.toLocaleString()}</td>
                    <td className="peak-bar-cell">
                      <PeakBar pct={pct} />
                    </td>
                    <td>{trendIcon(row.usage, prev)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
