const cron = require('node-cron');
const Event = require('../models/Event');
const Submission = require('../models/Submission');
const { sendCertificateEmail } = require('./emailService');

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('⏰ Checking for completed events...');
  
  try {
    const now = new Date();
    // Find events that haven't sent certificates yet
    const events = await Event.find({ certificatesSent: false });

    for (const event of events) {
      const startTime = new Date(event.date);
      const endTime = new Date(startTime.getTime() + event.durationMinutes * 60000);
      
      // 1. Check if it's currently ongoing
      if (now >= startTime && now <= endTime) {
        if (event.status !== 'ongoing') {
          event.status = 'ongoing';
          await event.save();
        }
      }

      // 2. Check if it has ended
      if (now > endTime) {
        console.log(`🏁 Event ended: ${event.title}. Sending certificates...`);
        
        event.status = 'completed';
        event.certificatesSent = true;
        await event.save();

        const attendees = await Submission.find({ 
          eventId: event._id, 
          attendance: 'attended',
          certificateSent: false 
        });

        for (const person of attendees) {
          if (person.email) {
            const sent = await sendCertificateEmail(person, event);
            if (sent) {
              person.certificateSent = true;
              await person.save();
              console.log(`✅ Certificate sent to ${person.email}`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Cron Job Error:', err);
  }
});