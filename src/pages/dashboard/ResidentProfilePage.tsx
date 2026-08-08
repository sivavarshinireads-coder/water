import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Save, Lock, CheckCircle as CheckCircle, AlertCircle as AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMe, completeProfile, changePassword } from '../../api/auth';

const ResidentProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    alternativeEmail: '',
  });
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const me = await getMe();
      setProfile({
        name: me.name || '',
        email: me.email || '',
        phone: me.phone || '',
        gender: me.gender || '',
        age: me.age?.toString() || '',
        alternativeEmail: me.alternativeEmail || '',
      });
    } catch {
      if (user) {
        setProfile(p => ({ ...p, name: user.name, email: user.email }));
      }
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    if (!profile.name.trim() || !profile.phone.trim()) {
      setProfileError('Name and phone are required');
      return;
    }
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
    if (passwordForm.newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwdError('Passwords do not match');
      return;
    }
    setSavingPwd(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPwdMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdMsg(''), 3000);
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="page-stack profile-page">
      <div className="page-header">
        <div className="profile-modal-header">
          <div className="profile-avatar-lg">{profile.name.charAt(0).toUpperCase() || '?'}</div>
          <div>
            <h2 className="page-title">My Profile</h2>
            <p className="page-subtitle">
              {user?.profileCompleted ? 'Update your personal information and password.' : 'Please complete your profile to continue.'}
            </p>
          </div>
        </div>
      </div>

      {!user?.profileCompleted && (
        <div className="alert-box alert-info">
          <AlertCircle size={16} />
          <span>Complete your profile with your full details. Email is already set by your Community Admin.</span>
        </div>
      )}

      <div className="profile-section-card">
        <div className="profile-section-header">
          <UserIcon size={20} />
          <h2 className="profile-section-title">Personal Information</h2>
        </div>

        {profileError && (
          <div className="alert-box alert-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} /> <span>{profileError}</span>
          </div>
        )}
        {profileMsg && (
          <div className="alert-box alert-success" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} /> <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="form-grid-2">
          <div>
            <label className="form-label">Full Name</label>
            <input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Your full name" />
          </div>
          <div>
            <label className="form-label">Email (pre-filled)</label>
            <input value={profile.email} disabled className="input-field input-disabled" />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <div className="input-wrap">
              <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field" style={{ paddingLeft: 36 }} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="form-label">Alternative Email <span className="form-section-title-muted">(optional)</span></label>
            <div className="input-wrap">
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input type="email" value={profile.alternativeEmail} onChange={(e) => setProfile(p => ({ ...p, alternativeEmail: e.target.value }))} className="input-field" style={{ paddingLeft: 36 }} placeholder="alt@example.com" />
            </div>
          </div>
          <div>
            <label className="form-label">Gender</label>
            <select value={profile.gender} onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))} className="input-field input-select">
              <option value="">Select...</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Age</label>
            <input type="number" value={profile.age} onChange={(e) => setProfile(p => ({ ...p, age: e.target.value }))} className="input-field" placeholder="25" min={1} max={120} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <span className="spinner-sm" /> : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>

      <div className="profile-section-card">
        <div className="profile-section-header">
          <Lock size={20} />
          <h2 className="profile-section-title">Change Password</h2>
        </div>

        {pwdError && (
          <div className="alert-box alert-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} /> <span>{pwdError}</span>
          </div>
        )}
        {pwdMsg && (
          <div className="alert-box alert-success" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} /> <span>{pwdMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="form-grid-2">
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} className="input-field" placeholder="Enter current password" />
          </div>
          <div />
          <div>
            <label className="form-label">New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} className="input-field" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} className="input-field" placeholder="Repeat new password" />
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

export default ResidentProfilePage;
