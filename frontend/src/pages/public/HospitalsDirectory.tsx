import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Hospital } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Building2, BedDouble, Phone, Clock, ArrowRight, Activity, MapPin } from 'lucide-react';

export const HospitalsDirectory: React.FC = () => {
  const { lang, t } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await apiClient.get('/public/hospitals');
        setHospitals(res.data);
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHospitals();
  }, []);

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title">
          {t.hospitalsTitle}
        </h1>
        <p className="section-subtitle">
          {t.hospitalsSubtitle}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--slate-500)' }}>{t.loadingHospitals}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="med-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span className="status-pill status-verified" style={{ fontSize: '0.72rem', marginBottom: '6px' }}>
                    {lang === 'te' ? hosp.typeTe : hosp.typeEn}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '4px' }}>
                    {lang === 'te' ? hosp.nameTe : hosp.nameEn}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-500)', fontSize: '0.82rem', marginTop: '4px' }}>
                    <MapPin size={13} />
                    <span>{lang === 'te' ? hosp.districtTe : hosp.districtEn} {t.districtSuffix}</span>
                  </div>
                </div>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
                  ★ {hosp.rating}
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '8px 0 16px', lineHeight: 1.5 }}>
                {lang === 'te' ? hosp.addressTe : hosp.addressEn}
              </p>

              {/* Bed Counters Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--slate-50)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
                    {hosp.availableBeds}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    {t.generalBeds}
                  </div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--slate-200)', borderRight: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-600)' }}>
                    {hosp.icuBedsAvailable}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    {t.icuBeds}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                    {hosp.oxygenBedsAvailable}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    {t.oxygenBeds}
                  </div>
                </div>
              </div>

              {/* Timings and Emergency */}
              <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color="var(--slate-400)" />
                  <span>{t.opdTimings}: {lang === 'te' ? hosp.opdTimingsTe : hosp.opdTimingsEn}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} color="var(--rose-600)" />
                  <span style={{ color: 'var(--rose-600)', fontWeight: 600 }}>{t.emergency}: {hosp.emergencyPhone}</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Link
                  to={`/doctors?hospitalId=${encodeURIComponent(hosp.id)}`}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <Activity size={15} />
                  {t.bookOpdAtHospital}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
