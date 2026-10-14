import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FileText, Send, CheckCircle2, ShieldAlert, LogIn, UserPlus, CheckCircle } from 'lucide-react';

export const Grievances: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { lang, t, localizeHospital, localizeName } = useLanguage();
  const { success, error } = useToast();

  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [hospitalName, setHospitalName] = useState('Government District Hospital, Bhimavaram');
  const [category, setCategory] = useState('OPD Waiting Time');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Auto-populate verified user credentials when authenticated
  useEffect(() => {
    if (user) {
      if (user.fullName) setCitizenName(user.fullName);
      if (user.phone) setCitizenPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !citizenPhone.trim() || !message.trim()) {
      error(t.pleaseCompleteFields);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/public/grievances', {
        citizenName,
        citizenPhone,
        hospitalName,
        category,
        message
      });
      setSubmittedId(res.data.grievanceId);
      success(res.data.message || t.grievanceSubmitSuccess);
      setMessage('');
    } catch (err: any) {
      error(err.response?.data?.error || t.grievanceSubmitFail);
    } finally {
      setLoading(false);
    }
  };

  const hospitalOptions = [
    'Government District Hospital, Bhimavaram',
    'Area Hospital, Palakollu',
    'Government General Hospital (GGH), Eluru',
    'Rangaraya Government General Hospital, Kakinada'
  ];

  const categoryOptions = [
    { value: 'OPD Waiting Time', label: t.catOpdWaiting },
    { value: 'Medicine Availability', label: t.catMedicineAvail },
    { value: 'Hospital Sanitation', label: t.catSanitation },
    { value: 'Doctor Availability', label: t.catDoctorAvail },
    { value: 'Diagnostics & Lab', label: t.catDiagnosticsLab },
    { value: 'Other Suggestion', label: t.catOtherSuggestion }
  ];

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div className="section-header">
        <h1 className="section-title">
          {t.grievanceTitle}
        </h1>
        <p className="section-subtitle">
          {t.grievanceSubtitle}
        </p>
      </div>

      {/* Access Gate: Block Unauthenticated Visitors from Lodging Grievances */}
      {!isAuthenticated ? (
        <div className="med-card" style={{ padding: '40px 28px', textAlign: 'center', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldAlert size={34} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>
            {t.grievanceAccountRequiredTitle}
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
            {t.grievanceAccountRequiredDesc}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ minWidth: '180px' }}>
              <LogIn size={16} />
              {t.grievanceSignInPrompt}
            </Link>
            <Link to="/patient/register" className="btn btn-outline" style={{ minWidth: '180px' }}>
              <UserPlus size={16} />
              {t.grievanceRegisterPrompt}
            </Link>
          </div>
        </div>
      ) : submittedId ? (
        <div className="med-card" style={{ textAlign: 'center', padding: '40px 20px', border: '2px solid var(--emerald-600)' }}>
          <CheckCircle2 size={48} color="var(--emerald-600)" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {t.grievanceSuccessTitle}
          </h2>
          <p style={{ color: 'var(--slate-600)', margin: '8px 0 20px', lineHeight: 1.6 }}>
            {t.grievanceSuccessDesc}
          </p>
          <div style={{ background: 'var(--blue-50)', padding: '14px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--blue-100)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t.trackingRefId}</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--blue-600)', letterSpacing: '1px', marginTop: '4px' }}>
              {submittedId}
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSubmittedId(null)}>
              {t.submitAnotherGrievance}
            </button>
          </div>
        </div>
      ) : (
        <div className="med-card">
          {/* Verified Citizen Badge */}
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '12px 16px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--slate-700)' }}>
              <CheckCircle size={16} color="var(--emerald-600)" />
              <span>
                <strong>{t.grievanceLoggedInAs}</strong> {localizeName(user?.fullName)} ({user?.email})
              </span>
            </div>
            <span className="status-pill status-verified" style={{ fontSize: '0.72rem' }}>
              {t.statusActive}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{t.fullName}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={t.fullNamePlaceholder}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.mobile10Digits}</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder="98480XXXXX"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.hospitalFacility}</label>
              <select className="form-select" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}>
                {hospitalOptions.map((hosp) => (
                  <option key={hosp} value={hosp}>
                    {localizeHospital(hosp)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.categoryLabel}</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.detailedFeedback}</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder={t.detailedFeedbackPlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '14px' }}>
              {t.grievanceSubmitNotice}
            </p>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              <Send size={16} />
              {loading ? t.submittingGrievance : t.submitGrievanceBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
