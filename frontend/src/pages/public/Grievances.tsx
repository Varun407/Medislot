import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FileText, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Grievances: React.FC = () => {
  const { lang } = useLanguage();
  const { success, error } = useToast();

  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [hospitalName, setHospitalName] = useState('Government District Hospital, Bhimavaram');
  const [category, setCategory] = useState('OPD Waiting Time');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !citizenPhone.trim() || !message.trim()) {
      error('Please complete all required fields.');
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
      success(res.data.message || 'Grievance submitted successfully.');
      setMessage('');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to submit grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div className="section-header">
        <h1 className="section-title">
          {lang === 'te' ? 'పౌర సమస్యలు & స్పందన ఫిర్యాదుల విభాగం' : 'Citizen Grievance & Feedback Redressal'}
        </h1>
        <p className="section-subtitle">
          {lang === 'te'
            ? 'ప్రభుత్వ ఆసుపత్రి సేవల నాణ్యత, మందుల లభ్యత మరియు వేచి ఉండే సమయంపై మీ అభిప్రాయాన్ని నమోదు చేయండి'
            : 'Official Andhra Pradesh healthcare feedback portal for prompt resolution and oversight'}
        </p>
      </div>

      {submittedId ? (
        <div className="med-card" style={{ textAlign: 'center', padding: '40px 20px', border: '2px solid var(--emerald-600)' }}>
          <CheckCircle2 size={48} color="var(--emerald-600)" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Grievance Lodged Successfully
          </h2>
          <p style={{ color: 'var(--slate-600)', margin: '8px 0 20px' }}>
            Your feedback has been routed to the District Medical & Health Officer (DMHO) oversight desk.
          </p>
          <div style={{ background: 'var(--blue-50)', padding: '14px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--blue-100)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Tracking Reference ID:</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--blue-600)', letterSpacing: '1px' }}>
              {submittedId}
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSubmittedId(null)}>
              Submit Another Grievance
            </button>
          </div>
        </div>
      ) : (
        <div className="med-card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Citizen full name"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number (10 Digits) *</label>
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
              <label className="form-label">Hospital Facility</label>
              <select className="form-select" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}>
                <option value="Government District Hospital, Bhimavaram">Government District Hospital, Bhimavaram</option>
                <option value="Area Hospital, Palakollu">Area Hospital, Palakollu</option>
                <option value="Government General Hospital (GGH), Eluru">Government General Hospital (GGH), Eluru</option>
                <option value="Rangaraya Government General Hospital, Kakinada">Rangaraya Government General Hospital, Kakinada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="OPD Waiting Time">OPD Waiting Time & Queue Management</option>
                <option value="Medicine Availability">Pharmacy / Free Medicine Availability</option>
                <option value="Hospital Sanitation">Cleanliness & Sanitation</option>
                <option value="Doctor Availability">Doctor / Specialist Availability</option>
                <option value="Diagnostics & Lab">Free Lab / Diagnostic Equipment</option>
                <option value="Other Suggestion">Other Suggestions</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Feedback / Issue *</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder="Please describe your experience or grievance in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '6px' }}>
              <Send size={16} />
              {loading ? 'Submitting Grievance...' : 'Submit Grievance to DMHO'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
