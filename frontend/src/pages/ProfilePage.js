import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const PLATFORMS = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];
const TONES = ['professional', 'casual', 'humorous', 'inspirational', 'educational'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    brandName: user?.profile?.brandName || '',
    brandDescription: user?.profile?.brandDescription || '',
    niche: user?.profile?.niche || '',
    toneOfVoice: user?.profile?.toneOfVoice || '',
    preferredPlatforms: user?.profile?.preferredPlatforms || [],
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const togglePlatform = (p) => {
    const cur = profileForm.preferredPlatforms;
    setProfileForm({ ...profileForm, preferredPlatforms: cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p] });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await axios.put('/api/profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match!');
    setSavingPw(true);
    try {
      await axios.put('/api/profile/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SP';

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div className="page-header">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Account
          </div>
          <h1>Profile Settings</h1>
          <p>Manage your account and brand details.</p>
        </div>

        {/* Avatar row */}
        <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, background: 'var(--gradient-purple)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', boxShadow: '0 0 24px rgba(139,92,246,0.4)', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left: Profile */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
              Brand Profile
            </div>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input value={user?.email} disabled style={{ opacity: 0.4, cursor: 'not-allowed' }} />
              </div>
              <div className="divider" />
              <div className="form-group">
                <label>Brand Name</label>
                <input placeholder="Your brand name" value={profileForm.brandName} onChange={e => setProfileForm({ ...profileForm, brandName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Niche / Industry</label>
                <input placeholder="e.g. Fashion, Tech, Food" value={profileForm.niche} onChange={e => setProfileForm({ ...profileForm, niche: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Brand Description</label>
                <textarea placeholder="Describe your brand..." value={profileForm.brandDescription} onChange={e => setProfileForm({ ...profileForm, brandDescription: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Default Tone</label>
                <select value={profileForm.toneOfVoice} onChange={e => setProfileForm({ ...profileForm, toneOfVoice: e.target.value })}>
                  <option value="">Select tone...</option>
                  {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Preferred Platforms</label>
                <div className="chips-row" style={{ marginTop: 10 }}>
                  {PLATFORMS.map(p => (
                    <button key={p} type="button" className={`chip ${profileForm.preferredPlatforms.includes(p) ? 'selected' : ''}`} onClick={() => togglePlatform(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : '💾 Save Profile'}
              </button>
            </form>
          </div>

          {/* Right: Password */}
          <div>
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                Security
              </div>
              <form onSubmit={changePassword}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Your current password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Repeat new password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingPw}>
                  {savingPw ? 'Changing...' : '🔒 Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
