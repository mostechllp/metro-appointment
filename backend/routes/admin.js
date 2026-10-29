const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const Setting = require('../models/Settings');
const Event = require('../models/Event');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// ==============================
// POST /api/admin/login
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// POST /api/admin/register
// (protected — only logged-in admins can create others)
// ==============================
router.post('/register', auth, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({ email, password, name });
    res.status(201).json({
      message: 'Admin created',
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// GET /api/admin/me (verify token)
// ==============================
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// GET /api/admin/submissions (protected)
// ==============================
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('eventId') // 👈 THIS IS THE FIX
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/meeting-link', auth, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'global_meeting' });
    res.json(
      setting?.value || { platform: 'google', meetingLink: '' }
    );
  } catch (err) {
    console.error('Get meeting link error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// PUT /api/admin/meeting-link (protected)
// Upsert the global meeting config
// ==============================
router.put('/meeting-link', auth, async (req, res) => {
  try {
    const { platform, meetingLink } = req.body;   // 👈 THE MISSING LINE

    if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
      return res
        .status(400)
        .json({ message: 'Link must start with http:// or https://' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'global_meeting' },
      {
        key: 'global_meeting',
        value: { platform, meetingLink },
        updatedAt: new Date()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(setting.value);
  } catch (err) {
    console.error('Update meeting link error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// PATCH /api/admin/submissions/:id/attendance (protected)
// Update attendance status for a single submission
// ==============================
router.patch('/submissions/:id/attendance', auth, async (req, res) => {
  try {
    const { attendance } = req.body;

    if (!['attended', 'not-attended'].includes(attendance)) {
      return res
        .status(400)
        .json({ message: 'Attendance must be "attended" or "not-attended"' });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { attendance },
      { new: true, runValidators: true }
    );

    if (!submission) return res.status(404).json({ message: 'Not found' });
    res.json(submission);
  } catch (err) {
    console.error('Attendance update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==============================
// PATCH /api/admin/submissions/:id (protected)
// ==============================
router.patch('/submissions/:id', auth, async (req, res) => {
  try {
    const { platform, meetingLink } = req.body;

    if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
      return res.status(400).json({ message: 'Meeting link must start with http:// or https://' });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { platform, meetingLink },
      { new: true, runValidators: true }
    );

    if (!submission) return res.status(404).json({ message: 'Not found' });
    res.json(submission);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/// ==============================
// GET /api/admin/export/:eventId
// ==============================
router.get('/export/:eventId', auth, async (req, res) => {
  try {
    const { format } = req.query;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const registrations = await Submission.find({ eventId }).sort({ name: 1 });

    // 👈 Create clean filename: Registrations-EventName-YYYY-MM-DD
    const cleanEventName = event.title.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Registrations-${cleanEventName}-${dateStr}`;

    // ==========================================
    // 1. EXCEL EXPORT
    // ==========================================
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Registrations');

      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Emirate', key: 'emirate', width: 15 },
        { header: 'Attendance', key: 'attendance', width: 15 },
        { header: 'Certificate Sent', key: 'certificateSent', width: 15 },
        { header: 'Date Registered', key: 'createdAt', width: 25 },
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B1A4A' } };

      registrations.forEach(reg => {
        worksheet.addRow({
          name: reg.name,
          email: reg.email,
          phone: reg.phone + '\u200B', // 👈 Zero-width space prevents Excel scientific notation
          emirate: reg.emirate,
          attendance: reg.attendance === 'attended' ? 'Attended' : 'Not Attended',
          certificateSent: reg.certificateSent ? 'Yes' : 'No',
          createdAt: new Date(reg.createdAt).toLocaleString(),
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);

      await workbook.xlsx.write(res);
      return res.end();
    }

    // ==========================================
    // 2. PDF EXPORT (With Branding)
    // ==========================================
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);

      doc.pipe(res);

      // 👈 PDF Header / Branding
      doc.fontSize(22).fillColor('#8B1A4A').font('Helvetica-Bold').text('METROSTARCARE', { align: 'center' });
      doc.fontSize(12).fillColor('#6B5560').font('Helvetica').text('Metro Medical Centre', { align: 'center' });
      doc.moveDown(1.5);
      
      // Event Details
      doc.fontSize(16).fillColor('#000000').font('Helvetica-Bold').text(event.title, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`Date: ${new Date(event.date).toLocaleString()}`, { align: 'center' });
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      
      doc.moveDown(2);

      // Table Headers
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#8B1A4A');
      doc.text('Name', 50, tableTop);
      doc.text('Phone', 180, tableTop);
      doc.text('Email', 280, tableTop);
      doc.text('Emirate', 420, tableTop);
      doc.text('Status', 490, tableTop);

      // Draw Line
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#EAD9E2').stroke();
      
      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica').fillColor('#000000');

      registrations.forEach(reg => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }
        doc.fontSize(9).text(reg.name.substring(0, 20), 50, y);
        doc.text(reg.phone, 180, y);
        doc.text(reg.email ? reg.email.substring(0, 25) : '-', 280, y);
        doc.text(reg.emirate, 420, y);
        doc.text(reg.attendance === 'attended' ? 'Attended' : 'Not Attended', 490, y);
        y += 20;
      });

      doc.end();
      return;
    }

    // ==========================================
    // 3. CSV EXPORT
    // ==========================================
    if (format === 'csv') {
      let csvContent = 'Name,Email,Phone,Emirate,Attendance,Certificate Sent,Date\n';
      registrations.forEach(reg => {
        // 👈 Wrapping phone in ="..." forces Excel to treat it as text
        csvContent += `"${reg.name}","${reg.email || ''}","=""${reg.phone}""","${reg.emirate}","${reg.attendance}","${reg.certificateSent ? 'Yes' : 'No'}","${new Date(reg.createdAt).toLocaleString()}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      return res.status(200).send(csvContent);
    }

    res.status(400).json({ message: 'Invalid format requested' });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Server error during export' });
  }
});

module.exports = router;