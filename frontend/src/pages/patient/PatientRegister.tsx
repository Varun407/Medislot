import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserPlus, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export const PatientRegister: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      error('Please complete all required fields.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      error('Please provide a valid 10-digit Indian mobile number.');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      error('Please accept the AP Public Health Privacy Policy & Terms.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/register', {
        fullName,
        email,
        phone: cleanPhone,
        password,
        confirmPassword
      });

      login(res.data.user, res.data.token);
      success('Patient account registered successfully!');
      navigate('/patient/dashboard');
    } catch (err: any) {
      error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="med-card" style={{ maxWidth: '500px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {lang === 'te' ? 'కొత్త రోగి రిజిస్ట్రేషన్' : 'Create Patient Account'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Sign up for digital OPD slots and official queue tokens
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. K. Sita Devi"
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
                placeholder="sita.devi@example.com"
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

          {/* Password Strength Meter */}
          {password && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', height: '5px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: passwordScore >= 1 ? 'var(--rose-500)' : 'var(--slate-200)' }} />
                <div style={{ flex: 1, background: passwordScore >= 2 ? 'var(--amber-500)' : 'var(--slate-200)' }} />
                <div style={{ flex: 1, background: passwordScore >= 3 ? 'var(--blue-500)' : 'var(--slate-200)' }} />
                <div style={{ flex: 1, background: passwordScore >= 4 ? 'var(--emerald-500)' : 'var(--slate-200)' }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px', textAlign: 'right' }}>
                {passwordScore <= 1 ? 'Weak' : passwordScore === 2 ? 'Moderate' : passwordScore === 3 ? 'Strong' : 'Very Strong'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '14px 0 20px' }}>
            <input
              type="checkbox"
              id="termsCheck"
              style={{ marginTop: '3px', cursor: 'pointer' }}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="termsCheck" style={{ fontSize: '0.8rem', color: 'var(--slate-600)', cursor: 'pointer', lineHeight: 1.4 }}>
              I agree to the Department of Health, Medical & Family Welfare Terms of Service and Privacy Policy.
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating Account...' : 'Complete Patient Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>Already have an account? </span>
          <Link to="/patient/login" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
