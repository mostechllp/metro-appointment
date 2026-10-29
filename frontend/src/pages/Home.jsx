import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Form from '../components/Form';
import MeetModal from '../components/MeetModal';
import { ShieldCheck, Award, Calendar, Link as LinkIcon } from 'lucide-react';

export default function Home() {
  const [submission, setSubmission] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#FAF7F9' }}>
      <Header />

      <main className="main-content" style={{ padding: '40px 20px', flex: 1 }}>
        <div className="split-layout">
          
          {/* LEFT COLUMN: Brand & Info */}
          <div className="split-left">
            <div className="home-eyebrow" style={{ color: 'var(--rose)' }}>
              <span className="dot" style={{ background: '#fff' }}></span> METRO STARCARE
            </div>
            
            <h1 className="home-h1" style={{ color: '#fff' }}>
              Empowering Health.<br />
              <span className="italic" style={{ color: 'var(--rose)' }}>Recognizing You.</span>
            </h1>
            
            <p className="home-desc" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Metro Starcare Medical Centre has been a trusted healthcare provider for over a decade. 
              We are dedicated to delivering world-class medical services with compassion and excellence.
            </p>

            <div className="left-features">
              <div className="feature-item">
                <div className="feature-icon"><Calendar size={18} /></div>
                <div>
                  <h4>Join Interactive Events</h4>
                  <p>Participate in our health awareness programmes and consultations.</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon"><Award size={18} /></div>
                <div>
                  <h4>Automatic Certificates</h4>
                  <p>Attended the event? A personalized certificate of completion is emailed to you automatically.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon"><LinkIcon size={18} /></div>
                <div>
                  <h4>Instant Meeting Links</h4>
                  <p>Receive your Google Meet or Teams link instantly upon registration.</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <a href="https://metrostarcare.ae/" target="_blank" rel="noreferrer" className="btn btn-outline-light" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.85rem' }}>
                Visit Our Website
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Form */}
          <div className="split-right">
            <div className="home-form-header">
              <span className="step-badge">REGISTRATION</span>
              <h2>Register your participation</h2>
              <p>Enter your details to confirm your spot.</p>
            </div>

            <Form onSuccess={(sub) => setSubmission(sub)} />
            
            <div className="privacy-note">
              <ShieldCheck size={18} />
              <p>
                Your information is saved securely for the programme organizers. 
                Phone numbers are kept private and are not printed on your certificate.
              </p>
            </div>
          </div>

        </div>
      </main>

      {submission && (
        <MeetModal
          submission={submission}
          onClose={() => setSubmission(null)}
        />
      )}

      <Footer />
    </div>
  );
}