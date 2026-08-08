import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, BarChart as BarChart2, Bell, ShieldCheck, Zap, Users, ChevronRight, CheckCircle as CheckCircle, ArrowRight, Building2, Gauge } from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';
import ChatbotWidget from '../components/ChatbotWidget';

const features = [
  {
    icon: BarChart2,
    title: 'Real-time Usage Tracking',
    desc: 'Monitor water consumption per unit in real time with intuitive dashboards and trend analytics.',
  },
  {
    icon: Bell,
    title: 'Leak & Anomaly Alerts',
    desc: 'Instant notifications for unusual consumption patterns — prevent waste before it becomes a problem.',
  },
  {
    icon: ShieldCheck,
    title: 'Tiered Billing Engine',
    desc: 'Automated billing with configurable tariff slabs and accurate cost apportionment across households.',
  },
  {
    icon: Zap,
    title: 'Smart Analytics',
    desc: 'Historical reports, apartment-level comparisons, and conservation insights in one view.',
  },
  {
    icon: Users,
    title: 'Role-based Access',
    desc: 'Separate portals for residents, community admins, and main administrators — zero overlap.',
  },
  {
    icon: Droplets,
    title: 'Water Purchase Tracking',
    desc: 'Track bulk procurement, tank levels, and distribution efficiency from a single dashboard.',
  },
];

const stats = [
  { value: '50K+',  label: 'Litres Monitored Daily' },
  { value: '1,200+', label: 'Active Households' },
  { value: '98%',   label: 'Billing Accuracy' },
  { value: '30%',   label: 'Average Water Saved' },
];

const steps = [
  {
    step: '01',
    title: 'Admin Onboards Community',
    desc: 'The main admin creates the community, assigns community admins who set up apartments and enrol households.',
  },
  {
    step: '02',
    title: 'Residents Track Usage',
    desc: 'Each unit gets a personalised dashboard showing live consumption, bills, alerts, and conservation tips.',
  },
  {
    step: '03',
    title: 'Automated Billing & Alerts',
    desc: 'The billing engine calculates tiered costs, generates PDF invoices, and dispatches leak notifications instantly.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div style={{ background: '#f5f6fa' }}>

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="flex-row-center" style={{ gap: 10 }}>
            <div className="sidebar-logo" style={{ width: 34, height: 34, borderRadius: 10 }}>
              <Droplets size={18} />
            </div>
            <span style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: 18, letterSpacing: '-0.02em' }}>
              AquaTrack
            </span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#stats">Impact</a>
          </div>

          <div className="landing-nav-cta">
            <GoogleTranslate />
            <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
            <Link to="/signup" className="btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-blob" style={{ top: -100, left: -80,  width: 480, height: 480, background: '#5eead4' }} />
        <div className="hero-blob" style={{ top: 80,  right: -60, width: 380, height: 380, background: '#67e8f9' }} />

        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Next-generation Water Management Platform
          </div>

          <h1 className="hero-title">
            Monitor, Manage &<br />
            <span className="hero-title-gradient">Conserve Water</span>
          </h1>

          <p className="hero-text">
            A complete platform for apartment communities to track water usage,
            automate billing, detect leaks, and build conservation habits — all from one place.
          </p>

          <div className="hero-cta">
            <Link to="/signup" className="btn-primary-lg">
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost-dark">
              Sign In to Dashboard
            </Link>
          </div>

          {/* Social proof strip */}
          <div style={{
            marginTop: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32,
            flexWrap: 'wrap'
          }}>
            {[
              { icon: Building2, text: '200+ Apartment communities' },
              { icon: ShieldCheck, text: 'Enterprise-grade security' },
              { icon: Gauge, text: 'Real-time telemetry' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500
              }}>
                <Icon size={16} style={{ color: '#5eead4' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section id="stats" className="stats-banner">
        <div className="stats-banner-inner">
          {stats.map(({ value, label }) => (
            <div key={label} className="stat-banner-item">
              <div className="stat-banner-value">{value}</div>
              <div className="stat-banner-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Platform Capabilities</p>
            <h2 className="section-title">Everything your community needs</h2>
            <p className="section-subtitle">
              A full suite of tools to bring transparency, efficiency, and savings
              to community water management.
            </p>
          </div>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div className="feature-icon"><Icon size={22} /></div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="section section-bg-slate">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Simple Setup</p>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three steps to full visibility and automation.</p>
          </div>
          <div className="howitworks-grid">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="howitworks-item">
                <div className="howitworks-num">{step}</div>
                <h3 className="howitworks-title">{title}</h3>
                <p className="howitworks-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Highlights ── */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <p className="section-eyebrow">Role-based Portals</p>
            <h2 className="section-title">Built for every stakeholder</h2>
            <p className="section-subtitle">Each role gets a purpose-built dashboard with exactly the data they need.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                role: 'Residents',
                icon: Users,
                colour: 'var(--brand-600)',
                bg: 'var(--brand-50)',
                border: 'var(--brand-100)',
                points: ['View live daily usage', 'Download invoices', 'Track billing history', 'Receive leak alerts'],
              },
              {
                role: 'Community Admins',
                icon: Building2,
                colour: '#0891b2',
                bg: '#ecfeff',
                border: '#cffafe',
                points: ['Manage residents & units', 'Record meter readings', 'Finalise billing cycles', 'Monitor bulk purchases'],
              },
              {
                role: 'Main Admins',
                icon: ShieldCheck,
                colour: '#059669',
                bg: 'var(--green-50)',
                border: 'var(--green-200)',
                points: ['Onboard communities', 'Manage community admins', 'Platform-wide analytics', 'Configure tariff slabs'],
              },
            ].map(({ role, icon: Icon, colour, bg, border, points }) => (
              <div key={role} style={{
                background: '#fff', borderRadius: 16, padding: 28,
                boxShadow: 'var(--shadow-card)', border: `1px solid ${border}`,
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 13, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18, border: `1px solid ${border}`
                }}>
                  <Icon size={22} style={{ color: colour }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--slate-900)', marginBottom: 16, letterSpacing: '-0.01em' }}>{role}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {points.map(p => (
                    <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--slate-600)', fontWeight: 500 }}>
                      <CheckCircle size={15} style={{ color: colour, flexShrink: 0 }} />
                      {p}
                    </div>
                  ))}
                </div>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 22,
                  fontSize: 13, fontWeight: 600, color: colour,
                }}>
                  Access Portal <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to transform your community?</h2>
          <p className="cta-text">
            Join communities already saving water and money with AquaTrack's intelligent management platform.
          </p>
          <div className="cta-roles">
            {['Residents Portal', 'Community Admins', 'Automated Invoicing'].map((role) => (
              <div key={role} className="cta-role-item">
                <CheckCircle size={17} /> {role}
              </div>
            ))}
          </div>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary-lg">Create Free Account</Link>
            <Link to="/login" className="btn-ghost-dark">Sign In</Link>
          </div>
        </div>
      </section>


      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-icon"><Droplets size={16} /></div>
            <span className="footer-brand-text">AquaTrack</span>
          </div>
          <p className="footer-copy">
            Smart Water Monitoring & Intelligent Billing Platform &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* ── Landing Chatbot ── */}
      <ChatbotWidget role="LANDING" />
    </div>
  );
};

export default LandingPage;
