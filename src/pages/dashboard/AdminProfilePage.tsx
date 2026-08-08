import React, { useState, useEffect } from 'react';
import {
  User as UserIcon, Mail, Phone, Save, Lock, CheckCircle, AlertCircle,
  Building2, MapPin, Shield, Hash, Calendar, Users, Droplets, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMe, completeProfile, changePassword, getApartmentsByAdmin } from '../../api/auth';

const AdminProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    alternativeEmail: '',
    userCode: '',
    approvalStatus: '',
    idProofType: '',
    idProofNumber: '',
  });
  const [apartment, setApartment] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const me = await getMe();
      setProfile({
        name: me.name || '',
        email: me.email || '',
        phone: me.phone || '',
        gender: me.gender || '',
        age: me.age?.toString() || '',
        alternativeEmail: me.alternativeEmail || '',
        userCode: (me as any).userCode || (me as any).adminCode || '',
        approvalStatus: (me as any).approvalStatus || 'APPROVED',
        idProofType: (me as any).idProofType || '',
        idProofNumber: (me as any).idProofNumber || '',
      });
      if (me.id) {
        const apts = await getApartmentsByAdmin(me.id);
        if (Array.isArray(apts) && apts.length > 0) setApartment(apts[0]);
      }
    } catch {
      if (user) setProfile(p => ({ ...p, name: user.name, email: user.email }));
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    if (!profile.name.trim()) { setProfileError('Name is required'); return; }
    setSavingProfile(true);
    try {
      const updated = await completeProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        gender: profile.gender || undefined,
        age: profile.age ? parseInt(profile.age) : undefined,
        alternativeEmail: profile.alternativeEmail || undefined,
      });
      updateUser({ name: updated.name, phone: updated.phone, profileCompleted: true });
      setProfileMsg('Profile saved successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdMsg('');
    if (passwordForm.newPassword.length < 8) { setPwdError('New password must be at least 8 characters'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPwdError('Passwords do not match'); return; }
    setSavingPwd(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPwdMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdMsg(''), 3000);
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  const statusColor = profile.approvalStatus === 'APPROVED' ? '#16a34a' : profile.approvalStatus === 'REJECTED' ? '#dc2626' : '#d97706';
  const statusBg = profile.approvalStatus === 'APPROVED' ? '#dcfce7' : profile.approvalStatus === 'REJECTED' ? '#fee2e2' : '#fef3c7';

  return (
    <div className="page-stack profile-page">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
        borderRadius: 16,
        padding: '32px 36px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginBottom: 8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          background: 'rgba(255,255,255,0.06)', borderRadius: '50%',
        }} />
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '3px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
          backdropFilter: 'blur(4px)',
        }}>
          {profile.name.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>{profile.name || 'Community Admin'}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 10px', fontSize: 14 }}>{profile.email}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600, backdropFilter: 'blur(4px)' }}>
              <Shield size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />Community Admin
            </span>
            {profile.userCode && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                <Hash size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />{profile.userCode}
              </span>
            )}
            <span style={{ background: statusBg, color: statusColor, fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
              {profile.approvalStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Apartment / Community Summary */}
      {apartment && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 8 }}>
          {[
            { icon: Building2, label: 'Apartment', value: apartment.name, color: '#0d9488' },
            { icon: MapPin, label: 'Address', value: apartment.address || 'Not set', color: '#0891b2' },
            { icon: Users, label: 'Total Households', value: apartment.householdCount ?? apartment.households?.length ?? apartment.totalHouseholds ?? '—', color: '#7c3aed' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Identity / ID Proof Info */}
      {(profile.idProofType || profile.idProofNumber) && (
        <div className="profile-section-card" style={{ marginBottom: 8 }}>
          <div className="profile-section-header">
            <Key size={20} />
            <h2 className="profile-section-title">Identity Verification</h2>
          </div>
          <div className="form-grid-2">
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>ID Proof Type</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{profile.idProofType || '—'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>ID Number</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{profile.idProofNumber || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="profile-section-card">
        <div className="profile-section-header">
          <UserIcon size={20} />
          <h2 className="profile-section-title">Personal Information</h2>
        </div>
        {profileError && <div className="alert-box alert-error" style={{ marginBottom: 16 }}><AlertCircle size={16} /> <span>{profileError}</span></div>}
        {profileMsg && <div className="alert-box alert-success" style={{ marginBottom: 16 }}><CheckCircle size={16} /> <span>{profileMsg}</span></div>}
        <form onSubmit={handleProfileSave} className="form-grid-2">
          <div>
            <label className="form-label">Full Name</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Your full name" />
          </div>
          <div>
            <label className="form-label">Email (read-only)</label>
            <input value={profile.email} disabled className="input-field input-disabled" />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <div className="input-wrap">
              <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field" style={{ paddingLeft: 36 }} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="form-label">Alternative Email <span className="form-section-title-muted">(optional)</span></label>
            <div className="input-wrap">
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input type="email" value={profile.alternativeEmail} onChange={e => setProfile(p => ({ ...p, alternativeEmail: e.target.value }))} className="input-field" style={{ paddingLeft: 36 }} placeholder="alt@example.com" />
            </div>
          </div>
          <div>
            <label className="form-label">Gender</label>
            <select value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))} className="input-field input-select">
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Age</label>
            <input type="number" value={profile.age} onChange={e => setProfile(p => ({ ...p, age: e.target.value }))} className="input-field" placeholder="30" min={1} max={120} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <span className="spinner-sm" /> : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="profile-section-card">
        <div className="profile-section-header">
          <Lock size={20} />
          <h2 className="profile-section-title">Change Password</h2>
        </div>
        {pwdError && <div className="alert-box alert-error" style={{ marginBottom: 16 }}><AlertCircle size={16} /> <span>{pwdError}</span></div>}
        {pwdMsg && <div className="alert-box alert-success" style={{ marginBottom: 16 }}><CheckCircle size={16} /> <span>{pwdMsg}</span></div>}
        <form onSubmit={handlePasswordChange} className="form-grid-2">
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} className="input-field" placeholder="Enter current password" />
          </div>
          <div />
          <div>
            <label className="form-label">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="input-field" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="input-field" placeholder="Repeat new password" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={savingPwd} className="btn-primary">
              {savingPwd ? <span className="spinner-sm" /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfilePage;
