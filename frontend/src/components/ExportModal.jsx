import React from 'react';
import { FileSpreadsheet, FileText, File, Download, X } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, onExport, isExporting, eventTitle }) {
  if (!isOpen) return null;

  const formats = [
    { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, color: '#22a06b' },
    { id: 'pdf', label: 'PDF (.pdf)', icon: FileText, color: '#db2c66' },
    { id: 'csv', label: 'CSV / Word (.csv)', icon: File, color: '#0a7abf' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}
        >
          <X size={20} />
        </button>

        <div className="modal-icon" style={{ background: 'var(--rose-pale)', color: 'var(--maroon)' }}>
          <Download size={28} />
        </div>

        <h3>Export Registrations</h3>
        <p className="modal-desc" style={{ marginBottom: '20px' }}>
          Choose a format to download the registrations for <strong>{eventTitle}</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {formats.map((fmt) => {
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                onClick={() => onExport(fmt.id)}
                disabled={isExporting}
                className="btn btn-ghost"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-start', 
                  gap: '12px',
                  padding: '16px',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--text-dark)'
                }}
              >
                <Icon size={20} color={fmt.color} />
                <span style={{ fontWeight: 600 }}>{fmt.label}</span>
              </button>
            );
          })}
        </div>

        {isExporting && <p style={{ fontSize: '0.85rem', color: 'var(--maroon)' }}>Generating file...</p>}

        <button className="btn btn-outline" onClick={onClose} disabled={isExporting}>
          Cancel
        </button>
      </div>
    </div>
  );
}