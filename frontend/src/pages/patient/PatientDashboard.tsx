import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Appointment } from '../../types';
import { TokenSlipModal } from '../../components/common/TokenSlipModal';
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
  CheckCircle
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lang, t, localizeDept, localizeHospital, localizeDoctor, localizeName, localizeRoom, localizeStatus, localizeTime } = useLanguage();
  const { success, error } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<Appointment | null>(null);

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

  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter((a) => a.appointmentDate >= todayStr && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');
  const past = appointments.filter((a) => a.appointmentDate < todayStr || a.status === 'COMPLETED' || a.status === 'CANCELLED');

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

        <div style={{ display: 'flex', gap: '10px' }}>
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
                  display: 'grid',
                  gridTemplateColumns: '80px 1.5fr 1fr auto',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                {/* Big Token Number */}
                <div style={{ textAlign: 'center', background: 'var(--blue-50)', padding: '10px', borderRadius: '8px', border: '1px solid var(--blue-100)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--blue-600)', fontWeight: 700 }}>{t.tokenBadge}</div>
                  <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--blue-600)', lineHeight: 1 }}>
                    #{String(app.tokenNumber).padStart(2, '0')}
                  </div>
                </div>

                {/* Doctor & Hospital Details */}
                <div>
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
                <div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedSlip(app)}>
                    <Printer size={14} />
                    {t.viewSlip}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(app.id)} style={{ color: 'var(--rose-600)' }}>
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
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSlip(app)}>
                        <Printer size={13} />
                        {t.slipBtn}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official OPD Token Slip Modal */}
      <TokenSlipModal appointment={selectedSlip} onClose={() => setSelectedSlip(null)} />
    </div>
  );
};
