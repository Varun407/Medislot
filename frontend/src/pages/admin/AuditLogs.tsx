import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { AuditLog } from '../../types';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="main-content">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title">Security & Governance Audit Trail</h1>
          <p className="section-subtitle">
            Cryptographically logged record of administrator actions, doctor status modifications, and access checkpoints.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>
          <RefreshCw size={14} />
          Refresh Log
        </button>
      </div>

      <div className="med-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading security audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
            No administrative events recorded in audit log.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                  <th style={{ padding: '10px 12px' }}>ACTOR ROLE / ID</th>
                  <th style={{ padding: '10px 12px' }}>SECURITY ACTION</th>
                  <th style={{ padding: '10px 12px' }}>RESOURCE</th>
                  <th style={{ padding: '10px 12px' }}>DETAILS</th>
                  <th style={{ padding: '10px 12px' }}>IP ADDRESS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--slate-500)' }}>
                      {l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="status-pill status-completed" style={{ fontSize: '0.7rem' }}>
                        {l.actorRole}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '2px' }}>
                        {l.actorUserId}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {l.action}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--slate-600)' }}>
                      {l.resource} {l.resourceId ? `(${l.resourceId})` : ''}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--slate-600)', maxWidth: '280px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.details || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                      {l.ipAddress || '127.0.0.1'}
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
