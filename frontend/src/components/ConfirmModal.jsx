import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isProcessing = false,
  variant = 'danger' // 'danger' (red) or 'primary' (maroon)
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        
        {/* Close Icon */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-soft)' }}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div 
          className="modal-icon" 
          style={{ 
            background: isDanger ? '#fdeaea' : 'var(--rose-pale)', 
            color: isDanger ? '#e74c3c' : 'var(--maroon)' 
          }}
        >
          <AlertCircle size={32} />
        </div>

        <h3>{title || 'Are you sure?'}</h3>
        
        <p className="modal-desc" style={{ marginBottom: '24px' }}>
          {message || 'Please confirm you want to proceed with this action.'}
        </p>

        <div className="modal-buttons">
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className="btn" 
            style={{ background: isDanger ? '#e74c3c' : 'var(--maroon)' }}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}