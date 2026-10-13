import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Hospital, Department } from '../../types';
import { Stethoscope, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const DoctorRegister: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [hospitalId, setHospitalId] = useState('GH_BHIMAVARAM');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [hospRes, deptRes] = await Promise.all([
          apiClient.get('/public/hospitals'),
          apiClient.get('/public/departments')
        ]);
        setHospitals(hospRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !phone.trim() || !qualifications.trim() || !password) {
      error('Please fill in all required credentials.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      error('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/doctor/register', {
        fullName,
        email,
        phone: cleanPhone,
        specialization,
        qualifications,
        experienceYears: parseInt(experienceYears, 10),
        hospitalId,
        password,
        confirmPassword
      });

      success(res.data.message || 'Doctor application submitted. Account pending approval.');
      navigate('/doctor/login');
    } catch (err: any) {
      error(err.response?.data?.error || 'Doctor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="med-card" style={{ maxWidth: '600px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Stethoscope size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Doctor Clinical Portal Registration
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Join the Andhra Pradesh Government OPD Consultation System
          </p>
        </div>

        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.82rem', color: '#92400e' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Notice on Doctor Verification:</strong> Doctor accounts are created with a <em>Pending Verification</em> status by default. The platform administrator will verify your medical license before you can appear as an active bookable provider.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Doctor Full Name (with Title) *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Dr. K. Venkata Rao"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="dr.name@medislot.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                className="form-input"
                required
                placeholder="98480XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Medical Specialization *</label>
              <select className="form-select" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                {departments.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.key}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of Clinical Experience *</label>
              <input
                type="number"
                min="0"
                max="60"
                className="form-input"
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Medical Qualifications *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. MBBS, MD (General Medicine), DCH"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Hospital Facility *</label>
            <select className="form-select" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nameEn} ({h.districtEn})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="At least 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Submitting Application...' : 'Submit Doctor Application'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>Already registered? </span>
          <Link to="/doctor/login" style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
