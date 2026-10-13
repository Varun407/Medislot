import React from 'react';
import { Appointment } from '../../types';
import { generateBarcodeSvg, generateQrCodeSvg } from '../../utils/qrBarcode';
import { Printer, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TokenSlipModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const TokenSlipModal: React.FC<TokenSlipModalProps> = ({ appointment, onClose }) => {
  const { lang } = useLanguage();

  if (!appointment) return null;

  const barcodeSvg = generateBarcodeSvg(appointment.id);
  const qrSvg = generateQrCodeSvg(
    `AP-HEALTH:${appointment.id}|PATIENT:${appointment.patientName}|TOKEN:${appointment.tokenNumber}|ROOM:${appointment.roomNo}|HOSPITAL:${appointment.hospitalId}`
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="var(--emerald-600)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              {lang === 'te' ? 'ఓపీడీ అపాయింట్‌మెంట్ టోకెన్ స్లిప్' : 'Official OPD Token Slip'}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              {lang === 'te' ? 'ప్రింట్' : 'Print Slip'}
            </button>
            <button className="toast-close" onClick={onClose} style={{ color: 'var(--slate-500)' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="opd-slip-container">
            {/* Header */}
            <div className="slip-header">
              <div className="slip-govt-title">
                Government of Andhra Pradesh · Department of Health & Family Welfare
              </div>
              <div className="slip-hosp-name">
                {lang === 'te' && appointment.hospitalNameTe ? appointment.hospitalNameTe : appointment.hospitalNameEn}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Outpatient Department (OPD) Consultation Token Slip
              </div>
            </div>

            {/* Big Token Display */}
            <div className="slip-token-banner">
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue-600)', textTransform: 'uppercase' }}>
                {lang === 'te' ? 'మీ టోకెన్ నంబర్' : 'Your Sequential Token Number'}
              </div>
              <div className="huge-token-number">
                #{String(appointment.tokenNumber).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                OPD Reference ID: <strong style={{ color: 'var(--navy-900)' }}>{appointment.id}</strong>
              </div>
            </div>

            {/* Grid details */}
            <div className="slip-details-grid">
              <div className="slip-detail-row">
                <strong>Patient Name</strong>
                <span>{appointment.patientName}</span>
              </div>
              <div className="slip-detail-row">
                <strong>Contact / Phone</strong>
                <span>+91 {appointment.patientPhone}</span>
              </div>
              <div className="slip-detail-row">
                <strong>Age & Gender</strong>
                <span>{appointment.patientAge || '32'} Yrs · {appointment.patientGender}</span>
              </div>
              <div className="slip-detail-row">
                <strong>Arogyasri ID</strong>
                <span>{appointment.abhaId || 'N/A (Standard Citizen)'}</span>
              </div>
              <div className="slip-detail-row">
                <strong>Specialist Doctor</strong>
                <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                  {lang === 'te' && appointment.doctorNameTe ? appointment.doctorNameTe : appointment.doctorNameEn}
                </span>
              </div>
              <div className="slip-detail-row">
                <strong>Clinical Department</strong>
                <span>{appointment.department}</span>
              </div>
              <div className="slip-detail-row">
                <strong>OPD Consultation Date</strong>
                <span style={{ fontWeight: 700 }}>{appointment.appointmentDate}</span>
              </div>
              <div className="slip-detail-row">
                <strong>Slot & Reporting Time</strong>
                <span style={{ color: 'var(--blue-600)', fontWeight: 700 }}>
                  {appointment.slotTime} (Report: {appointment.reportingTime})
                </span>
              </div>
              <div className="slip-detail-row" style={{ gridColumn: 'span 2' }}>
                <strong>Room / Counter Number</strong>
                <span style={{ fontWeight: 700, color: 'var(--emerald-700)' }}>
                  {appointment.roomNo}
                </span>
              </div>
              {appointment.symptoms && (
                <div className="slip-detail-row" style={{ gridColumn: 'span 2' }}>
                  <strong>Chief Complaint / Notes</strong>
                  <span style={{ color: 'var(--slate-600)' }}>{appointment.symptoms}</span>
                </div>
              )}
            </div>

            {/* Barcode & QR Code SVGs */}
            <div className="slip-barcodes">
              <div dangerouslySetInnerHTML={{ __html: barcodeSvg }} />
              <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>

            {/* Instructions */}
            <div style={{ marginTop: '16px', padding: '10px', background: 'var(--slate-50)', borderRadius: '6px', fontSize: '0.74rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              • Please arrive at the OPD Counter 15 minutes before your scheduled slot time.<br />
              • Present this digital or printed slip with barcode/QR code at the OPD entrance desk.<br />
              • Consultations, basic diagnostic blood tests, and government formulary medicines are 100% free of charge.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
