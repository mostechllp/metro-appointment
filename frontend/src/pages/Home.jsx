import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Form from '../components/Form';
import MeetModal from '../components/MeetModal';

export default function Home() {
  const [submission, setSubmission] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main className="main-content">
        <Form onSuccess={(sub) => setSubmission(sub)} />
      </main>

      {submission && (
        <MeetModal
          submission={submission} // 👈 Pass the whole object now
          onClose={() => setSubmission(null)}
        />
      )}

      <Footer />
    </div>
  );
}