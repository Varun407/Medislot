import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, Save, ShieldCheck } from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Female');
  const [abhaId, setAbhaId] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get('/patients/me');
        if (res.data && res.data.profile) {
          const p = res.data.profile;
          if (p.fullName) setFullName(p.fullName);
          if (p.phone) setPhone(p.phone);
          if (p.age) setAge(String(p.age));
          if (p.gender) setGender(p.gender);
          if (p.abhaId) setAbhaId(p.abhaId);
          if (p.address) setAddress(p.address);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch('/patients/me', {
        fullName,
        phone,
        age: age ? parseInt(age, 10) : undefined,
        gender,
        abhaId,
        address
      });
      await refreshUser();
      success('Patient profile updated successfully.');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '680px' }}>
      <div className="section-header">
        <h1 className="section-title">Patient Profile & Health ID</h1>
        <p className="section-subtitle">
          Manage your personal details, ABHA identification, and contact information.
        </p>
      </div>

      <div className="med-card" style={{ padding: '30px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email (Account Primary)</label>
              <input
                type="email"
                className="form-input"
                disabled
                value={user?.email || ''}
                style={{ background: 'var(--slate-100)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                min="0"
                max="125"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Arogyasri ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AP-XXXX-XXXX or Arogyasri Card Number"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Door No, Street, Village/Town, District"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            <Save size={16} />
            {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
