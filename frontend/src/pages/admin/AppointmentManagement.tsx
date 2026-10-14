import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Appointment } from '../../types';
import { TokenSlipModal } from '../../components/common/TokenSlipModal';
import { Calendar, Search, Filter, Printer } from 'lucide-react';

export const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      if (status !== 'ALL') params.status = status;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/admin/appointments', { params });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date, status]);

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title">System-wide OPD Appointments Monitor</h1>
        <p className="section-subtitle">
          Real-time appointment ledger across all Andhra Pradesh government hospitals and clinical departments.
        </p>
      </div>

      <div className="med-card" style={{ marginBottom: '24px', padding: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CALLED">CALLED</option>
              <option value="IN_CONSULTATION">IN_CONSULTATION</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Search Patient / Ref ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ref ID, Patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAppointments()}
            />
          </div>

          <div>
            <button className="btn btn-primary btn-sm" onClick={fetchAppointments} style={{ width: '100%' }}>
              <Search size={14} />
              Filter Records
            </button>
          </div>
        </div>
      </div>

      <div className="med-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading appointment records...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
            No appointments found matching filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 12px' }}>TOKEN / REF ID</th>
                  <th style={{ padding: '10px 12px' }}>PATIENT NAME</th>
                  <th style={{ padding: '10px 12px' }}>DOCTOR</th>
                  <th style={{ padding: '10px 12px' }}>DEPARTMENT</th>
                  <th style={{ padding: '10px 12px' }}>DATE & TIME</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px' }}>SLIP</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 900, color: 'var(--blue-600)' }}>
                        #{String(a.tokenNumber).padStart(2, '0')}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{a.id}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{a.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>+91 {a.patientPhone}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{a.doctorNameEn}</td>
                    <td style={{ padding: '12px' }}>{a.department}</td>
                    <td style={{ padding: '12px' }}>
                      <div>{a.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{a.slotTime}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-pill status-${a.status.toLowerCase()}`}>{a.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '3px 8px' }} onClick={() => setSelectedSlip(a)} title="View Token Slip">
                          <Printer size={13} />
                        </button>
                        <select
                          className="form-select"
                          value={a.status}
                          style={{ fontSize: '0.74rem', padding: '2px 6px', height: 'auto', width: 'auto' }}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            if (newStatus === a.status) return;
                            if (!window.confirm(`Update status of Token #${a.tokenNumber} to ${newStatus}?`)) return;
                            try {
                              await apiClient.patch(`/admin/appointments/${a.id}/status`, { status: newStatus });
                              fetchAppointments();
                            } catch (err: any) {
                              alert(err.response?.data?.error || 'Failed to update status');
                            }
                          }}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="CALLED">CALLED</option>
                          <option value="IN_CONSULTATION">IN_CONSULTATION</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="SKIPPED">SKIPPED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TokenSlipModal appointment={selectedSlip} onClose={() => setSelectedSlip(null)} />
    </div>
  );
};
