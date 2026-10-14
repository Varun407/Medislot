import React, { useState, useEffect } from 'react';
import { PhoneCall, AlertTriangle, X, ShieldAlert, HeartPulse, ExternalLink } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';

interface EmergencyData {
  jurisdiction: string;
  disclaimer: string;
  tollFreeNumbers: Array<{
    service: string;
    number: string;
    desc: string;
  }>;
  districtCasualtyDesks: Array<{
    hospital: string;
    phone: string;
    location: string;
  }>;
}

const FALLBACK_EMERGENCY: EmergencyData = {
  jurisdiction: 'Andhra Pradesh (AP), India',
  disclaimer: 'Emergency helplines are for acute medical emergencies, trauma, and accidents. Do NOT use regular OPD booking during life-threatening conditions.',
  tollFreeNumbers: [
    { service: 'Ambulance Emergency', number: '108', desc: '24x7 Free Emergency Medical Service & Accident Response' },
    { service: 'Health Advice & Tele-Consultation', number: '104', desc: 'AP Health Information Helpline' },
    { service: 'Mother & Child Tracking (Janani Suraksha)', number: '102', desc: 'Free Transport for Pregnant Women & Infants' },
    { service: 'National Emergency Number', number: '112', desc: 'Single Emergency Response Number (Police, Fire, Ambulance)' },
    { service: 'Women Helpline', number: '181', desc: 'AP Women in Distress & Crisis Intervention' }
  ],
  districtCasualtyDesks: [
    { hospital: 'Government District Hospital, Bhimavaram', phone: '08816-223344', location: 'West Godavari' },
    { hospital: 'Government General Hospital (GGH), Eluru', phone: '08812-230111', location: 'Eluru District' },
    { hospital: 'Rangaraya Government General Hospital, Kakinada', phone: '0884-2376108', location: 'Kakinada District' }
  ]
};

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<EmergencyData>(FALLBACK_EMERGENCY);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    apiClient
      .get('/public/emergency')
      .then((res) => {
        if (isMounted && res.data) {
          const tollFree = res.data.primaryHotlines
            ? res.data.primaryHotlines.map((h: any) => ({
                service: lang === 'te' && h.labelTe ? h.labelTe : h.labelEn,
                number: h.number,
                desc: h.description
              }))
            : (res.data.tollFreeNumbers || FALLBACK_EMERGENCY.tollFreeNumbers);

          const desks = res.data.hospitalEmergencyDesks
            ? res.data.hospitalEmergencyDesks.map((d: any) => ({
                hospital: lang === 'te' && d.hospitalNameTe ? d.hospitalNameTe : d.hospitalNameEn,
                phone: d.emergencyPhone || d.phone,
                location: d.district || ''
              }))
            : (res.data.districtCasualtyDesks || FALLBACK_EMERGENCY.districtCasualtyDesks);

          setData({
            jurisdiction: res.data.jurisdiction || 'Andhra Pradesh (AP), India',
            disclaimer: res.data.disclaimer || FALLBACK_EMERGENCY.disclaimer,
            tollFreeNumbers: tollFree,
            districtCasualtyDesks: desks
          });
        }
      })
      .catch(() => {
        // Fallback already pre-set
      });
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--slate-200)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
            color: '#ffffff',
            padding: '20px 24px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HeartPulse size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {lang === 'te' ? 'ఏపీ అత్యవసర & హెల్ప్‌లైన్ డెస్క్ (24x7)' : 'AP Emergency & Helpline Desk (24x7)'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                {data.jurisdiction} · {lang === 'te' ? 'ఉచిత సేవలు' : 'Toll-Free Services'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Disclaimer Banner */}
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              marginBottom: '20px'
            }}
          >
            <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.4 }}>
              <strong>{lang === 'te' ? 'అత్యవసర హెచ్చరిక: ' : 'Urgent Notice: '}</strong>
              {lang === 'te'
                ? 'తీవ్రమైన ప్రమాదాలు, గుండెపోటు, శ్వాస సంబంధిత అత్యవసరాలు మరియు అత్యవసర వైద్య పరిస్థితికి క్రింది నంబర్లకు వెంటనే కాల్ చేయండి. సాధారణ సంప్రదింపులకు మాత్రమే ఓపీడీ టోకెన్ ఉపయోగించండి.'
                : data.disclaimer}
            </div>
          </div>

          {/* Quick Call Emergency Numbers */}
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'te' ? 'జాతీయ & రాష్ట్ర అత్యవసర హెల్ప్‌లైన్లు' : 'Toll-Free Emergency Numbers'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
              {data.tollFreeNumbers.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: idx === 0 ? '#fff1f2' : 'var(--slate-50)',
                    borderColor: idx === 0 ? '#fecdd3' : 'var(--slate-200)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {item.service}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: idx === 0 ? '#e11d48' : 'var(--blue-600)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <PhoneCall size={14} />
                    {item.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* District Hospital Casualty Desks */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'te' ? 'జిల్లా ప్రభుత్వ ఆసుపత్రి క్యాజువాలిటీ / అత్యవసర విభాగాలు' : 'District Hospital Casualty Desks'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.districtCasualtyDesks.map((desk, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {desk.hospital}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                      {desk.location} · 24x7 Casualty & Trauma
                    </div>
                  </div>
                  <a
                    href={`tel:${desk.phone.split('/')[0].trim()}`}
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--blue-600)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    <PhoneCall size={12} />
                    {desk.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 24px',
            backgroundColor: 'var(--slate-50)',
            borderTop: '1px solid var(--slate-200)',
            display: 'flex',
            justifyContent: 'flex-end',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px'
          }}
        >
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            {lang === 'te' ? 'మూసివేయండి' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
