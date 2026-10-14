import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Doctor, Department, Hospital } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Filter, Calendar, Building2, Clock, CheckCircle } from 'lucide-react';

export const DoctorsDirectory: React.FC = () => {
  const { lang, t, localizeDept, localizeQual, localizeRoom, localizeTime, localizeHospital } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const initialDept = searchParams.get('department') || 'all';
  const initialHosp = searchParams.get('hospitalId') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [department, setDepartment] = useState<string>(initialDept);
  const [hospitalId, setHospitalId] = useState<string>(initialHosp);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [date, setDate] = useState<string>(initialDate);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const [deptRes, hospRes] = await Promise.all([
          apiClient.get('/public/departments'),
          apiClient.get('/public/hospitals')
        ]);
        setDepartments(deptRes.data);
        setHospitals(hospRes.data);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    fetchFilters();
  }, []);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const params: Record<string, string> = { date };
        if (department !== 'all') params.department = department;
        if (hospitalId !== 'all') params.hospitalId = hospitalId;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await apiClient.get('/public/doctors', { params });
        setDoctors(res.data);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [department, hospitalId, searchTerm, date]);

  const handleClearFilters = () => {
    setDepartment('all');
    setHospitalId('all');
    setSearchTerm('');
    setDate(new Date().toISOString().split('T')[0]);
    setSearchParams({});
  };

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title">
          {t.directoryTitle}
        </h1>
        <p className="section-subtitle">
          {t.directorySubtitle}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="med-card" style={{ marginBottom: '28px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.searchNameRole}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t.searchNamePlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.clinicalSpecialty}</label>
            <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="all">{t.allDepts}</option>
              {departments.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.icon} {lang === 'te' ? d.nameTe : d.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.hospitalFacility}</label>
            <select className="form-select" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}>
              <option value="all">{t.allHospitals}</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {lang === 'te' ? h.nameTe : h.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t.consultationDate}</label>
            <input
              type="date"
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <button className="btn btn-secondary" onClick={handleClearFilters} style={{ width: '100%' }}>
              <Filter size={14} />
              {t.clearFilters}
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--slate-500)' }}>{t.loadingDoctors}</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="med-card" style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--slate-600)', fontWeight: 600 }}>
            {t.noDoctorsMatched}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginTop: '4px' }}>
            {t.noDoctorsMatchedDesc}
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleClearFilters} style={{ marginTop: '16px' }}>
            {t.resetFilters}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="med-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '2.8rem' }}>{doc.emoji || '👨🏻‍⚕️'}</span>
                <div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    {lang === 'te' ? doc.nameTe : doc.nameEn}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--blue-600)', fontWeight: 600, margin: '2px 0' }}>
                    {localizeQual(doc.qual)}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span className="status-pill status-verified">{localizeDept(doc.spec)}</span>
                    <span className="status-pill status-completed">{doc.experienceYrs} {t.expYears}</span>
                  </div>
                </div>
              </div>

              <div style={{ margin: '14px 0', fontSize: '0.83rem', color: 'var(--slate-600)', background: 'var(--slate-50)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Building2 size={14} color="var(--blue-600)" />
                  <span>{hospitals.find(h => h.id === doc.hospitalId) ? (lang === 'te' ? hospitals.find(h => h.id === doc.hospitalId)!.nameTe : hospitals.find(h => h.id === doc.hospitalId)!.nameEn) : localizeHospital(doc.hospitalId)} · {localizeRoom(doc.roomNo)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="var(--emerald-600)" />
                  <span>{t.opdHours}: {localizeTime(doc.hours)}</span>
                </div>
              </div>

              {/* Slot Availability Counter */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {t.availableSlotsCount} ({date}): {doc.availableSlots?.length || 0}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {doc.availableSlots && doc.availableSlots.length > 0 ? (
                    doc.availableSlots.slice(0, 5).map((s) => (
                      <span key={s} style={{ background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-100)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 600 }}>
                        {localizeTime(s)}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--rose-600)', fontSize: '0.8rem', fontWeight: 600 }}>
                      {t.allSlotsBookedDate}
                    </span>
                  )}
                  {doc.availableSlots && doc.availableSlots.length > 5 && (
                    <span style={{ fontSize: '0.76rem', color: 'var(--slate-500)', alignSelf: 'center' }}>
                      +{doc.availableSlots.length - 5} {t.moreSlots}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <Link
                  to={`/patient/book?doctor=${encodeURIComponent(doc.nameEn)}&hospitalId=${encodeURIComponent(doc.hospitalId)}&date=${date}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Calendar size={15} />
                  {t.bookOpdAppointment}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
