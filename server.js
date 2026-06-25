require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// GOOGLE SHEETS SETUP
// ─────────────────────────────────────────────
const sheetsAuth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key:  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendToSheet(data) {
  const client = await sheetsAuth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const row = [
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.company,
    data.designation,
    data.sector,
    data.interest,
    data.message || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range:         'Sheet1!A:J',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

// ─────────────────────────────────────────────
// NODEMAILER SETUP  (Gmail)
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,   // Gmail App Password (not your login password)
  },
});

async function sendConfirmationEmail(data) {
  // ── Email to the visitor ──
  await transporter.sendMail({
    from:    `"Pace Digitek × Lineage Power" <${process.env.GMAIL_USER}>`,
    to:      data.email,
    subject: '✅ Your Registration for IESW 2026 — Hall 1, Stall 4',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2e22;">
        <div style="background:linear-gradient(135deg,#1a7a3a,#2ea84f);padding:32px 36px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">
            You're Registered! 🎉
          </h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
            IESW 2026 — 12th India Energy Storage Week
          </p>
        </div>
        <div style="background:#f5f9f6;padding:32px 36px;border-radius:0 0 12px 12px;border:1px solid #d6f0dc;">
          <p style="font-size:15px;margin:0 0 20px;">Hi <strong>${data.firstName}</strong>,</p>
          <p style="font-size:14px;line-height:1.7;color:#374151;margin:0 0 24px;">
            Thank you for registering! We're excited to meet you at our stall.
            Our team will be ready to walk you through our latest energy storage solutions.
          </p>

          <div style="background:#fff;border:1px solid #d6f0dc;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              <tr><td style="color:#6b7280;padding:5px 0;width:110px;">📅 Date</td>      <td style="font-weight:600;">08 – 10 July 2026</td></tr>
              <tr><td style="color:#6b7280;padding:5px 0;">📍 Venue</td>     <td style="font-weight:600;">IICC, Yashbhoomi, New Delhi</td></tr>
              <tr><td style="color:#6b7280;padding:5px 0;">🏢 Location</td>  <td style="font-weight:600;">Hall 1 · Stall 4</td></tr>
              <tr><td style="color:#6b7280;padding:5px 0;">🏷️ Your Focus</td><td style="font-weight:600;">${data.interest}</td></tr>
            </table>
          </div>

          <p style="font-size:13px;color:#6b7280;line-height:1.7;">
            Questions before the event? Reach us at
            <a href="mailto:info@pacedigitek.com" style="color:#1a7a3a;">info@pacedigitek.com</a> or
            <a href="mailto:info@lineagepowersystems.com" style="color:#1a7a3a;">info@lineagepowersystems.com</a>.
          </p>

          <p style="margin-top:28px;font-size:13px;color:#9ca3af;">
            — The Pace Digitek &amp; Lineage Power Team
          </p>
        </div>
      </div>
    `,
  });

  // ── Internal alert to the stall team ──
  await transporter.sendMail({
    from:    `"IESW Registration" <${process.env.GMAIL_USER}>`,
    to:      process.env.NOTIFY_EMAIL,
    subject: `🔔 New Registration — ${data.firstName} ${data.lastName} (${data.company})`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#1a7a3a;">New Visitor Registration</h2>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;width:140px;">Name</td>        <td style="padding:8px 4px;font-weight:600;">${data.firstName} ${data.lastName}</td></tr>
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;">Email</td>       <td style="padding:8px 4px;">${data.email}</td></tr>
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;">Phone</td>       <td style="padding:8px 4px;">${data.phone}</td></tr>
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;">Company</td>     <td style="padding:8px 4px;">${data.company}</td></tr>
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;">Designation</td> <td style="padding:8px 4px;">${data.designation}</td></tr>
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;">Sector</td>      <td style="padding:8px 4px;">${data.sector}</td></tr>
          <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 4px;color:#6b7280;">Interest</td>    <td style="padding:8px 4px;">${data.interest}</td></tr>
          <tr>                                          <td style="padding:8px 4px;color:#6b7280;">Message</td>     <td style="padding:8px 4px;">${data.message || '—'}</td></tr>
        </table>
        <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Registered at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────
// API ROUTE
// ─────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, company, designation, sector, interest, message } = req.body;

  // Basic server-side validation
  if (!firstName || !lastName || !email || !phone || !company || !designation || !sector || !interest) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }

  try {
    await appendToSheet(req.body);
    await sendConfirmationEmail(req.body);
    return res.json({ success: true, message: 'Registration saved and email sent.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅  Server running at http://localhost:${PORT}\n`);
});
