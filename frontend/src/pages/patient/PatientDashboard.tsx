import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Appointment } from '../../types';
import { TokenSlipModal } from '../../components/common/TokenSlipModal';
import { EmergencyModal } from '../../components/common/EmergencyModal';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  PlusCircle,
  FileText,
  Printer,
  XCircle,
  AlertCircle,
  Activity,
  CheckCircle,
  RefreshCw,
  PhoneCall,
  CalendarCheck,
  RotateCcw,
  X
} from 'lucide-react';

const STANDARD_OPD_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM'
];

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lang, t, localizeDept, localizeHospital, localizeDoctor, localizeName, localizeRoom, localizeStatus, localizeTime } = useLanguage();
  const { success, error } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<Appointment | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  // Live Token Queue Tracking
  const [activeTokenLive, setActiveTokenLive] = useState<any>(null);
  const [loadingLiveToken, setLoadingLiveToken] = useState(false);

  // Reschedule State
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('09:30 AM');
  const [rescheduling, setRescheduling] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await apiClient.get('/patients/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const upcoming = appointments.filter((a) => a.appointmentDate >= todayStr && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
  const past = appointments.filter((a) => a.appointmentDate < todayStr || a.status === 'COMPLETED' || a.status === 'CANCELLED');

  const todayActiveApp = upcoming.find((a) => a.appointmentDate === todayStr);

  const fetchLiveTokenStatus = async (appId: string) => {
    setLoadingLiveToken(true);
    try {
      const res = await apiClient.get(`/patients/appointments/${appId}/token-status`);
      setActiveTokenLive(res.data);
    } catch (err) {
      console.error('Failed to fetch live token status:', err);
    } finally {
      setLoadingLiveToken(false);
    }
  };

  useEffect(() => {
    if (todayActiveApp) {
      fetchLiveTokenStatus(todayActiveApp.id);
      const timer = setInterval(() => {
        fetchLiveTokenStatus(todayActiveApp.id);
      }, 20000);
      return () => clearInterval(timer);
    } else {
      setActiveTokenLive(null);
    }
  }, [todayActiveApp?.id]);

  const handleCancel = async (id: string) => {
    if (!window.confirm(t.confirmCancelPrompt)) {
      return;
    }
    try {
      await apiClient.post(`/patients/appointments/${id}/cancel`);
      success(lang === 'te' ? 'అపాయింట్‌మెంట్ విజయవంతంగా రద్దు చేయబడింది. స్లాట్ విడుదల చేయబడింది.' : 'Appointment cancelled successfully. Slot freed.');
      fetchAppointments();
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'అపాయింట్‌మెంట్ రద్దు చేయడం విఫలమైంది.' : 'Failed to cancel appointment.'));
    }
  };

  const openRescheduleModal = (app: Appointment) => {
    setRescheduleTarget(app);
    setRescheduleDate(app.appointmentDate);
    setRescheduleSlot(app.slotTime || '09:30 AM');
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleDate || !rescheduleSlot) return;

    setRescheduling(true);
    try {
      await apiClient.post(`/patients/appointments/${rescheduleTarget.id}/reschedule`, {
        newDate: rescheduleDate,
        newSlotTime: rescheduleSlot
      });
      success(lang === 'te' ? 'అపాయింట్‌మెంట్ విజయవంతంగా పునఃషెడ్యూల్ చేయబడింది.' : 'Appointment rescheduled successfully.');
      setRescheduleTarget(null);
      fetchAppointments();
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'పునఃషెడ్యూల్ చేయడం విఫలమైంది.' : 'Failed to reschedule appointment.'));
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="main-content">
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">
            {lang === 'te' ? `నమస్కారం, ${localizeName(user?.fullName)}` : `${t.welcomeGreeting}, ${user?.fullName}`}
          </h1>
          <p className="section-subtitle">
            {t.patientPortalSub} +91 {user?.phone} · {user?.email}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEmergency(true)}
            style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
          >
            <PhoneCall size={14} />
            {t.emergencyHelpBtn || (lang === 'te' ? 'అత్యవసర సహాయం (108)' : 'Emergency Help (108)')}
          </button>
          <Link to="/patient/profile" className="btn btn-secondary btn-sm">
            <User size={15} />
            {t.myProfileAbha}
          </Link>
          <Link to="/patient/book" className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            {t.bookNew}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="med-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="stat-icon" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}><Calendar /></div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>{upcoming.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t.activeUpcomingVisits}</div>
          </div>
        </div>

        <div className="med-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="stat-icon" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-600)' }}><CheckCircle /></div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {appointments.filter((a) => a.status === 'COMPLETED').length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t.completedConsultations}</div>
          </div>
        </div>

        <div className="med-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="stat-icon" style={{ background: 'var(--slate-100)', color: 'var(--slate-600)' }}><Activity /></div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)' }}>{appointments.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t.totalOpdRecords}</div>
          </div>
        </div>
      </div>

      {/* Active OPD Token Live Status Card (When Today's Appointment Exists) */}
      {todayActiveApp && (
        <div
          className="med-card"
          style={{
            marginBottom: '28px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1.5px solid var(--blue-200)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--blue-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Activity size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {t.myActiveTokenTitle || (lang === 'te' ? 'నా నేటి ఓపీడీ టోకెన్ & లైవ్ క్యూ స్థితి' : 'My Active OPD Token & Live Queue Status')}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  {localizeDoctor(todayActiveApp.doctorNameEn, todayActiveApp.doctorNameTe)} · {localizeDept(todayActiveApp.department)} ({localizeRoom(todayActiveApp.roomNo)})
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchLiveTokenStatus(todayActiveApp.id)}
              disabled={loadingLiveToken}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              title="Refresh Queue"
            >
              <RefreshCw size={12} className={loadingLiveToken ? 'spin' : ''} />
              {loadingLiveToken ? 'Refreshing...' : (lang === 'te' ? 'క్యూ రిఫ్రెష్' : 'Refresh Queue')}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--blue-100)'
            }}
          >
            {/* My Token Number */}
            <div style={{ textAlign: 'center', borderRight: '1px solid var(--slate-100)', padding: '6px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                {t.tokenBadge}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--blue-600)', lineHeight: 1.1 }}>
                #{String(todayActiveApp.tokenNumber).padStart(2, '0')}
              </div>
              <span className={`status-pill status-${todayActiveApp.status.toLowerCase()}`} style={{ marginTop: '6px' }}>
                {localizeStatus(todayActiveApp.status)}
              </span>
            </div>

            {/* Now Serving */}
            <div style={{ textAlign: 'center', borderRight: '1px solid var(--slate-100)', padding: '6px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                {t.nowCalling || (lang === 'te' ? 'ప్రస్తుతం పిలుస్తున్న టోకెన్' : 'Now Calling')}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--emerald-600)', lineHeight: 1.1 }}>
                {activeTokenLive?.currentServingToken ? `#${String(activeTokenLive.currentServingToken).padStart(2, '0')}` : '---'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                {activeTokenLive?.currentServingToken ? (lang === 'te' ? 'డాక్టర్ క్యాబిన్‌లో' : 'In Consultation') : (lang === 'te' ? 'క్యూ ప్రారంభం కాలేదు' : 'Queue Not Started')}
              </div>
            </div>

            {/* Tokens Ahead */}
            <div style={{ textAlign: 'center', borderRight: '1px solid var(--slate-100)', padding: '6px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                {t.tokensAhead || (lang === 'te' ? 'ముందున్న టోకెన్లు' : 'Tokens Ahead')}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--navy-900)', lineHeight: 1.1 }}>
                {activeTokenLive ? activeTokenLive.tokensAhead : '---'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                {lang === 'te' ? 'రోగులు వేచి ఉన్నారు' : 'Patients waiting before you'}
              </div>
            </div>

            {/* Estimated Wait */}
            <div style={{ textAlign: 'center', padding: '6px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                {t.liveQueueEstimate || (lang === 'te' ? 'అంచనా వేచి ఉండే సమయం' : 'Estimated Wait Time')}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--amber-600)', lineHeight: 1.4 }}>
                {activeTokenLive?.estimatedWaitMinutes !== undefined ? `~${activeTokenLive.estimatedWaitMinutes}m` : '---'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                {lang === 'te' ? '*అంచనా మాత్రమే' : '*Dynamic Clinical Estimate'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Active Appointments */}
      <div className="med-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--blue-600)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {t.upcomingVisits}
            </h3>
          </div>
          <Link to="/patient/book" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {t.bookAnother}
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>{t.loadingAppointments}</p>
          </div>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--slate-50)', borderRadius: '10px' }}>
            <p style={{ color: 'var(--slate-600)', fontWeight: 600, fontSize: '0.95rem' }}>
              {t.noUpcomingAppointments}
            </p>
            <p style={{ color: 'var(--slate-400)', fontSize: '0.8rem', marginTop: '4px' }}>
              {t.needToVisitHospital}
            </p>
            <Link to="/patient/book" className="btn btn-primary btn-sm" style={{ marginTop: '14px' }}>
              {t.bookOpdAppointmentBtn}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {upcoming.map((app) => (
              <div
                key={app.id}
                style={{
                  border: '1px solid var(--slate-200)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                {/* Big Token Number */}
                <div style={{ textAlign: 'center', background: 'var(--blue-50)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--blue-100)', minWidth: '75px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--blue-600)', fontWeight: 700 }}>{t.tokenBadge}</div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--blue-600)', lineHeight: 1 }}>
                    #{String(app.tokenNumber).padStart(2, '0')}
                  </div>
                </div>

                {/* Doctor & Hospital Details */}
                <div style={{ flex: '1 1 200px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {localizeDoctor(app.doctorNameEn, app.doctorNameTe)}
                  </h4>
                  <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                    {localizeDept(app.department)} · {localizeRoom(app.roomNo)}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    {localizeHospital(app.hospitalNameEn, app.hospitalNameTe)}
                  </p>
                </div>

                {/* Date & Slot */}
                <div style={{ flex: '1 1 180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    <Calendar size={14} color="var(--slate-400)" />
                    {app.appointmentDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                    <Clock size={14} color="var(--slate-400)" />
                    {localizeTime(app.slotTime)} ({t.reportPrefix} {localizeTime(app.reportingTime)})
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`status-pill status-${app.status.toLowerCase()}`}>
                      {localizeStatus(app.status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minWidth: '150px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedSlip(app)} style={{ flex: '1 1 auto' }}>
                    <Printer size={14} />
                    {t.viewSlip}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openRescheduleModal(app)} style={{ flex: '1 1 auto' }}>
                    <CalendarCheck size={14} />
                    {t.rescheduleAppt || 'Reschedule'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(app.id)} style={{ color: 'var(--rose-600)', flex: '1 1 auto' }}>
                    <XCircle size={14} />
                    {t.cancelAppt}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Consultation History */}
      <div className="med-card">
        <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
          {t.pastVisits}
        </h3>

        {past.length === 0 ? (
          <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>{t.noPastVisits}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '8px 12px' }}>{t.colRefId}</th>
                  <th style={{ padding: '8px 12px' }}>{t.colDoctor}</th>
                  <th style={{ padding: '8px 12px' }}>{t.colDept}</th>
                  <th style={{ padding: '8px 12px' }}>{t.colDateTime}</th>
                  <th style={{ padding: '8px 12px' }}>{t.colStatusText}</th>
                  <th style={{ padding: '8px 12px' }}>{t.colActionText}</th>
                </tr>
              </thead>
              <tbody>
                {past.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--navy-900)' }}>{app.id}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {localizeDoctor(app.doctorNameEn, app.doctorNameTe)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{localizeDept(app.department)}</td>
                    <td style={{ padding: '10px 12px' }}>{app.appointmentDate} · {localizeTime(app.slotTime)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`status-pill status-${app.status.toLowerCase()}`}>{localizeStatus(app.status)}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSlip(app)} title={t.viewSlip}>
                          <Printer size={13} />
                          {t.slipBtn}
                        </button>
                        <Link
                          to={`/patient/book?doctor=${encodeURIComponent(app.doctorNameEn)}&hospitalId=${encodeURIComponent(app.hospitalId || 'GH_BHIMAVARAM')}&department=${encodeURIComponent(app.department || '')}`}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--blue-600)', background: 'var(--blue-50)', borderColor: 'var(--blue-200)' }}
                          title={t.bookAgain || 'Book Again'}
                        >
                          <RotateCcw size={13} />
                          {t.bookAgain || 'Book Again'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setRescheduleTarget(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--slate-200)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="var(--blue-600)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {t.rescheduleModalTitle || 'Reschedule Appointment'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.84rem' }}>
              <div><strong>{t.colDoctor}:</strong> {localizeDoctor(rescheduleTarget.doctorNameEn, rescheduleTarget.doctorNameTe)}</div>
              <div><strong>{lang === 'te' ? 'ప్రస్తుత స్లాట్:' : 'Current Slot:'}</strong> {rescheduleTarget.appointmentDate} · {localizeTime(rescheduleTarget.slotTime)}</div>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">{t.selectNewDate || 'Select New Date'} *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">{t.selectNewSlot || 'Select New Slot'} *</label>
                <select
                  className="form-select"
                  required
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                >
                  {STANDARD_OPD_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {localizeTime(slot)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRescheduleTarget(null)}
                >
                  {lang === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={rescheduling}
                >
                  {rescheduling ? (t.rescheduling || 'Rescheduling...') : (t.confirmReschedule || 'Confirm Reschedule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official OPD Token Slip Modal */}
      <TokenSlipModal appointment={selectedSlip} onClose={() => setSelectedSlip(null)} />

      {/* 24x7 Emergency Help Modal */}
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </div>
  );
};
