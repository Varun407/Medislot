import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Hospital, Department, Doctor, Appointment } from '../../types';
import { TokenSlipModal } from '../../components/common/TokenSlipModal';
import { Calendar, Clock, Building2, Stethoscope, ArrowRight, CheckCircle2, User } from 'lucide-react';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { lang, t, localizeDept, localizeQual, localizeRoom, localizeTime, localizeLanguages } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [hospitalId, setHospitalId] = useState(searchParams.get('hospitalId') || 'GH_BHIMAVARAM');
  const [department, setDepartment] = useState(searchParams.get('department') || 'all');
  const [selectedDoctorName, setSelectedDoctorName] = useState(searchParams.get('doctor') || '');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return searchParams.get('date') || new Date().toISOString().split('T')[0];
  });
  const [slotTime, setSlotTime] = useState('');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState('Female');
  const [abhaId, setAbhaId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Load hospitals & departments
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

  // Fetch doctors based on filters & selected date
  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      try {
        const params: Record<string, string> = { date: appointmentDate };
        if (hospitalId && hospitalId !== 'all') params.hospitalId = hospitalId;
        if (department && department !== 'all') params.department = department;

        const res = await apiClient.get('/public/doctors', { params });
        setDoctors(res.data);

        // If selectedDoctorName is not in the list, set default
        if (res.data.length > 0) {
          if (!selectedDoctorName || !res.data.some((d: Doctor) => d.nameEn === selectedDoctorName)) {
            setSelectedDoctorName(res.data[0].nameEn);
          }
        } else {
          setSelectedDoctorName('');
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, [hospitalId, department, appointmentDate]);

  // Find active selected doctor
  const activeDoctor = doctors.find((d) => d.nameEn === selectedDoctorName);

  // Set default slot
  useEffect(() => {
    if (activeDoctor && activeDoctor.availableSlots && activeDoctor.availableSlots.length > 0) {
      if (!activeDoctor.availableSlots.includes(slotTime)) {
        setSlotTime(activeDoctor.availableSlots[0]);
      }
    } else {
      setSlotTime('');
    }
  }, [activeDoctor]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorName || !appointmentDate || !slotTime) {
      error(lang === 'te' ? 'దయచేసి వైద్యుడిని, అపాయింట్‌మెంట్ తేదీని మరియు అందుబాటు స్లాట్‌ను ఎంచుకోండి.' : 'Please select a doctor, appointment date, and available time slot.');
      return;
    }

    setBookingInProgress(true);
    try {
      const res = await apiClient.post('/patients/appointments', {
        doctorNameEn: selectedDoctorName,
        hospitalId,
        appointmentDate,
        slotTime,
        patientAge: parseInt(patientAge, 10),
        patientGender,
        abhaId,
        symptoms
      });

      success(lang === 'te' ? 'ఓపీడీ అపాయింట్‌మెంట్ నిర్ధారించబడింది! మీ క్రమ సంఖ్య టోకెన్ జారీ చేయబడింది.' : 'OPD Appointment confirmed! Your sequential token is generated.');
      setConfirmedAppointment(res.data.appointment);
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'అపాయింట్‌మెంట్ స్లాట్ రిజర్వ్ చేయడం విఫలమైంది.' : 'Failed to reserve appointment slot.'));
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '900px' }}>
      <div className="section-header">
        <h1 className="section-title">
          {t.bookingTitle}
        </h1>
        <p className="section-subtitle">
          {t.bookingSubtitle}
        </p>
      </div>

      <div className="med-card" style={{ padding: '32px' }}>
        <form onSubmit={handleBooking}>
          {/* Step 1: Hospital and Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">{t.lblHospital} *</label>
              <select className="form-select" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {lang === 'te' ? h.nameTe : h.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.lblDept}</label>
              <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="all">{t.allDepts}</option>
                {departments.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.icon} {lang === 'te' ? d.nameTe : d.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Date & Doctor Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">{t.lblDate} *</label>
              <input
                type="date"
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.lblDoctor} *</label>
              <select
                className="form-select"
                value={selectedDoctorName}
                onChange={(e) => setSelectedDoctorName(e.target.value)}
                disabled={loading || doctors.length === 0}
              >
                {doctors.length === 0 ? (
                  <option value="">{t.noSpecialistsAvail}</option>
                ) : (
                  doctors.map((d) => (
                    <option key={d.id} value={d.nameEn}>
                      {lang === 'te' ? d.nameTe : d.nameEn} ({localizeDept(d.spec)} - {localizeQual(d.qual)})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Doctor Info Card */}
          {activeDoctor && (
            <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: '10px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ fontSize: '2.4rem' }}>{activeDoctor.emoji || '👨🏻‍⚕️'}</span>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {lang === 'te' ? activeDoctor.nameTe : activeDoctor.nameEn}
                </h4>
                <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                  {localizeDept(activeDoctor.spec)} · {localizeQual(activeDoctor.qual)} · {localizeRoom(activeDoctor.roomNo)}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {t.opdHours}: {localizeTime(activeDoctor.hours)} · {lang === 'te' ? 'భాషలు:' : 'Languages:'} {localizeLanguages(activeDoctor.languages)}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Available Time Slots */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">
              {t.lblSlot} ({appointmentDate}) *
            </label>
            {activeDoctor && activeDoctor.availableSlots && activeDoctor.availableSlots.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginTop: '8px' }}>
                {activeDoctor.availableSlots.map((slot) => {
                  const isSelected = slotTime === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSlotTime(slot)}
                      style={{
                        padding: '10px 8px',
                        border: isSelected ? '2px solid var(--blue-600)' : '1px solid var(--slate-300)',
                        background: isSelected ? 'var(--blue-600)' : '#ffffff',
                        color: isSelected ? '#ffffff' : 'var(--slate-800)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {localizeTime(slot)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '14px', background: 'var(--rose-100)', color: 'var(--rose-600)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                {t.allSlotsBookedPickAnother}
              </div>
            )}
          </div>

          {/* Step 4: Patient Details */}
          <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '20px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {t.patientConsultDetails}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t.patientAge}</label>
                <input
                  type="number"
                  min="0"
                  max="125"
                  className="form-input"
                  required
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.patientGender}</label>
                <select className="form-select" value={patientGender} onChange={(e) => setPatientGender(e.target.value)}>
                  <option value="Female">{t.genderFemale}</option>
                  <option value="Male">{t.genderMale}</option>
                  <option value="Other">{t.genderOther}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.arogyasriIdOptional}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="AP-XXXX-XXXX"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.lblSymptoms}</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder={t.symptomsPlaceholder}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={bookingInProgress || !slotTime}
            style={{ width: '100%' }}
          >
            <Calendar size={18} />
            {bookingInProgress ? t.confirmingBooking : t.confirmBookingIssueSlip}
          </button>
        </form>
      </div>

      {/* Confirmation & Slip Modal */}
      {confirmedAppointment && (
        <TokenSlipModal
          appointment={confirmedAppointment}
          onClose={() => {
            setConfirmedAppointment(null);
            navigate('/patient/dashboard');
          }}
        />
      )}
    </div>
  );
};
