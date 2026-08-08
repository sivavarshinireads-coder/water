import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Eye, EyeOff, AlertCircle, CheckCircle, Upload, Building2, CreditCard, Phone, User, Lock, ShieldCheck, FileCheck2, Sparkles, ArrowLeft, type LucideIcon } from 'lucide-react';
import GoogleTranslate from '../components/GoogleTranslate';
import { signup } from '../api/auth';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    apartmentName: '',
    apartmentAddress: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
    idProofImage: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.apartmentName.trim()) errs.apartmentName = 'Apartment name is required';
    if (!form.apartmentAddress.trim()) errs.apartmentAddress = 'Apartment address is required';
    if (!form.idProofNumber.trim()) errs.idProofNumber = 'ID proof number is required';
    if (!form.idProofImage) errs.idProofImage = 'Please upload your ID proof image';
    return errs;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, idProofImage: reader.result as string }));
        setErrors(errs => { const n = { ...errs }; delete n.idProofImage; return n; });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    try {
      await signup({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone,
        apartmentName: form.apartmentName.trim(),
        apartmentAddress: form.apartmentAddress.trim(),
        idProofType: form.idProofType,
        idProofNumber: form.idProofNumber.trim(),
        idProofImage: form.idProofImage,
      });
      setSuccess('Account submitted for verification! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Signup failed. Please try again.';
      if (data?.error) msg = data.error;
      else if (data?.email) msg = data.email;
      else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) msg = data[firstKey];
      }
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(errs => { const n = { ...errs }; delete n[e.target.name]; return n; });
  };

  const inputIcon = (Icon: LucideIcon) => <Icon size={16} />;

  return (
    <div className="auth-split-page">

      {/* ── Left: Brand Panel ── */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">

          <Link to="/" className="auth-brand-logo">
            <div className="auth-brand-logo-icon">
              <Droplets size={22} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#fff' }}>
              AquaTrack
            </span>
          </Link>

          <h1 className="auth-brand-title">
            Start managing your community's water
          </h1>
          <p className="auth-brand-subtitle">
            Join communities across India using AquaTrack to monitor usage, automate billing,
            and save water together.
          </p>

          <div className="auth-brand-features">
            {[
              { icon: User,      title: 'Personal Information',    desc: 'Your admin account credentials and contact details' },
              { icon: Building2, title: 'Apartment Details',        desc: 'Register your community name and address' },
              { icon: ShieldCheck, title: 'ID Verification',        desc: 'Upload ID proof for admin verification' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="auth-brand-feature" style={{ alignItems: 'flex-start' }}>
                <div className="auth-brand-feature-icon" style={{ marginTop: 2 }}>
                  <Icon size={16} style={{ color: '#fff' }} />
                </div>
                <div style={{ paddingTop: 2 }}>
                  <strong style={{ display: 'block', color: '#fff', fontWeight: 700, marginBottom: 2 }}>{title}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-brand-badge">
            <ShieldCheck size={14} style={{ color: '#fff' }} />
            Bank-grade security · Your data stays private
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card auth-form-card-wide">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Link to="/" className="auth-back-link"><ArrowLeft size={14} /> Back to home</Link>
            <GoogleTranslate />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'var(--brand-700)', marginBottom: 14 }}>
              <Sparkles size={13} /> Community Admin Registration
            </div>
            <h1 className="auth-form-title">Create your admin account</h1>
            <p className="auth-form-subtitle">Fill in the details below to register your community</p>
          </div>

          {serverError && (
            <div className="alert-box alert-error" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}
          {success && (
            <div className="alert-box alert-info" style={{ marginBottom: 16 }}>
              <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Personal Info */}
            <div className="signup-section-label">
              <span className="signup-section-num">1</span>
              Personal Information
            </div>

            <div className="signup-field-grid">
              <div>
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: errors.name ? 'var(--error)' : 'var(--slate-400)' }}>
                    {inputIcon(User)}
                  </span>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" className={`input-field ${errors.name ? 'has-error' : ''}`} style={{ paddingLeft: 36 }} />
                </div>
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <div className="input-wrap">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: errors.phone ? 'var(--error)' : 'var(--slate-400)' }}>
                    {inputIcon(Phone)}
                  </span>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" className={`input-field ${errors.phone ? 'has-error' : ''}`} style={{ paddingLeft: 36 }} />
                </div>
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@community.com" className={`input-field ${errors.email ? 'has-error' : ''}`} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="signup-field-grid">
              <div>
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: errors.password ? 'var(--error)' : 'var(--slate-400)' }}>
                    {inputIcon(Lock)}
                  </span>
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className={`input-field ${errors.password ? 'has-error' : ''}`} style={{ paddingLeft: 36, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="toggle-btn" style={{ right: 8 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <div className="input-wrap">
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: errors.confirmPassword ? 'var(--error)' : 'var(--slate-400)' }}>
                    {inputIcon(Lock)}
                  </span>
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className={`input-field ${errors.confirmPassword ? 'has-error' : ''}`} style={{ paddingLeft: 36, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="toggle-btn" style={{ right: 8 }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Apartment Details */}
            <div className="signup-section-label">
              <span className="signup-section-num">2</span>
              <Building2 size={15} />
              Apartment Details
            </div>

            <div>
              <label className="form-label">Apartment / Community Name</label>
              <input name="apartmentName" value={form.apartmentName} onChange={handleChange} placeholder="Sunrise Apartments" className={`input-field ${errors.apartmentName ? 'has-error' : ''}`} />
              {errors.apartmentName && <p className="form-error">{errors.apartmentName}</p>}
            </div>

            <div>
              <label className="form-label">Apartment Address</label>
              <textarea name="apartmentAddress" value={form.apartmentAddress} onChange={handleChange} placeholder="123 MG Road, Bangalore, Karnataka 560001" className={`input-field ${errors.apartmentAddress ? 'has-error' : ''}`} style={{ minHeight: 70, resize: 'vertical' }} />
              {errors.apartmentAddress && <p className="form-error">{errors.apartmentAddress}</p>}
            </div>

            {/* ID Proof */}
            <div className="signup-section-label">
              <span className="signup-section-num">3</span>
              <CreditCard size={15} />
              ID Proof Verification
            </div>

            <div className="signup-field-grid">
              <div>
                <label className="form-label">ID Proof Type</label>
                <select name="idProofType" value={form.idProofType} onChange={handleChange} className="input-field" style={{ appearance: 'none', cursor: 'pointer' }}>
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>

              <div>
                <label className="form-label">ID Proof Number</label>
                <input name="idProofNumber" value={form.idProofNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" className={`input-field ${errors.idProofNumber ? 'has-error' : ''}`} />
                {errors.idProofNumber && <p className="form-error">{errors.idProofNumber}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Upload ID Proof Image</label>
              <div
                className={`signup-upload-area ${errors.idProofImage ? 'has-error' : ''} ${form.idProofImage ? 'uploaded' : ''}`}
                onClick={() => document.getElementById('id-proof-upload')?.click()}
              >
                {form.idProofImage ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <FileCheck2 size={28} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: 13, color: 'var(--slate-700)', fontWeight: 600 }}>ID proof uploaded</span>
                    <span style={{ fontSize: 12, color: 'var(--slate-500)' }}>Click to replace</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Upload size={28} style={{ color: 'var(--slate-400)' }} />
                    <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>Click to upload ID proof image</span>
                    <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>PNG, JPG up to 5MB</span>
                  </div>
                )}
                <input id="id-proof-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
              {errors.idProofImage && <p className="form-error">{errors.idProofImage}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: 20, width: '100%', padding: '12px 20px', fontSize: 15, borderRadius: 11 }}>
              {isLoading ? (<><span className="spinner-sm" /> Submitting for verification...</>) : 'Submit for Verification'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--slate-500)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
