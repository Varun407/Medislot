import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { DoctorQueueState, Appointment } from '../../types';
import { TokenSlipModal } from '../../components/common/TokenSlipModal';
import {
  Users,
  Megaphone,
  UserPlus,
  Clock,
  CheckCircle,
  Calendar,
  Settings,
  Printer,
  Activity,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { lang, t, localizeName, localizeDoctor, localizeDept, localizeRoom, localizeStatus, localizeGender, localizeTime } = useLanguage();

  const [queueState, setQueueState] = useState<DoctorQueueState | null>(null);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<Appointment | null>(null);

  // Walk-in modal state
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('9848099999');
  const [walkinAge, setWalkinAge] = useState('45');
  const [walkinGender, setWalkinGender] = useState('Male');
  const [walkinSymptoms, setWalkinSymptoms] = useState('');
  const [walkinLoading, setWalkinLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await apiClient.get('/doctors/queue');
      setQueueState(res.data);
    } catch (err) {
      console.error('Failed to fetch doctor queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh queue every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await apiClient.post('/doctors/queue/call-next', {});
      if (res.data.patient) {
        success(res.data.message || (lang === 'te' ? `టోకెన్ #${res.data.currentServingToken} పిలవబడింది.` : `Token #${res.data.currentServingToken} called.`));
      } else {
        success(lang === 'te' ? 'నేటి క్యూలో వేచి ఉన్న రోగులు లేరు.' : "No more waiting patients in today's queue.");
      }
      fetchQueue();
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'క్యూ ముందుకు జరపడం విఫలమైంది.' : 'Failed to advance queue.'));
    } finally {
      setCallingNext(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await apiClient.put(`/doctors/appointments/${appointmentId}/status`, { status: newStatus });
      success(lang === 'te' ? `రోగి స్థితి ${localizeStatus(newStatus)} కు నవీకరించబడింది.` : `Patient status updated to ${newStatus}.`);
      fetchQueue();
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'స్థితిని నవీకరించడం విఫలమైంది.' : 'Failed to update status.'));
    }
  };

  const handleIssueWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinLoading(true);
    try {
      const res = await apiClient.post('/doctors/queue/walkin', {
        patientName: walkinName,
        patientPhone: walkinPhone,
        patientAge: walkinAge,
        patientGender: walkinGender,
        symptoms: walkinSymptoms
      });

      success(res.data.message || (lang === 'te' ? 'వాక్-ఇన్ టోకెన్ విజయవంతంగా జారీ చేయబడింది.' : 'Walk-in token generated successfully.'));
      setIsWalkinOpen(false);
      setWalkinName('');
      setWalkinSymptoms('');
      fetchQueue();

      // Show slip modal for counter patient
      if (res.data.appointment) {
        setSelectedSlip(res.data.appointment);
      }
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'వాక్-ఇన్ టోకెన్ జారీ చేయడం విఫలమైంది.' : 'Failed to generate walk-in token.'));
    } finally {
      setWalkinLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 className="section-title">
            {t.doctorLiveQueueTitle}
          </h1>
          <p className="section-subtitle">
            {t.physicianLabel} <strong>{localizeDoctor(user?.fullName)}</strong> · {t.deptLabel} {localizeDept(user?.profile && (user.profile as any).specialization)} · {t.roomLabel} {localizeRoom((user?.profile as any)?.roomNo || 'Room 102')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsWalkinOpen(true)}>
            <UserPlus size={15} />
            {t.btnWalkin}
          </button>
          <Link to="/doctor/availability" className="btn btn-secondary btn-sm">
            <Settings size={15} />
            {t.manageAvailability}
          </Link>
          <button className="btn btn-primary btn-sm" onClick={handleCallNext} disabled={callingNext}>
            <Megaphone size={15} />
            {callingNext ? t.callingNextPatient : t.btnCallNext}
          </button>
        </div>
      </div>

      {/* Queue Metrics Banner */}
      <div className="queue-metrics-grid">
        <div className="queue-metric-card serving">
          <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <Activity />
          </div>
          <div>
            <div className="queue-val">
              #{String(queueState?.currentServingToken || 0).padStart(2, '0')}
            </div>
            <div className="queue-lbl">{t.metricCurrentToken}</div>
          </div>
        </div>

        <div className="queue-metric-card">
          <div className="stat-icon" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
            <Clock />
          </div>
          <div>
            <div className="queue-val" style={{ color: 'var(--amber-600)' }}>
              {queueState?.waitingCount || 0}
            </div>
            <div className="queue-lbl">{t.metricWaiting}</div>
          </div>
        </div>

        <div className="queue-metric-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
            <Users />
          </div>
          <div>
            <div className="queue-val" style={{ color: '#6d28d9' }}>
              {queueState?.inConsultationCount || 0}
            </div>
            <div className="queue-lbl">{t.metricInConsult}</div>
          </div>
        </div>

        <div className="queue-metric-card">
          <div className="stat-icon" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-600)' }}>
            <CheckCircle />
          </div>
          <div>
            <div className="queue-val" style={{ color: 'var(--emerald-600)' }}>
              {queueState?.completedCount || 0}
            </div>
            <div className="queue-lbl">{t.metricDone}</div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="med-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {t.todaysQueueTitle} ({queueState?.appointmentDate})
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            {t.autoRefreshing} {queueState?.totalPatients || 0} {t.patientsCount}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{t.loadingOpdQueue}</p>
          </div>
        ) : !queueState?.patients || queueState.patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--slate-50)', borderRadius: '10px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--slate-600)' }}>
              {t.noPatientsInQueue}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)', marginTop: '4px' }}>
              {t.walkinNotice}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 12px' }}>{t.colToken}</th>
                  <th style={{ padding: '10px 12px' }}>{t.colPatient}</th>
                  <th style={{ padding: '10px 12px' }}>{t.colAgeGender}</th>
                  <th style={{ padding: '10px 12px' }}>{t.colSlot}</th>
                  <th style={{ padding: '10px 12px' }}>{t.colSymptoms}</th>
                  <th style={{ padding: '10px 12px' }}>{t.colStatus}</th>
                  <th style={{ padding: '10px 12px' }}>{t.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {queueState.patients.map((p) => {
                  const isCurrentlyServing = p.tokenNumber === queueState.currentServingToken && p.status !== 'COMPLETED';
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--slate-100)',
                        backgroundColor: isCurrentlyServing ? 'var(--blue-50)' : 'transparent',
                        fontWeight: isCurrentlyServing ? 600 : 'normal'
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--blue-600)' }}>
                          #{String(p.tokenNumber).padStart(2, '0')}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{localizeName(p.patientName)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>+91 {p.patientPhone} · {p.id}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {p.patientAge || '32'} {t.ageYrs} · {localizeGender(p.patientGender)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{localizeTime(p.slotTime)}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{t.repShort} {localizeTime(p.reportingTime)}</div>
                      </td>
                      <td style={{ padding: '12px', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--slate-600)' }}>
                          {p.symptoms || (lang === 'te' ? 'సాధారణ సంప్రదింపు' : 'General OPD')}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-pill status-${p.status.toLowerCase()}`}>
                          {localizeStatus(p.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <select
                            style={{ padding: '4px 8px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--slate-300)' }}
                            value={p.status}
                            onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                          >
                            <option value="CONFIRMED">{localizeStatus('CONFIRMED')}</option>
                            <option value="CALLED">{localizeStatus('CALLED')}</option>
                            <option value="IN_CONSULTATION">{localizeStatus('IN_CONSULTATION')}</option>
                            <option value="COMPLETED">{localizeStatus('COMPLETED')}</option>
                            <option value="NO_SHOW">{localizeStatus('NO_SHOW')}</option>
                            <option value="CANCELLED">{localizeStatus('CANCELLED')}</option>
                          </select>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px' }}
                            onClick={() => setSelectedSlip(p)}
                            title={t.printTokenSlip}
                          >
                            <Printer size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Counter Walk-in Modal */}
      {isWalkinOpen && (
        <div className="modal-overlay" onClick={() => setIsWalkinOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{t.issueWalkinTitle}</h3>
              <button className="toast-close" onClick={() => setIsWalkinOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleIssueWalkin}>
                <div className="form-group">
                  <label className="form-label">{t.patientFullNameReq}</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder={lang === 'te' ? 'ఉదా: వరుణ్ కుమార్' : 'Patient Name'}
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                  />
                  {walkinName.trim() && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--blue-600)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} />
                      <span>{t.autoTeluguPreview} <strong>{localizeName(walkinName)}</strong></span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">{t.contactPhoneOptional}</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.ageYearsOptional}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={walkinAge}
                      onChange={(e) => setWalkinAge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.genderLabel}</label>
                  <select className="form-select" value={walkinGender} onChange={(e) => setWalkinGender(e.target.value)}>
                    <option value="Male">{t.genderMale}</option>
                    <option value="Female">{t.genderFemale}</option>
                    <option value="Other">{t.genderOther}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.symptomsComplaint}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={lang === 'te' ? 'ఉదా: జ్వరం, తీవ్రమైన దగ్గు' : 'e.g. fever, acute cough, trauma'}
                    value={walkinSymptoms}
                    onChange={(e) => setWalkinSymptoms(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={walkinLoading} style={{ width: '100%', marginTop: '10px' }}>
                  {walkinLoading ? t.generatingToken : t.generatePrintWalkin}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      <TokenSlipModal appointment={selectedSlip} onClose={() => setSelectedSlip(null)} />
    </div>
  );
};
