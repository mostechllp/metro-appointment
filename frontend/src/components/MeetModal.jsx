import React, { useState } from 'react';

export default function MeetModal({ submission, onClose }) {
  const [copied, setCopied] = useState(false);

  // Extract event details from the populated submission
  const event = submission?.eventId;
  const link = event?.meetingLink;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">✓</div>
        <h3>Registration Successful</h3>
        <p className="modal-desc">
          Thank you, <strong>{submission?.name}</strong>! You are registered for:
        </p>
        
        {event && (
          <div style={{ background: 'var(--rose-pale)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <h4 style={{ color: 'var(--maroon-deep)', margin: '0 0 8px 0', fontSize: '1.1rem' }}>{event.title}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-soft)' }}>
              📅 {new Date(event.date).toLocaleString()}<br/>
              ⏱️ Duration: {event.durationMinutes} mins
            </p>
          </div>
        )}

        {link ? (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: 8 }}>
              Use the link below to join the session:
            </p>
            <div className="link-box">{link}</div>
            <div className="modal-buttons">
              <button className="btn btn-outline" onClick={copyLink}>
                {copied ? '✓ Copied' : '📋 Copy Link'}
              </button>
              <a className="btn btn-secondary" href={link} target="_blank" rel="noreferrer">
                🔗 Join Meeting
              </a>
            </div>
          </>
        ) : (
          <div className="link-box" style={{ color: '#6B5560', borderColor: '#EAD9E2' }}>
            Meeting link will be shared by our team shortly.
          </div>
        )}

        <button className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}