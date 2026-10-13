import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Users, Search, Activity } from 'lucide-react';

export const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/patients', { params: { search: search.trim() } });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title">Patient Records Directory</h1>
        <p className="section-subtitle">
          View registered patients, demographic data, and associated OPD booking volumes across facilities.
        </p>
      </div>

      <div className="med-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search patient by name, mobile, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
          />
          <button className="btn btn-primary btn-sm" onClick={fetchPatients}>
            <Search size={14} />
            Search
          </button>
        </div>
      </div>

      <div className="med-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading patient accounts...</p>
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
            No patient records found matching search.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 12px' }}>PATIENT NAME</th>
                  <th style={{ padding: '10px 12px' }}>CONTACT EMAIL / PHONE</th>
                  <th style={{ padding: '10px 12px' }}>AGE / GENDER</th>
                  <th style={{ padding: '10px 12px' }}>AROGYASRI ID</th>
                  <th style={{ padding: '10px 12px' }}>APPOINTMENTS</th>
                  <th style={{ padding: '10px 12px' }}>ACCOUNT STATUS</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '12px', fontWeight: 800, color: 'var(--navy-900)' }}>
                      {p.fullName}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>{p.email}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>+91 {p.phone}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {p.age ? `${p.age} Yrs` : 'N/A'} · {p.gender || 'Not specified'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--slate-600)' }}>
                      {p.abhaId || 'Standard Citizen'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--blue-600)' }}>
                      {p.appointmentCount || 0} visits
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-pill status-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
