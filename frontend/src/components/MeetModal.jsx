import React, { useState } from 'react';

export default function MeetModal({ link, platform, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platformName = {
    google: 'Google Meet',
    teams: 'Microsoft Teams',
    zoom: 'Zoom',
    other: 'Meeting'
  }[platform] || 'Meeting';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">✓</div>
        <h3>Request Submitted</h3>
        <p className="modal-desc">
          Thank you! Your appointment request has been received. Use the link
          below to join your <strong>{platformName}</strong> session.
        </p>

        {link ? (
          <>
            <div className="link-box">{link}</div>
            <div className="modal-buttons">
              <button className="btn btn-outline" onClick={copyLink}>
                {copied ? '✓ Copied' : '📋 Copy Link'}
              </button>
              <a
                className="btn btn-secondary"
                href={link}
                target="_blank"
                rel="noreferrer"
              >
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