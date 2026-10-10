import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Form from '../components/Form';
import MeetModal from '../components/MeetModal';
import API from '../api';

export default function Home() {
  const [submission, setSubmission] = useState(null);
  const [globalLink, setGlobalLink] = useState({
    platform: 'google',
    meetingLink: ''
  });

  useEffect(() => {
    API.get('/submissions/meeting-link')
      .then((res) => setGlobalLink(res.data))
      .catch(() => setGlobalLink({ platform: 'google', meetingLink: '' }));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="main-content">
        <Form onSuccess={(sub) => setSubmission(sub)} />
      </main>

      {submission && (
        <MeetModal
          link={globalLink.meetingLink}
          platform={globalLink.platform}
          onClose={() => setSubmission(null)}
        />
      )}

      <Footer />
    </div>
  );
}