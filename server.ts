import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, onSnapshot, increment } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

export type MailPurpose = 'support' | 'credentials' | 'verify';

interface MailAccountConfig {
  user: string;
  pass: string;
  senderName: string;
}

function getMailAccountConfig(purpose: MailPurpose): MailAccountConfig {
  const globalFallbackPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  switch (purpose) {
    case 'verify': {
      const user = (process.env.VERIFY_GMAIL_USER || 'verifyverdetechsystems@gmail.com').trim();
      const pass = (process.env.VERIFY_GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim() || globalFallbackPass;
      return {
        user,
        pass,
        senderName: 'VerdeTech Verification',
      };
    }
    case 'credentials': {
      const user = (process.env.CREDENTIALS_GMAIL_USER || 'credentialsverdetech@gmail.com').trim();
      const pass = (process.env.CREDENTIALS_GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim() || globalFallbackPass;
      return {
        user,
        pass,
        senderName: 'VerdeTech Credentials',
      };
    }
    case 'support':
    default: {
      const user = (process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com').trim();
      const pass = (process.env.SUPPORT_GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim() || globalFallbackPass;
      return {
        user,
        pass,
        senderName: 'VerdeTech Support',
      };
    }
  }
}

async function sendEmailSafely(
  mailOptions: nodemailer.SendMailOptions,
  purpose: MailPurpose = 'support'
): Promise<{ success: boolean; delivered: boolean; error?: string; sender?: string }> {
  // Determine primary account and build candidate fallback chain
  const primary = getMailAccountConfig(purpose);
  const supportAcc = getMailAccountConfig('support');
  const credsAcc = getMailAccountConfig('credentials');
  const verifyAcc = getMailAccountConfig('verify');

  // Build ordered list of unique candidates with credentials
  const candidates: MailAccountConfig[] = [];
  const seenUsers = new Set<string>();

  for (const acc of [primary, supportAcc, credsAcc, verifyAcc]) {
    if (acc.user && acc.pass && !seenUsers.has(acc.user.toLowerCase())) {
      candidates.push(acc);
      seenUsers.add(acc.user.toLowerCase());
    }
  }

  if (candidates.length === 0) {
    const envKey = purpose === 'verify' 
      ? 'VERIFY_GMAIL_APP_PASSWORD' 
      : purpose === 'credentials' 
        ? 'CREDENTIALS_GMAIL_APP_PASSWORD' 
        : 'SUPPORT_GMAIL_APP_PASSWORD';
    const errorNotice = `Gmail App Password not configured for ${primary.user}. To send live emails to inboxes, set ${envKey} or GMAIL_APP_PASSWORD in App Settings / Secrets.`;
    console.warn(`[MAIL NOTICE] [${purpose.toUpperCase()}] ${errorNotice}`);
    return {
      success: true,
      delivered: false,
      sender: primary.user,
      error: errorNotice,
    };
  }

  let lastError = '';

  for (const config of candidates) {
    const optionsWithSender: nodemailer.SendMailOptions = {
      ...mailOptions,
      from: `"${config.senderName}" <${config.user}>`,
      replyTo: config.user,
      headers: {
        'X-Priority': '1',
        'Importance': 'High',
        ...(mailOptions.headers || {}),
      },
    };

    // Try Port 465 (SSL) first
    try {
      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });

      try {
        const info = await transporter.sendMail(optionsWithSender);
        console.log(`[MAIL SUCCESS] [${purpose.toUpperCase()}] Dispatched from ${config.user} via port 465 to ${mailOptions.to}. MessageId: ${info.messageId}`);
        return { success: true, delivered: true, sender: config.user };
      } catch (port465Err: any) {
        console.warn(`[MAIL PORT 465 NOTICE] Port 465 attempt with ${config.user} encountered (${port465Err?.message || port465Err}), attempting port 587 STARTTLS...`);
        transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: config.user,
            pass: config.pass,
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000,
        });

        const info = await transporter.sendMail(optionsWithSender);
        console.log(`[MAIL SUCCESS] [${purpose.toUpperCase()}] Dispatched from ${config.user} via port 587 to ${mailOptions.to}. MessageId: ${info.messageId}`);
        return { success: true, delivered: true, sender: config.user };
      }
    } catch (primaryErr: any) {
      lastError = primaryErr?.message || String(primaryErr);
      if (lastError.includes('535') || lastError.includes('EAUTH') || lastError.includes('Username and Password not accepted')) {
        lastError = `Gmail authentication error: Invalid App Password for ${config.user}. Please verify your 16-character App Password (without spaces) at myaccount.google.com/apppasswords.`;
      }
      console.warn(`[MAIL FAILOVER] [${purpose.toUpperCase()}] Attempt with ${config.user} failed (${lastError}), attempting next available sender...`);
    }
  }

  console.error(`[MAIL ERROR] All candidate senders failed for ${mailOptions.to}. Last error:`, lastError);
  return {
    success: true,
    delivered: false,
    sender: primary.user,
    error: `Gmail delivery error: ${lastError}`,
  };
}

function formatE164Phone(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();

  if (trimmed.startsWith('+')) {
    const digitsOnly = trimmed.replace(/[^\d]/g, '');
    return '+' + digitsOnly;
  }

  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return '';

  // 8 digits (Oman: +968 e.g., 91234567, 71234567, 24123456, 98765432)
  if (digits.length === 8 && ['7', '9', '2', '8'].includes(digits[0])) {
    return '+968' + digits;
  }

  // 11 digits starting with 968 (Oman with country code)
  if (digits.length === 11 && digits.startsWith('968')) {
    return '+' + digits;
  }

  // 10 digits starting with 05 (UAE: +971)
  if (digits.length === 10 && digits.startsWith('05')) {
    return '+971' + digits.slice(1);
  }

  // 10 digits starting with 6,7,8,9 (India: +91)
  if (digits.length === 10 && ['6', '7', '8', '9'].includes(digits[0])) {
    return '+91' + digits;
  }

  // 11 digits starting with 0 (e.g. 09876543210 for India)
  if (digits.length === 11 && digits.startsWith('0')) {
    const withoutZero = digits.slice(1);
    if (['6', '7', '8', '9'].includes(withoutZero[0])) {
      return '+91' + withoutZero;
    }
  }

  // 12 digits starting with 91 (India)
  if (digits.length === 12 && digits.startsWith('91')) {
    return '+' + digits;
  }

  return '+' + digits;
}

async function sendWhatsAppSafely(
  phoneNumber: string,
  code: string,
  formattedEcoNum: string,
  studentName?: string
): Promise<{ sent: boolean; messageId?: string; error?: string; whatsappUrl?: string }> {
  const phoneNumId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const targetPhone = phoneNumber || process.env.WHATSAPP_PHONE_NUMBER || '';

  const cleanPhone = formatE164Phone(targetPhone);
  const digitsOnly = cleanPhone.replace(/[^\d]/g, '');
  const messageText = `🌿 Verde Tech Portal Verification\n\nHello ${studentName || 'Student'},\nYour assigned Eco Number is: ${formattedEcoNum}\nYour 6-digit verification code is: ${code}\n\nPlease enter this code to complete your registration!`;
  const whatsappUrl = digitsOnly ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(messageText)}` : undefined;

  const isInvalid = (val?: string) =>
    !val ||
    val.toLowerCase().includes('your_') ||
    val.toLowerCase().includes('placeholder') ||
    val.toLowerCase().includes('1234567890') ||
    val.toLowerCase().includes('eaag...');

  if (isInvalid(phoneNumId) || isInvalid(accessToken)) {
    return {
      sent: true,
      whatsappUrl,
    };
  }

  try {
    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: digitsOnly,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText,
        },
      }),
    });

    const data = (await metaRes.json()) as any;
    if (metaRes.ok && data.messages?.[0]?.id) {
      console.log(`[META WHATSAPP SUCCESS] Message sent to ${digitsOnly}. Message ID: ${data.messages[0].id}`);
      return { sent: true, messageId: data.messages[0].id, whatsappUrl };
    } else {
      const errMsg = data.error?.message || `Meta WhatsApp API notice (${metaRes.status})`;
      console.warn(`[META WHATSAPP NOTICE] API response:`, errMsg);
      return { sent: true, error: errMsg, whatsappUrl };
    }
  } catch (err: any) {
    return { sent: true, whatsappUrl };
  }
}

interface StoredVerification {
  code: string;
  expiresAt: number;
  studentName?: string;
  ecoNumber?: string;
}

const verificationCodes = new Map<string, StoredVerification>();

// Initialize Firebase for backend persistence
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Fast in-memory cache for Raspberry Pi & Smart Bin queries
const studentsCache = new Map<string, any>();

const SEED_STUDENTS: any[] = [
  {
    grNo: '83152',
    name: 'Smart Bin User (83152)',
    email: 'eco83152@verdetech.internal',
    password: 'password123',
    grade: 'Grade 10',
    profession: 'Student',
    role: 'Student',
    schoolPosition: 'Eco Smart Bin Pilot Member',
    points: 1250,
    weeklyPoints: 250,
    rank: 4,
    badges: ['badge-smart-bin-master', 'badge-ewaste-pioneer'],
    co2SavedKg: 28,
    waterSavedLiters: 85,
    wasteDivertedKg: 34,
    energySavedKwh: 45,
    joinedDate: '2026-09-10',
    createdAt: '2026-09-10T00:00:00.000Z',
    updatedAt: '2026-09-23T00:00:00.000Z',
  },
  {
    grNo: '83502',
    name: 'Laxman Sree Ram',
    email: 'subashiniompop@gmail.com',
    password: 'password123',
    grade: 'Portal Administrator',
    profession: 'Project Lead - Website Developer',
    role: 'Admin',
    schoolPosition: 'Project Lead - Website Developer',
    points: 13000,
    weeklyPoints: 13000,
    rank: 1,
    badges: ['badge-century', 'badge-captain', 'badge-tree-hero'],
    co2SavedKg: 125,
    waterSavedLiters: 320,
    wasteDivertedKg: 155,
    energySavedKwh: 235,
    joinedDate: '2026-09-01',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-23T00:00:00.000Z',
  },
  {
    grNo: '266136',
    name: 'Dhruv Mudgal',
    email: 'dhruvmudgal@verdetech.internal',
    password: 'password123',
    grade: 'Grade 10',
    profession: 'Student',
    role: 'Student',
    points: 10000,
    weeklyPoints: 10000,
    rank: 2,
    badges: ['badge-century', 'badge-tree-hero', 'badge-waste-warrior'],
    co2SavedKg: 100,
    waterSavedLiters: 250,
    wasteDivertedKg: 120,
    energySavedKwh: 180,
  },
  {
    grNo: '174404',
    name: 'VENKAT',
    email: 'venkat@verdetech.internal',
    password: 'password123',
    grade: 'Grade 11',
    profession: 'Student',
    role: 'Student',
    points: 450,
    weeklyPoints: 450,
    rank: 3,
  },
];

// Populate in-memory map
SEED_STUDENTS.forEach((s) => {
  const clean = String(s.grNo).replace(/^(eco)[-_]?/i, '').trim();
  studentsCache.set(s.grNo, s);
  studentsCache.set(clean, s);
  studentsCache.set(`ECO-${clean}`, s);
});

// Live synchronization with Firestore
try {
  onSnapshot(collection(db, 'students'), (snap) => {
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.grNo) {
        const clean = String(data.grNo).replace(/^(eco)[-_]?/i, '').trim();
        studentsCache.set(String(data.grNo), data);
        studentsCache.set(clean, data);
        studentsCache.set(`ECO-${clean}`, data);
      }
    });
    console.log(`[FIREBASE] Synced ${snap.size} students to backend cache`);
  }, (err) => {
    console.warn('[FIREBASE SYNC NOTICE]', err?.message);
  });
} catch (err: any) {
  console.warn('[FIREBASE INIT NOTICE]', err?.message);
}

// Ensure 83152 exists in Firestore
(async () => {
  try {
    const docRef = doc(db, 'students', '83152');
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, SEED_STUDENTS[0]);
      console.log('[FIREBASE] Seeded student 83152 into Firestore for Raspberry Pi integration');
    }
  } catch (err: any) {
    console.warn('[FIREBASE SEED NOTICE]', err?.message);
  }
})();

async function findStudentByEcoNumber(rawNumber: string) {
  if (!rawNumber) return null;
  const trimmed = rawNumber.trim();
  const clean = trimmed.replace(/^(eco)[-_]?/i, '').trim();

  // 1. In-memory cache (<1ms response time)
  if (studentsCache.has(trimmed)) return studentsCache.get(trimmed);
  if (studentsCache.has(clean)) return studentsCache.get(clean);
  if (studentsCache.has(`ECO-${clean}`)) return studentsCache.get(`ECO-${clean}`);

  for (const s of studentsCache.values()) {
    const sClean = String(s.grNo || '').replace(/^(eco)[-_]?/i, '').trim();
    const sUser = String(s.username || '').toLowerCase().replace(/^@/, '');
    const cleanLower = clean.toLowerCase().replace(/^@/, '');
    if (sClean === clean || String(s.grNo).toLowerCase() === trimmed.toLowerCase() || (sUser && sUser === cleanLower)) {
      return s;
    }
  }

  // 2. Direct Firestore query
  try {
    const docIds = [clean, trimmed, `ECO-${clean}`, `ECO_${clean}`];
    for (const dId of docIds) {
      const docSnap = await getDoc(doc(db, 'students', dId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        studentsCache.set(data.grNo, data);
        studentsCache.set(clean, data);
        return data;
      }
    }

    const snap = await getDocs(collection(db, 'students'));
    for (const docItem of snap.docs) {
      const data = docItem.data();
      const sClean = String(data.grNo || '').replace(/^(eco)[-_]?/i, '').trim();
      const sUser = String(data.username || '').toLowerCase().replace(/^@/, '');
      const cleanLower = clean.toLowerCase().replace(/^@/, '');
      if (sClean === clean || String(data.grNo).toLowerCase() === trimmed.toLowerCase() || (sUser && sUser === cleanLower)) {
        studentsCache.set(data.grNo, data);
        studentsCache.set(clean, data);
        return data;
      }
    }
  } catch (err: any) {
    console.warn('[FIRESTORE LOOKUP ERROR]', err?.message);
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Ensure JSON parse errors return structured JSON instead of HTML error pages
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON payload in request body',
        message: 'The body sent to this endpoint could not be parsed as valid JSON.',
        details: err.message
      });
    }
    next(err);
  });

  // ==========================================
  // RASPBERRY PI SMART BIN BACKEND ENDPOINTS
  // Handles requests.get("verdesystems.ai.studio/econumberExists?n=83152")
  // ==========================================
  const handleEcoNumberExists = async (req: express.Request, res: express.Response) => {
    // Enable full CORS for hardware, Raspberry Pi, Python scripts, and browsers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const rawNumber = (
      req.query.n ||
      req.params.n ||
      req.query.ecoNumber ||
      req.query.eco ||
      req.query.number ||
      req.query.id ||
      req.query.grNo ||
      req.body?.n ||
      req.body?.ecoNumber ||
      req.body?.eco ||
      req.body?.number ||
      req.body?.id ||
      req.body?.grNo ||
      ''
    ).toString().trim();

    const isTextRequested = 
      req.query.format === 'text' || 
      req.query.raw === '1' || 
      req.query.type === 'bool' ||
      req.headers.accept === 'text/plain';

    if (!rawNumber) {
      if (isTextRequested) {
        return res.type('text/plain').send('false');
      }
      return res.status(400).json({
        exists: false,
        found: false,
        ecoNumber: '',
        error: "Missing Eco Number parameter 'n'. Usage: requests.get('https://<domain>/econumberExists?n=83152')",
        usageExample: "requests.get('verdesystems.ai.studio/econumberExists?n=83152')",
      });
    }

    const student = await findStudentByEcoNumber(rawNumber);

    if (student) {
      console.log(`[RASPBERRY PI / API] Eco Number verified: ${rawNumber} -> Student: ${student.name} (${student.grNo})`);
      
      if (isTextRequested) {
        return res.type('text/plain').send('true');
      }

      return res.json({
        exists: true,
        found: true,
        ecoNumber: student.grNo,
        name: student.name,
        points: student.points || 0,
        weeklyPoints: student.weeklyPoints || 0,
        grade: student.grade || 'Student',
        role: student.role || 'Student',
        rank: student.rank || 1,
        badges: student.badges || [],
        student: {
          grNo: student.grNo,
          name: student.name,
          points: student.points || 0,
          weeklyPoints: student.weeklyPoints || 0,
          grade: student.grade || 'Student',
          role: student.role || 'Student',
        },
        message: `Eco number ${student.grNo} exists and is verified for student ${student.name}.`,
      });
    } else {
      console.log(`[RASPBERRY PI / API] Eco Number check: ${rawNumber} -> NOT FOUND`);

      if (isTextRequested) {
        return res.type('text/plain').send('false');
      }

      return res.json({
        exists: false,
        found: false,
        ecoNumber: rawNumber,
        student: null,
        message: `Eco number ${rawNumber} does not exist in the Verde Tech database.`,
      });
    }
  };

  // Bind Raspberry Pi routes across standard and alias endpoints
  const ecoRoutes = [
    '/econumberExists',
    '/econumberExists/:n',
    '/ecoNumberExists',
    '/ecoNumberExists/:n',
    '/api/econumberExists',
    '/api/econumberExists/:n',
    '/api/ecoNumberExists',
    '/api/ecoNumberExists/:n',
    '/econumber-exists',
    '/api/econumber-exists',
    '/econumberexists',
    '/api/econumberexists',
  ];

  ecoRoutes.forEach((route) => {
    app.all(route, handleEcoNumberExists);
  });

  // Raspberry Pi Smart Bin Live Disposal Logging Endpoint
  app.all(['/smartBinDisposal', '/api/smartBinDisposal', '/api/recordSmartBinDisposal', '/recordSmartBinDisposal'], async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const rawNumber = (
      req.body?.ecoNumber ||
      req.body?.n ||
      req.query.n ||
      req.query.ecoNumber ||
      ''
    ).toString().trim();

    const quantity = Number(req.body?.quantity || req.query.quantity || 1) || 1;
    const binId = String(req.body?.binId || req.query.binId || 'Smart Eco Bin #1');
    const pointsToAward = Number(req.body?.points || quantity * 50);

    if (!rawNumber) {
      return res.status(400).json({ success: false, error: "Eco number ('n' or 'ecoNumber') is required." });
    }

    const student = await findStudentByEcoNumber(rawNumber);
    if (!student) {
      return res.status(404).json({ success: false, error: `Student with Eco Number ${rawNumber} not found.` });
    }

    const newPoints = (student.points || 0) + pointsToAward;
    const newWeeklyPoints = (student.weeklyPoints || 0) + pointsToAward;
    const newWasteDiverted = (student.wasteDivertedKg || 0) + (quantity * 0.2);
    const newCo2 = (student.co2SavedKg || 0) + (quantity * 0.5);

    // Update in memory cache
    student.points = newPoints;
    student.weeklyPoints = newWeeklyPoints;
    student.wasteDivertedKg = newWasteDiverted;
    student.co2SavedKg = newCo2;

    // Persist to Firestore
    try {
      const clean = String(student.grNo).replace(/^(eco)[-_]?/i, '').trim();
      const docRef = doc(db, 'students', clean);
      await updateDoc(docRef, {
        points: increment(pointsToAward),
        weeklyPoints: increment(pointsToAward),
        wasteDivertedKg: increment(quantity * 0.2),
        co2SavedKg: increment(quantity * 0.5),
        updatedAt: new Date().toISOString(),
      });
      console.log(`[SMART BIN DISPOSAL LOGGED] +${pointsToAward} pts awarded to ${student.name} (${student.grNo}) via Raspberry Pi`);
    } catch (err: any) {
      console.warn('[SMART BIN RECORD UPDATE WARNING]', err?.message);
    }

    return res.json({
      success: true,
      message: `Recorded ${quantity} disposal(s) for ${student.name} (+${pointsToAward} Verde points awarded).`,
      ecoNumber: student.grNo,
      studentName: student.name,
      pointsAwarded: pointsToAward,
      totalPoints: newPoints,
      binId,
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/logo-status', (req, res) => {
    try {
      const statusFile = path.join(process.cwd(), 'public/logo-status.json');
      if (fs.existsSync(statusFile)) {
        const data = JSON.parse(fs.readFileSync(statusFile, 'utf-8'));
        return res.json(data);
      }
      return res.json({ isLocked: false });
    } catch {
      return res.json({ isLocked: false });
    }
  });

  app.post('/api/logo-status', (req, res) => {
    try {
      const { isLocked } = req.body;
      const statusFile = path.join(process.cwd(), 'public/logo-status.json');
      fs.writeFileSync(statusFile, JSON.stringify({ isLocked: Boolean(isLocked) }));
      return res.json({ success: true, isLocked: Boolean(isLocked) });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message });
    }
  });

  app.post('/api/upload-logo', (req, res) => {
    try {
      const { dataUrl, isLocked = true } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: 'Missing dataUrl' });
      }
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid data URL format' });
      }
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(path.join(process.cwd(), 'public/logo.jpg'), buffer);
      fs.writeFileSync(path.join(process.cwd(), 'public/logo.png'), buffer);
      fs.writeFileSync(path.join(process.cwd(), 'public/favicon.jpg'), buffer);
      fs.writeFileSync(path.join(process.cwd(), 'src/assets/images/verdetech_official_logo.jpg'), buffer);
      
      const statusFile = path.join(process.cwd(), 'public/logo-status.json');
      fs.writeFileSync(statusFile, JSON.stringify({ isLocked: Boolean(isLocked) }));

      console.log('[LOGO UPDATE] User uploaded custom logo written and locked status saved');
      return res.json({ success: true, message: 'Logo updated and locked successfully', isLocked: Boolean(isLocked) });
    } catch (e: any) {
      console.error('[LOGO UPDATE ERROR]', e);
      return res.status(500).json({ error: e?.message || 'Failed to save logo' });
    }
  });

  app.post('/api/upload-bin', (req, res) => {
    try {
      const { dataUrl } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: 'Missing dataUrl' });
      }
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid data URL format' });
      }
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(path.join(process.cwd(), 'public/smart_eco_bin.jpg'), buffer);
      console.log('[SMART BIN UPDATE] User uploaded smart bin photo saved to public/smart_eco_bin.jpg');
      return res.json({ success: true, message: 'Smart Bin photo updated successfully' });
    } catch (e: any) {
      console.error('[SMART BIN UPDATE ERROR]', e);
      return res.status(500).json({ error: e?.message || 'Failed to save smart bin photo' });
    }
  });

  app.post('/api/send-verification', async (req, res) => {
    const { email, studentName } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes TTL

    verificationCodes.set(cleanEmail, {
      code,
      expiresAt,
      studentName: studentName || 'Student',
    });

    if (db) {
      try {
        await setDoc(doc(db, 'pending_verifications', cleanEmail), {
          email: cleanEmail,
          code,
          expiresAt,
          studentName: studentName || 'Student',
          updatedAt: Date.now(),
        });
      } catch (dbErr) {
        console.warn('[FIRESTORE VERIFY CACHE NOTICE]', dbErr);
      }
    }

    const mailResult = await sendEmailSafely({
      to: cleanEmail,
      subject: `VerdeTech Portal: Your Verification Code is ${code}`,
      text: `Hello ${studentName || 'Student'},\n\nYour 6-digit email verification code is: ${code}\n\nPlease enter this code in the portal to verify your email and pick your @username.\n\nVerde Tech Portal Administration`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 500px; background-color: #ffffff; color: #1e293b;">
          <h2 style="color: #059669; margin-top: 0; font-size: 22px;">🌿 Verde Tech Portal</h2>
          <p style="color: #334155; font-size: 15px;">Hello <strong>${studentName || 'Student'}</strong>,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">Here is your verification code to complete your Verde Tech registration:</p>
          
          <div style="background-color: #f0fdf4; border: 2px solid #059669; padding: 18px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #166534; font-weight: bold; margin-bottom: 6px;">Your 6-Digit Verification Code</div>
            <div style="font-size: 36px; font-weight: 900; color: #059669; font-family: monospace; letter-spacing: 6px;">${code}</div>
          </div>

          <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
            💡 <em>This code will expire in 15 minutes. Enter this code to verify your identity and set up your student username handle.</em>
          </p>
        </div>
      `,
    }, 'verify');

    console.log(`[VERIFY DISPATCH] Email: ${cleanEmail}, Code: ${code}, Delivered: ${mailResult.delivered}, Sender: ${mailResult.sender}`);

    res.json({
      success: true,
      delivered: mailResult.delivered,
      sender: mailResult.sender,
      error: mailResult.delivered ? undefined : mailResult.error,
    });
  });

  app.post('/api/verify-code', async (req, res) => {
    const { email, code, studentName, username, password } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    let stored = verificationCodes.get(cleanEmail);

    // If memory map didn't have it (e.g. server restart), check Firestore
    if (!stored && db) {
      try {
        const snap = await getDoc(doc(db, 'pending_verifications', cleanEmail));
        if (snap.exists()) {
          stored = snap.data() as StoredVerification;
        }
      } catch (err) {
        console.warn('[FIRESTORE VERIFY LOOKUP NOTICE]', err);
      }
    }

    if (!stored) {
      return res.status(400).json({
        success: false,
        error: 'No active verification code found for this email. Please click Resend Code to request a fresh code.',
      });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(cleanEmail);
      if (db) {
        try { await setDoc(doc(db, 'pending_verifications', cleanEmail), { expired: true }, { merge: true }); } catch {}
      }
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired (15 minute validity). Please click Resend Code.',
      });
    }

    if (stored.code !== cleanCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code. Please check your inbox and enter the 6-digit code received.',
      });
    }

    // Code verified successfully! Clean up pending code
    verificationCodes.delete(cleanEmail);
    if (db) {
      try {
        await setDoc(doc(db, 'pending_verifications', cleanEmail), { verified: true, verifiedAt: Date.now() }, { merge: true });
      } catch {}
    }

    const userName = studentName || stored.studentName || 'Student';
    const userHandle = username ? String(username).replace(/^@/, '') : 'student_user';
    const userPass = password || 'N/A';

    sendEmailSafely({
      to: cleanEmail,
      subject: 'Welcome to VERDE TECH PORTAL - Your Account Details',
      text: `Hi ${userName},\n\nWelcome to the VERDE TECH PORTAL! Here are your account credentials:\n\nUsername: @${userHandle}\nEmail ID: ${cleanEmail}\nPassword: ${userPass}\n\nYou can sign in using your Email ID and Password.\n\nThank you for joining our student sustainability network!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 500px; background-color: #ffffff;">
          <h2 style="color: #059669; margin-top: 0; font-size: 20px;">🌿 VERDE TECH PORTAL</h2>
          <p style="color: #334155; font-size: 15px; font-weight: 600;">Hi ${userName},</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">Welcome to <strong>VERDE TECH PORTAL</strong>! Here are your registered student account credentials:</p>
          
          <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 14px; margin: 20px 0;">
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; display: block;">Username:</span>
              <strong style="font-size: 22px; font-family: monospace; color: #34d399;">@${userHandle}</strong>
            </div>
            <div style="margin-bottom: 12px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; display: block;">Email ID:</span>
              <strong style="font-size: 15px; color: #f8fafc;">${cleanEmail}</strong>
            </div>
            <div>
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; display: block;">Password:</span>
              <strong style="font-size: 20px; font-family: monospace; color: #38bdf8;">${userPass}</strong>
            </div>
          </div>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; color: #166534; font-size: 13px;">
            🔑 <strong>Sign-in Tip:</strong> You can sign in using your <strong>Email ID (${cleanEmail})</strong> and your password.
          </div>

          <p style="color: #64748b; font-size: 13px; margin-top: 20px;">Thank you for registering at the VERDE TECH PORTAL!</p>
        </div>
      `,
    }, 'credentials').catch((err) => console.warn('[CREDENTIALS MAIL NOTICE]', err));

    res.json({ success: true, delivered: true });
  });

  // Phone Verification Request Email Notification
  app.post('/api/send-unverified-phone-notice', async (req, res) => {
    const { ecoNumber = 'ECO-835902', email = 'subashiniompop@gmail.com', studentName = 'Student' } = req.body || {};

    const targetEcoNum = (ecoNumber || 'ECO-835902').trim();
    const targetEmail = (email || 'subashiniompop@gmail.com').trim().toLowerCase();
    const name = studentName || 'Student';

    const mailResult = await sendEmailSafely({
      from: `"VerdeTech Verification" <${process.env.VERIFY_GMAIL_USER || 'verifyverdetechsystems@gmail.com'}>`,
      to: targetEmail,
      subject: `🌿 Action Required: Phone Number Verification Pending for Eco Number ${targetEcoNum}`,
      text: `Hello ${name} (${targetEcoNum}),\n\nOur records show that your phone number on the Verde Tech Portal is currently unverified.\n\nPhone number verification is required to enable instant WhatsApp activity receipts, Smart Bin credits, and security alerts.\n\nPlease log in to your account with your Eco Number (${targetEcoNum}) and complete phone verification in your account settings.\n\nVerde Tech Portal Administration`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 520px; background-color: #ffffff; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0; font-size: 22px; font-weight: 800;">🌿 VERDE TECH PORTAL</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Official Campus Sustainability Platform</p>
          </div>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 0; color: #166534; font-size: 15px; font-weight: 700;">Action Required: Phone Number Verification Pending</p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Hello <strong>${name}</strong>,
          </p>

          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Our records indicate that the phone number associated with your Eco Number <strong>(${targetEcoNum})</strong> is currently unverified.
          </p>

          <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 14px; margin: 20px 0; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 4px;">Target Account Eco Number</div>
            <div style="font-size: 28px; font-weight: 900; font-family: monospace; color: #34d399; tracking-wider: 2px;">${targetEcoNum}</div>
            <div style="font-size: 12px; color: #fbbf24; margin-top: 8px; font-weight: 600;">⚠️ Phone Status: Unverified</div>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Verifying your phone number enables:
          </p>
          <ul style="font-size: 13px; color: #475569; line-height: 1.7; padding-left: 20px;">
            <li>📲 <strong>Instant WhatsApp Activity & Credit Receipts</strong></li>
            <li>🗑️ <strong>Smart Bin Waste Disposal Notifications</strong></li>
            <li>🔒 <strong>Account Security & Password Recovery</strong></li>
          </ul>

          <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
            <a href="https://ais-dev-ozelth25owvbz47mjdzgbf-114607067012.europe-west1.run.app" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; inline-block: true;">Verify Phone Number Now</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            VERDE TECH PORTAL • Modern Campus Sustainability Platform
          </p>
        </div>
      `,
    }, 'verify');

    console.log(`[PHONE VERIFICATION NOTICE] Email sent to ${targetEmail} for Eco Number ${targetEcoNum}. Delivered: ${mailResult.delivered}`);

    res.json({
      success: true,
      ecoNumber: targetEcoNum,
      email: targetEmail,
      delivered: mailResult.delivered,
      error: mailResult.error,
    });
  });

  // Smart Bin Waste Disposal Request Notification
  app.post('/api/smart-bin-disposal', async (req, res) => {
    const { studentName, grNo, studentEmail, binId, notes, quantity, proofImageUrl } = req.body;
    
    if (!studentName || !grNo) {
      return res.status(400).json({ error: 'Student name and GR No are required' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com';

    const emailSubject = `[Smart Bin Verification Request] Disposal from ${studentName} (${grNo})`;
    const emailBodyText = `
Smart Bin Disposal Verification Request:

- Student: ${studentName}
- GR No: ${grNo}
- Student Email: ${studentEmail || 'N/A'}
- Smart Bin Location: ${binId || 'Smart Bin #1'}
- Disposals Count: ${quantity || 1}
- Notes / Proof: ${notes || 'Smart Bin waste disposal'}
- Proof Image URL: ${proofImageUrl || 'None provided'}
- Submission Time: ${new Date().toLocaleString()}

Please cross-check with your physical/smart bin records and award points to the respective student in the Verde Tech Admin Panel.
`;

    const emailBodyHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px;">
        <h2 style="color: #059669; margin-top: 0;">🗑️ Smart Bin Disposal Request</h2>
        <p>A student has logged a waste disposal in the Smart Bin and is requesting points verification.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Student:</td><td style="padding: 8px;">${studentName}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">GR No:</td><td style="padding: 8px;">${grNo}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Student Email:</td><td style="padding: 8px;">${studentEmail || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Smart Bin:</td><td style="padding: 8px;">${binId || 'Smart Bin #1'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Disposal Quantity:</td><td style="padding: 8px;">${quantity || 1} item(s)</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Notes:</td><td style="padding: 8px;">${notes || 'Smart Bin waste disposal'}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold;">Submitted At:</td><td style="padding: 8px;">${new Date().toLocaleString()}</td></tr>
        </table>
        ${proofImageUrl ? `<div style="margin-top: 15px;"><p><strong>Proof Photo:</strong></p><img src="${proofImageUrl}" style="max-width: 100%; border-radius: 8px;" /></div>` : ''}
        <div style="margin-top: 20px; padding: 12px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; color: #166534; font-size: 13px;">
          <strong>Action Required:</strong> Please cross-check this entry with your physical Smart Bin logs and credit the points in the Verde Tech app.
        </div>
      </div>
    `;

    try {
      const mailResult = await sendEmailSafely({
        from: `"VerdeTech Smart Bin Alert" <${process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com'}>`,
        to: adminEmail,
        subject: emailSubject,
        text: emailBodyText,
        html: emailBodyHtml,
      }, 'support');

      console.log(`Smart Bin verification request sent to ${adminEmail}. Delivered: ${mailResult.delivered}`);

      res.json({
        success: true,
        message: 'Your points request has been submitted and will be let known shortly. An email has been dispatched to the admin for cross-verification with the bin logs.',
        adminEmail,
        delivered: mailResult.delivered,
      });
    } catch (err) {
      console.error('Failed to send Smart Bin notification email:', err);
      // Still return success message so user UI knows request was recorded
      res.json({
        success: true,
        message: 'Your points request has been submitted and will be let known shortly.',
        adminEmail,
      });
    }
  });

  // =========================================================================
  // RASPBERRY PI SMART ECO BIN: DISPOSAL ANNOUNCEMENT & TELEMETRY
  // =========================================================================
  let latestRaspberryPiDisposal = {
    id: 'disp-01',
    username: 'dhruv_m',
    points: 50,
    timestamp: new Date().toLocaleTimeString(),
    message: 'recent disposal :50pts so credit to username (@dhruv_m) and credit'
  };

  app.get('/api/raspberry-pi/latest-disposal', (req, res) => {
    res.json({
      success: true,
      latestDisposal: latestRaspberryPiDisposal
    });
  });

  app.post('/api/raspberry-pi/disposal', (req, res) => {
    const { username, points, message } = req.body;
    const pts = Number(points) || 50;
    const uname = username || 'user';
    const msg = message || `recent disposal :${pts}pts so credit to username (@${uname}) and credit`;
    
    latestRaspberryPiDisposal = {
      id: `disp-${Date.now()}`,
      username: uname,
      points: pts,
      timestamp: new Date().toLocaleTimeString(),
      message: msg
    };

    console.log(`[Raspberry Pi Station 01] Broadcasted disposal: "${msg}"`);
    res.json({
      success: true,
      disposal: latestRaspberryPiDisposal,
      announcement: msg
    });
  });

  // =========================================================================
  // RASPBERRY PI SMART ECO BIN: BIN FILL LEVEL TELEMETRY & MAINTENANCE ALERT
  // =========================================================================
  let binStatusCache = new Map<string, any>([
    ['BIN-001', { id: 'BIN-001', location: 'Main Campus Entrance', fillLevel: 84, isFull: false, updatedAt: new Date().toISOString() }],
    ['BIN-002', { id: 'BIN-002', location: 'Science Lab Quad', fillLevel: 32, isFull: false, updatedAt: new Date().toISOString() }],
    ['BIN-003', { id: 'BIN-003', location: 'Cafeteria Hallway', fillLevel: 97, isFull: true, updatedAt: new Date().toISOString() }],
  ]);

  app.get('/api/raspberry-pi/bins', (req, res) => {
    res.json({
      success: true,
      bins: Array.from(binStatusCache.values())
    });
  });

  const handleUpdateBinFillLevel = async (req: express.Request, res: express.Response) => {
    try {
      const { binId, fillLevel, battery, temperature, status, location } = req.body;
      const targetBinId = binId || 'BIN-001';
      const numericFill = Number(fillLevel);

      if (isNaN(numericFill)) {
        return res.status(400).json({
          error: 'Invalid fillLevel',
          message: 'Please provide a valid numeric fillLevel (0-100).'
        });
      }

      const isFull = numericFill >= 90 || status === 'full' || status === 'FULL';
      const maintenanceEmail = 'subashiniompop@gmail.com';

      const updatedBin = {
        id: targetBinId,
        location: location || (binStatusCache.get(targetBinId)?.location || 'Campus Station'),
        fillLevel: numericFill,
        isFull,
        status: isFull ? '🚨 FULL - COLLECTION REQUIRED' : (numericFill >= 75 ? 'Near Full / Action Recommended' : 'Optimal / Normal'),
        battery: battery || '12.4V (94%)',
        temperature: temperature || '38.5°C',
        updatedAt: new Date().toISOString()
      };

      binStatusCache.set(targetBinId, updatedBin);

      let emailDelivered = false;
      if (isFull) {
        try {
          const emailSubject = `[SMART BIN FULL ALERT] Bin ${targetBinId} has reached ${numericFill}% capacity!`;
          const emailBodyText = `URGENT MAINTENANCE ALERT\\n\\nSmart Bin ID: ${targetBinId}\\nLocation: ${updatedBin.location}\\nCurrent Fill Level: ${numericFill}%\\nStatus: FULL - COLLECTION REQUIRED\\n\\nThe bin has reached its maximum threshold and needs to be emptied out immediately by the maintenance staff.\\n\\nThank you,\\nVerdeTech Maintenance System`;
          
          const emailBodyHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #fef2f2; border: 4px solid #dc2626;">
              <h2 style="color: #dc2626; text-transform: uppercase; margin-top: 0;">🚨 URGENT SMART BIN FULL ALERT</h2>
              <p style="font-size: 16px; color: #1f2937;">The Raspberry Pi smart bin telemetry reports that a bin requires immediate collection.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background: white;">
                <tr><td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">Smart Bin ID:</td><td style="padding: 10px; border: 1px solid #d1d5db;">${targetBinId}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">Location:</td><td style="padding: 10px; border: 1px solid #d1d5db;">${updatedBin.location}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">Fill Level:</td><td style="padding: 10px; border: 1px solid #d1d5db; color: #dc2626; font-weight: bold;">${numericFill}% (FULL)</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">Battery / Temp:</td><td style="padding: 10px; border: 1px solid #d1d5db;">${updatedBin.battery} | ${updatedBin.temperature}</td></tr>
                <tr><td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">Timestamp:</td><td style="padding: 10px; border: 1px solid #d1d5db;">${updatedBin.updatedAt}</td></tr>
              </table>
              <p style="margin-top: 20px; font-size: 14px; font-weight: bold; color: #991b1b;">Action Required: Please dispatch maintenance staff to empty out bin ${targetBinId} as soon as possible.</p>
              <hr style="border: none; border-top: 1px solid #fca5a5; margin: 20px 0;" />
              <p style="font-size: 12px; color: #6b7280;">VerdeTech Smart Eco Bin IoT Monitoring • Automated Alert to ${maintenanceEmail}</p>
            </div>
          `;

          const mailResult = await sendEmailSafely({
            from: `"VerdeTech Maintenance" <${process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com'}>`,
            to: maintenanceEmail,
            subject: emailSubject,
            text: emailBodyText,
            html: emailBodyHtml,
          }, 'support');

          emailDelivered = mailResult.delivered;
          console.log(`[MAINTENANCE ALERT] Bin ${targetBinId} is full (${numericFill}%). Alert email dispatched to ${maintenanceEmail}. Delivered: ${emailDelivered}`);
        } catch (mailErr) {
          console.error('[MAINTENANCE ALERT MAIL ERROR]', mailErr);
        }
      }

      return res.json({
        success: true,
        message: isFull ? `Bin is full! Alert email dispatched to ${maintenanceEmail}.` : `Fill level updated successfully (${numericFill}%).`,
        bin: updatedBin,
        alertDispatched: isFull,
        maintenanceEmail
      });
    } catch (err: any) {
      console.error('[RASPBERRY PI FILL LEVEL ERROR]', err);
      return res.status(500).json({ error: 'Failed to update fill level', details: err?.message });
    }
  };

  app.post('/api/raspberry-pi/fill-level', handleUpdateBinFillLevel);
  app.post('/api/smart-bin/fill-level', handleUpdateBinFillLevel);
  app.post('/api/bins/update-fill', handleUpdateBinFillLevel);

  // =========================================================================
  // RASPBERRY PI SMART ECO BIN: CREATE REDEEM CODE & STORE IN FIRESTORE
  // =========================================================================

  // In-memory cache for fast lookups & offline resilience
  const giftCardsCache = new Map<string, any>();

  // Real-time listener for giftCards collection in Firestore
  try {
    onSnapshot(collection(db, 'giftCards'), (snap) => {
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && (data.redeemCode || data.code)) {
          const clean = String(data.redeemCode || data.code).trim().toUpperCase();
          giftCardsCache.set(clean, data);
        }
      });
      console.log(`[FIREBASE] Synced ${snap.size} gift cards to backend cache`);
    }, (err) => {
      console.warn('[FIREBASE] Gift cards sync warning (operating in local mode):', err?.message);
    });
  } catch (e: any) {
    console.warn('[FIREBASE] Failed to attach gift cards listener:', e?.message);
  }

  // 1. POST endpoint for Raspberry Pi:
  // Exemplar request body:
  // {
  //   "redeemCode": "6930",
  //   "pointsGiven": 50
  // }
  const handleCreateRedeemCode = async (req: express.Request, res: express.Response) => {
    // Explicitly set CORS and JSON Content-Type headers for Raspberry Pi / Python / hardware clients
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    try {
      const body = req.body || {};
      const query = req.query || {};

      // Extremely flexible extraction from JSON body, URL-encoded body, or query parameters
      const rawCode =
        body.redeemCode ??
        body.code ??
        body.redeem_code ??
        body.giftCode ??
        body.giftCardCode ??
        body.n ??
        query.redeemCode ??
        query.code ??
        query.redeem_code ??
        query.giftCode ??
        query.n ??
        query.c;

      const rawPoints =
        body.pointsGiven ??
        body.points ??
        body.amount ??
        body.points_given ??
        body.pts ??
        query.pointsGiven ??
        query.points ??
        query.amount ??
        query.pts ??
        query.p;

      if (!rawCode || String(rawCode).trim() === '') {
        // If someone hits this with GET without parameters (e.g. testing in browser or curl), return friendly documentation
        if (req.method === 'GET') {
          return res.status(200).json({
            status: 'online',
            service: 'VerdeTech Raspberry Pi Redeem Code Generator',
            instructions: 'Send a POST request with JSON body {"redeemCode": "YOUR_CODE", "pointsGiven": 50}',
            curlExample: 'curl -X POST https://ais-dev-ozelth25owvbz47mjdzgbf-114607067012.europe-west1.run.app/api/redeem-code -H "Content-Type: application/json" -d \'{"redeemCode": "6930", "pointsGiven": 50}\'',
            pythonExample: "requests.post('https://ais-dev-ozelth25owvbz47mjdzgbf-114607067012.europe-west1.run.app/api/redeem-code', json={'redeemCode': '6930', 'pointsGiven': 50})"
          });
        }

        return res.status(400).json({
          success: false,
          error: 'Missing required field: redeemCode',
          message: 'Please provide a redeemCode in your POST body (e.g. {"redeemCode": "6930", "pointsGiven": 50}) or as a query parameter (?code=6930).',
          example: {
            redeemCode: '6930',
            pointsGiven: 50,
          },
        });
      }

      const redeemCode = String(rawCode).trim().toUpperCase();
      const pointsGiven = Number(rawPoints) && Number(rawPoints) > 0 ? Number(rawPoints) : 50;
      const docId = redeemCode.replace(/[^a-zA-Z0-9_-]/g, '_');
      const binId = body.binId || query.binId || 'Raspberry Pi Smart Eco Bin';

      const cardData = {
        code: redeemCode,
        redeemCode: redeemCode,
        pointsGiven: pointsGiven,
        points: pointsGiven,
        isRedeemed: false,
        status: 'active',
        binId: binId,
        source: 'Raspberry Pi',
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
        redeemedBy: null,
        redeemedByName: null,
        redeemedAt: null,
      };

      // 1. Immediately cache in backend memory for instantaneous redemption
      giftCardsCache.set(redeemCode, cardData);

      // 2. Persist to Firestore in 'giftCards' collection
      try {
        const cardRef = doc(db, 'giftCards', docId);
        await setDoc(cardRef, cardData, { merge: true });
        console.log(`[RASPBERRY PI] Successfully stored gift card ${redeemCode} (${pointsGiven} pts) in Firestore`);
      } catch (dbErr: any) {
        console.warn(`[RASPBERRY PI WARNING] Firestore write failed, kept in cache:`, dbErr?.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Gift Card created successfully in database',
        giftCard: {
          redeemCode: cardData.redeemCode,
          pointsGiven: cardData.pointsGiven,
          status: cardData.status,
          createdAt: cardData.createdAt,
          source: cardData.source,
        },
      });
    } catch (err: any) {
      console.error('[RASPBERRY PI ERROR]', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to create redeem code',
        details: err?.message || String(err),
      });
    }
  };

  // Support multiple route paths (both with /api/ prefix and directly at root)
  const redeemRoutes = [
    '/api/redeem-code',
    '/redeem-code',
    '/api/redeemCode',
    '/redeemCode',
    '/api/create-redeem-code',
    '/create-redeem-code',
    '/api/createRedeemCode',
    '/createRedeemCode',
    '/api/gift-card',
    '/gift-card',
    '/api/giftCard',
    '/giftCard',
    '/api/smart-bin/redeem-code',
    '/smart-bin/redeem-code',
    '/api/smart-bin/create-code',
    '/smart-bin/create-code',
  ];

  redeemRoutes.forEach((route) => {
    app.all(route, handleCreateRedeemCode);
  });
  app.post('/api/gift-cards', handleCreateRedeemCode);
  app.post('/gift-cards', handleCreateRedeemCode);

  // 2. GET endpoint to list or verify gift cards
  app.get('/api/gift-cards', async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'giftCards'));
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      return res.json({ total: list.length, giftCards: list });
    } catch {
      return res.json({ total: giftCardsCache.size, giftCards: Array.from(giftCardsCache.values()) });
    }
  });

  app.get('/api/gift-cards/:code', async (req, res) => {
    try {
      const clean = String(req.params.code).trim().toUpperCase();
      const docId = clean.replace(/[^a-zA-Z0-9_-]/g, '_');

      let card = giftCardsCache.get(clean);
      if (!card) {
        try {
          const snap = await getDoc(doc(db, 'giftCards', docId));
          if (snap.exists()) {
            card = snap.data();
            giftCardsCache.set(clean, card);
          }
        } catch {}
      }

      if (!card) {
        return res.status(404).json({ exists: false, error: 'Gift card not found' });
      }

      return res.json({
        exists: true,
        redeemCode: card.redeemCode || card.code,
        pointsGiven: card.pointsGiven || card.points || 50,
        isRedeemed: Boolean(card.isRedeemed),
        status: card.status || (card.isRedeemed ? 'redeemed' : 'active'),
        createdAt: card.createdAt,
        redeemedAt: card.redeemedAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message });
    }
  });

  // 3. POST endpoint for website users to redeem the code and receive points
  app.post('/api/redeem-gift-card', async (req, res) => {
    try {
      const { code, grNo, studentName } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Redeem code is required' });
      }
      if (!grNo) {
        return res.status(400).json({ error: 'User ECO Number / GR No is required' });
      }

      const cleanCode = String(code).trim().toUpperCase();
      const docId = cleanCode.replace(/[^a-zA-Z0-9_-]/g, '_');

      // Find in cache or Firestore
      let card = giftCardsCache.get(cleanCode);
      const cardRef = doc(db, 'giftCards', docId);

      try {
        const snap = await getDoc(cardRef);
        if (snap.exists()) {
          card = snap.data();
        }
      } catch (e: any) {
        console.warn('[REDEEM] Firestore getDoc failed, using cache:', e?.message);
      }

      if (!card) {
        return res.status(404).json({
          error: `Invalid gift code "${cleanCode}". No active Gift Card found in database.`,
        });
      }

      if (card.expiresAt && Date.now() > card.expiresAt) {
        return res.status(400).json({ error: 'This gift code has expired.' });
      }

      // if (card.isRedeemed) {
      //   return res.status(400).json({
      //     error: `This gift code has already been redeemed${card.redeemedByName ? ' by ' + card.redeemedByName : ''}.`,
      //     redeemedAt: card.redeemedAt,
      //     redeemedBy: card.redeemedBy,
      //   });
      // }

      const pointsToAward = Number(card.pointsGiven || card.points || 50);

      // 1. Update card in memory & Firestore
      const updatedCard = {
        ...card,
        isRedeemed: true,
        status: 'redeemed',
        redeemedBy: grNo,
        redeemedByName: studentName || 'Student',
        redeemedAt: new Date().toISOString(),
      };
      giftCardsCache.set(cleanCode, updatedCard);

      try {
        await updateDoc(cardRef, {
          isRedeemed: true,
          status: 'redeemed',
          redeemedBy: grNo,
          redeemedByName: studentName || 'Student',
          redeemedAt: new Date().toISOString(),
        });
      } catch (err: any) {
        try {
          await setDoc(cardRef, updatedCard, { merge: true });
        } catch {}
      }

      // 2. Increment student points directly in Firestore
      const cleanGr = String(grNo).trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const studentRef = doc(db, 'students', cleanGr);
      try {
        await updateDoc(studentRef, {
          points: increment(pointsToAward),
          weeklyPoints: increment(pointsToAward),
          updatedAt: new Date().toISOString(),
        });
      } catch {
        try {
          const sSnap = await getDoc(studentRef);
          if (sSnap.exists()) {
            const curr = sSnap.data();
            await setDoc(studentRef, {
              ...curr,
              points: (curr.points || 0) + pointsToAward,
              weeklyPoints: (curr.weeklyPoints || 0) + pointsToAward,
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        } catch {}
      }

      // Also update in studentsCache Map if present
      if (studentsCache.has(grNo)) {
        const cached = studentsCache.get(grNo);
        cached.points = (cached.points || 0) + pointsToAward;
        cached.weeklyPoints = (cached.weeklyPoints || 0) + pointsToAward;
      }

      // 3. Create activity log in Firestore
      try {
        const logId = `log-pi-card-${Date.now()}`;
        await setDoc(doc(db, 'logs', logId), {
          id: logId,
          grNo: grNo,
          studentName: studentName || 'Student',
          challengeId: 'challenge-gift-code',
          challengeTitle: `Smart Bin Gift Card (${cleanCode})`,
          category: 'Recycling',
          quantity: 1,
          unitLabel: 'Deposit Code',
          pointsEarned: pointsToAward,
          co2SavedKg: 0.45,
          waterSavedLiters: 1.2,
          wasteDivertedKg: 0.35,
          energySavedKwh: 0.8,
          status: 'Approved',
          timestamp: new Date().toISOString(),
          proofNote: `Redeemed Raspberry Pi Smart Eco Bin gift code ${cleanCode}.`,
          cheersCount: 0,
          reactions: { cheer: 0, fire: 0, leaf: 0 },
        }, { merge: true });
      } catch {}

      console.log(`[GIFT CARD REDEEMED] Code ${cleanCode} redeemed by ${grNo}. Awarded +${pointsToAward} pts.`);

      return res.json({
        success: true,
        pointsAwarded: pointsToAward,
        code: cleanCode,
        message: `Successfully redeemed! +${pointsToAward} Verde Points added to your account.`,
      });
    } catch (err: any) {
      console.error('[REDEEM ERROR]', err);
      return res.status(500).json({ error: 'Failed to redeem gift card', details: err?.message });
    }
  });

  // API Route for Support & Troubleshooting Chatbot
  app.post('/api/support-chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!apiKey) {
        // Fallback intelligent troubleshooting response if no GEMINI_API_KEY
        const lower = message.toLowerCase();
        let fallbackReply = "I'm your Eco Portal Assistant! Here is how to fix common issues:\n\n" +
          "1. **Profile Photo Not Updating**: Go to My Profile > Edit Profile > Click the Camera icon > Upload a image under 5MB > Click Save Profile.\n" +
          "2. **Details Not Updating**: Ensure all required fields (Name, Department, GR No) are filled and press 'Save Profile'.\n" +
          "3. **ECO Feed Posting Issue**: Select an activity category, write at least 5 characters in your caption, and click Publish.\n" +
          "4. **Login/Credentials**: Use 'Request Credentials' on login screen to get your ECO number emailed to you.\n\n" +
          "If your issue persists, you can submit a direct report under the 'Report Issue' tab!";

        if (lower.includes('photo') || lower.includes('image') || lower.includes('avatar') || lower.includes('picture')) {
          fallbackReply = "📷 **How to Fix Profile Photo Update Issue**:\n\n" +
            "1. Navigate to **My Profile** or **Dashboard**.\n" +
            "2. Click on **Edit Profile**.\n" +
            "3. Click the **Camera icon** on your profile picture.\n" +
            "4. Choose a image file (JPEG, PNG, or WEBP under 5MB).\n" +
            "5. Click **Save Profile** to lock in your new avatar photo.\n\n" +
            "If it fails, try clearing browser cache or re-logging into your account.";
        } else if (lower.includes('detail') || lower.includes('name') || lower.includes('department') || lower.includes('info')) {
          fallbackReply = "👤 **How to Fix Profile Details Update Issue**:\n\n" +
            "1. Open **My Profile** tab.\n" +
            "2. Click **Edit Profile**.\n" +
            "3. Update your Name, Department, or Email address.\n" +
            "4. Click the green **Save Profile / Update Details** button.\n\n" +
            "Note: If your GR Number/ECO Number is locked, please use the **Report Issue** tab to request an admin update.";
        } else if (lower.includes('feed') || lower.includes('post') || lower.includes('community')) {
          fallbackReply = "📝 **How to Fix ECO Feed Posting Issue**:\n\n" +
            "1. Open the **ECO FEED** tab.\n" +
            "2. Click **+ Create New Post** or **Share Eco Action**.\n" +
            "3. Select an **Action Category** (e.g. Recycling, Tree Plantation).\n" +
            "4. Type a short description (at least 5 characters).\n" +
            "5. Optionally attach an image photo.\n" +
            "6. Click **Publish Post**.\n\n" +
            "If the button stays disabled, check that both a category and caption are entered!";
        } else if (lower.includes('point') || lower.includes('reward') || lower.includes('score')) {
          fallbackReply = "⭐ **Notice Regarding Verde Points**:\n\n" +
            "This Support Chatbot handles technical app issues and troubleshooting only. I **cannot** award or modify points directly.\n\n" +
            "To earn points:\n" +
            "- Log waste disposals in the **Smart Bin** section.\n" +
            "- Log verified actions under **Log Activity**.\n" +
            "- Participate in campus competitions.";
        }

        return res.json({ reply: fallbackReply, isAiGenerated: false });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are the friendly, expert AI Technical Support Assistant for the "Verde Tech Portal" web application.
Your goal is to help students and staff fix user interface issues, troubleshoot account problems, and guide them through using the portal.

CRITICAL INSTRUCTION:
- You strictly assist with TECHNICAL APP TROUBLESHOOTING and usage guidance.
- You CANNOT and MUST NOT award points, alter eco-point balances, or approve verification submissions directly.
- If a user asks for free points or points adjustments, politely explain that points are earned via verified activity logs and smart bin disposals, and that you are an issue fix assistant.

Common Issues & How to Resolve Them:
1. **Profile Photo Not Updating**:
   - Guide user to "My Profile" > "Edit Profile" > click camera overlay on avatar > upload JPG/PNG/WEBP under 5MB > click "Save Profile".
   - Suggest re-logging or checking image file size if error occurs.
2. **Details Not Updating**:
   - Guide user to "My Profile" > "Edit Profile" > fill required Name, Department, Email > click "Save Profile".
   - Mention that GR Number / Eco Number is locked for security and requires Admin help via "Report Issue".
3. **Cannot Make a Post on ECO FEED**:
   - Guide user to "ECO FEED" tab > click "+ Create New Post".
   - Ensure they select an Action Category, write at least 5 characters in caption, and optionally upload a photo proof.
   - Ensure the "Publish" button is clicked.
4. **Forgot Credentials / Cannot Log In**:
   - Direct them to click "Request Credentials" or "Forgot Login" on the login screen to get their Eco Number and password dispatched to their email.
5. **Reporting Unresolved Bugs**:
   - Suggest opening the "Report Issue" tab in the app to attach screenshots and alert the admin directly via email.

Tone: Professional, empathetic, helpful, well-structured with clear bullet points and bold headers. Keep answers concise (100-200 words).`;

      // Build chat prompt
      let formattedPrompt = `${systemInstruction}\n\n`;

      if (Array.isArray(history) && history.length > 0) {
        formattedPrompt += `Recent Conversation History:\n`;
        history.slice(-6).forEach((h: any) => {
          formattedPrompt += `${h.role === 'user' ? 'User' : 'Support Bot'}: ${h.text}\n`;
        });
      }

      formattedPrompt += `User Question: "${message}"\nSupport Bot Answer:`;

      const response = await (async () => {
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: formattedPrompt,
          });
          if (res?.text) return res;
        } catch (e: any) {
          console.warn(`Gemini API high demand / fallback engaged in support-chat:`, e?.message || e);
        }
        return null;
      })();

      if (response?.text) {
        return res.json({
          reply: response.text,
          isAiGenerated: true,
        });
      }

      // Smart rule-based fallback when Gemini API experiences temporary high-demand 503s
      const lower = message.toLowerCase();
      let fallbackReply = "I'm your Eco Portal Assistant! Here is how to fix common issues:\n\n" +
        "1. **Profile Photo Not Updating**: Go to My Profile > Edit Profile > Click the Camera icon > Upload an image under 5MB > Click Save Profile.\n" +
        "2. **Details Not Updating**: Ensure all required fields (Name, Department) are filled and press 'Save Profile'.\n" +
        "3. **ECO Feed Posting Issue**: Select an activity category, write at least 5 characters in your caption, and click Publish.\n" +
        "4. **Login/Credentials**: Use 'Request Credentials' on the login screen to get your ECO number sent to your email.\n\n" +
        "If your issue persists, click 'Report Issue' in the menu to notify the admin directly!";

      if (lower.includes('photo') || lower.includes('image') || lower.includes('avatar') || lower.includes('picture')) {
        fallbackReply = "📷 **How to Fix Profile Photo Update Issue**:\n\n" +
          "1. Navigate to **My Profile** or **Dashboard**.\n" +
          "2. Click on **Edit Profile**.\n" +
          "3. Click the **Camera icon** on your profile picture.\n" +
          "4. Choose an image file (JPEG, PNG, or WEBP under 5MB).\n" +
          "5. Click **Save Profile** to lock in your new photo.\n\n" +
          "If it fails, try re-logging into your account or clearing browser cache.";
      } else if (lower.includes('detail') || lower.includes('name') || lower.includes('department') || lower.includes('info')) {
        fallbackReply = "👤 **How to Fix Profile Details Update Issue**:\n\n" +
          "1. Open **My Profile** tab.\n" +
          "2. Click **Edit Profile**.\n" +
          "3. Update your Name, Department, or Email address.\n" +
          "4. Click the green **Save Profile / Update Details** button.\n\n" +
          "Note: If your GR Number/ECO Number is locked, please use the **Report Issue** tab to request an admin update.";
      } else if (lower.includes('feed') || lower.includes('post') || lower.includes('community')) {
        fallbackReply = "📝 **How to Fix ECO Feed Posting Issue**:\n\n" +
          "1. Open the **ECO FEED** tab.\n" +
          "2. Click **+ Create New Post** or **Share Eco Action**.\n" +
          "3. Select an **Action Category** (e.g. Recycling, Tree Plantation).\n" +
          "4. Type a short description (at least 5 characters).\n" +
          "5. Optionally attach an image photo.\n" +
          "6. Click **Publish Post**.\n\n" +
          "If the button stays disabled, check that both a category and caption are entered!";
      }

      return res.json({
        reply: fallbackReply,
        isAiGenerated: false,
      });
    } catch (err: any) {
      console.error('Error in /api/support-chat:', err?.message || err);
      return res.json({
        reply: "I encountered a minor connection glitch while analyzing your issue. Here are quick troubleshooting steps:\n\n- **Profile Photo**: My Profile > Edit Profile > Click Camera > Upload Image (<5MB) > Save.\n- **Details**: Ensure all mandatory fields are filled out before saving.\n- **ECO Feed**: Pick a category and enter text before publishing.\n\nNeed direct assistance? Click 'Report Issue' in the menu to notify the administrator!",
        isAiGenerated: false,
      });
    }
  });

  // API Route for AI Eco Tips & Verification Advice
  app.post('/api/ai-tips', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { grNo, studentName, actionTitle, proofNote } = req.body;

      if (!apiKey) {
        return res.json({
          tip: `Great work, ${studentName || 'Eco Hero'}! Every action counts towards campus sustainability. Tip: Keep logging actions regularly to boost your weekly total!`,
          verificationFeedback: 'Proof note looks good and demonstrates genuine sustainability impact.',
          suggestedNextAction: 'Try biking to campus or starting an e-waste drive this week!',
          isAiGenerated: false
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the Campus Sustainability Advisor for a school/university Verde Tech program.
Student Name: ${studentName || 'Student'}
GR Number: ${grNo || 'N/A'}
Action Being Logged: ${actionTitle || 'Sustainability Task'}
Student's Proof Note: "${proofNote || 'Logged eco action'}"

Provide a motivating, 2-sentence feedback message encouraging them, plus 1 short pro-tip on how to maximize ecological impact (e.g., CO2 reduction, water conservation, or zero waste). Return clean JSON:
{
  "tip": "motivating message",
  "verificationFeedback": "brief validation of proof note",
  "suggestedNextAction": "suggested next challenge"
}`;

      let responseText: string | undefined;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response?.text) {
          responseText = response.text;
        }
      } catch (e: any) {
        console.warn(`Gemini API high demand in ai-tips:`, e?.message || e);
      }

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json({ ...parsed, isAiGenerated: true });
        } catch {
          // JSON parse failed, fall through to fallback
        }
      }

      return res.json({
        tip: `Great work, ${studentName || 'Eco Hero'}! Every action counts towards campus sustainability. Tip: Keep logging actions regularly to boost your weekly total!`,
        verificationFeedback: 'Proof note looks good and demonstrates genuine sustainability impact.',
        suggestedNextAction: 'Try biking to campus or starting an e-waste drive this week!',
        isAiGenerated: false
      });
    } catch (err: any) {
      console.error('Error generating AI tips:', err?.message || err);
      return res.json({
        tip: 'Awesome commitment to sustainability! Keep pushing to the top of the campus leaderboard!',
        verificationFeedback: 'Action successfully verified for Verde points.',
        suggestedNextAction: 'Unplug phantom appliances in classrooms and labs today.',
        isAiGenerated: false
      });
    }
  });

  app.post('/api/request-credentials', async (req, res) => {
    const { email, studentName, username, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    try {
      const userName = studentName || 'Student';
      const userHandle = username ? String(username).replace(/^@/, '') : 'student_user';
      const userPass = password || '••••••••';

      const mailResult = await sendEmailSafely({
        from: `"VerdeTech Credentials" <${process.env.CREDENTIALS_GMAIL_USER || 'credentialsverdetech@gmail.com'}>`,
        to: email,
        subject: '🔑 Your Account Credentials - VERDE TECH PORTAL',
        text: `Hi ${userName},\n\nHere are your requested account credentials for VERDE TECH PORTAL:\n\n- Username: @${userHandle}\n- Email ID: ${email}\n- Password: ${userPass}\n\nYou can sign in using your Email ID and Password at the VERDE TECH PORTAL.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #cbd5e1; border-radius: 16px; max-width: 520px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #059669; font-size: 22px; margin: 0;">🌿 VERDE TECH PORTAL</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Account Credentials Recovery & Dispatch</p>
            </div>

            <p style="color: #334155; font-size: 15px; font-weight: 600; margin-bottom: 8px;">Hi ${userName},</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-top: 0;">
              You requested your account credentials for the <strong>VERDE TECH PORTAL</strong>. Here are your account details:
            </p>

            <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 14px; margin: 20px 0;">
              <div style="margin-bottom: 14px; border-bottom: 1px solid #334155; padding-bottom: 12px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; display: block; margin-bottom: 4px;">Student Handle (Username):</span>
                <strong style="font-size: 22px; font-family: monospace; color: #34d399;">@${userHandle}</strong>
              </div>
              <div style="margin-bottom: 14px; border-bottom: 1px solid #334155; padding-bottom: 12px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; display: block; margin-bottom: 4px;">Registered Email:</span>
                <strong style="font-size: 15px; color: #f8fafc;">${email}</strong>
              </div>
              <div>
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; display: block; margin-bottom: 4px;">Password:</span>
                <strong style="font-size: 20px; font-family: monospace; color: #38bdf8;">${userPass}</strong>
              </div>
            </div>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 12px; color: #166534; font-size: 13px; line-height: 1.5;">
              🔑 <strong>How to Sign In:</strong> Open the Verde Tech Portal and enter your <strong>Email ID (${email})</strong> along with your password.
            </div>

            <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
              This email was automatically sent following a credentials request on the Verde Tech Portal.
            </div>
          </div>
        `,
      }, 'credentials');

      console.log(`Credentials email dispatched to ${email}. Delivered: ${mailResult.delivered}`);

      return res.json({
        success: true,
        message: `Credentials have been sent to ${email}`,
        delivered: mailResult.delivered,
        error: mailResult.delivered ? undefined : mailResult.error,
      });
    } catch (err: any) {
      console.error('Failed to dispatch credentials email:', err);
      return res.status(500).json({ error: 'Failed to dispatch credentials email. Please try again.' });
    }
  });

  app.post('/api/report-issue', async (req, res) => {
    const { name, email, description, fileName, fileData, grNo, targetEmail } = req.body;
    if (!name || !email || !description) {
      return res.status(400).json({ error: 'Name, email, and description are required.' });
    }

    const recipient = targetEmail || process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com';

    try {
      const mailOptions: any = {
        from: `"VerdeTech Issue Alert" <${process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com'}>`,
        to: recipient,
        subject: `🚨 [ISSUE REPORT] ${name} (${grNo || 'User'}) - ${new Date().toLocaleDateString()}`,
        text: `URGENT ISSUE REPORT\n\nName: ${name}\nEmail: ${email}\nGR No: ${grNo || 'N/A'}\n\nDescription:\n${description}\n\nFile Attached: ${fileName || 'None'}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; border: 2px solid #ef4444; border-radius: 16px; max-width: 600px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #dc2626; font-size: 22px; margin: 0;">🚨 URGENT ISSUE REPORT</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Submitted via VERDE TECH PORTAL</p>
            </div>
            
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 4px 0; font-size: 14px; color: #991b1b;"><strong>Reporter Name:</strong> ${name}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #991b1b;"><strong>Reporter Email:</strong> <a href="mailto:${email}" style="color: #dc2626;">${email}</a></p>
              <p style="margin: 4px 0; font-size: 14px; color: #991b1b;"><strong>ECO Number / GR No:</strong> ${grNo || 'N/A'}</p>
            </div>

            <h3 style="color: #1e293b; font-size: 15px; margin-bottom: 8px;">Issue Description:</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${description}</div>

            ${fileName ? `
              <div style="margin-top: 16px; padding: 12px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; font-size: 13px; color: #9f1239;">
                📎 <strong>Attached Document / Screenshot:</strong> ${fileName}
              </div>
            ` : ''}

            <div style="margin-top: 24px; border-top: 1px solid #f1f5f9; pt-16; text-align: center; font-size: 12px; color: #94a3b8;">
              This notification was generated directly by the Verde Tech Portal issue management system.
            </div>
          </div>
        `,
      };

      if (fileName && fileData && fileData.includes(',')) {
        const base64Content = fileData.split(',')[1];
        mailOptions.attachments = [
          {
            filename: fileName,
            content: base64Content,
            encoding: 'base64',
          },
        ];
      }

      const mailResult = await sendEmailSafely(mailOptions, 'support');
      console.log(`Issue report sent to ${recipient}. Delivered: ${mailResult.delivered}`);

      // Send automated acknowledgment to reporter
      if (email && email.includes('@')) {
        const ackMailOptions = {
          from: `"Verde Tech Support" <${process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com'}>`,
          to: email,
          subject: `[Verde Tech Support] We received your report - Response in 24 to 48 Hours`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 600px; background-color: #ffffff; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #059669; font-size: 22px; margin: 0;">Verde Tech Support Center</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Ticket Received & Under Review</p>
              </div>

              <p style="font-size: 15px; font-weight: bold;">Hello ${name},</p>
              <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                Thank you for contacting us. We have successfully received your issue report regarding <strong>${grNo ? `Account GR #${grNo}` : 'the Eco Points Portal'}</strong>.
              </p>

              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: bold;">
                  ⏱️ Response Time Commitment: 24 to 48 Hours
                </p>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #047857;">
                  Our support team will review your report and reply directly to this email address within 24 to 48 business hours.
                </p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 13px; color: #475569;">
                <p style="margin: 0 0 6px 0; font-weight: bold; color: #1e293b;">Need Immediate Assistance?</p>
                <p style="margin: 3px 0;">📱 <strong>WhatsApp & Direct Call:</strong> +968 9548 1981</p>
                <p style="margin: 3px 0;">✉️ <strong>Official Email:</strong> verdetech001@gmail.com</p>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
                Verde Tech Portal & Campus Sustainability • Oman
              </div>
            </div>
          `,
        };
        sendEmailSafely(ackMailOptions, 'support').catch((ackErr) => {
          console.warn('Could not send reporter ack email:', ackErr);
        });
      }

      return res.json({ success: true, delivered: mailResult.delivered, error: mailResult.error });
    } catch (err: any) {
      console.error('Failed to send issue report email:', err);
      return res.status(500).json({ error: 'Failed to dispatch issue report.' });
    }
  });

  // Health and Status Check for 3-Account Mailers
  app.get('/api/mail-status', (req, res) => {
    const globalPass = (process.env.GMAIL_APP_PASSWORD || '').trim();
    const verifyPass = !!((process.env.VERIFY_GMAIL_APP_PASSWORD || globalPass).trim());
    const credsPass = !!((process.env.CREDENTIALS_GMAIL_APP_PASSWORD || globalPass).trim());
    const supportPass = !!((process.env.SUPPORT_GMAIL_APP_PASSWORD || globalPass).trim());

    res.json({
      accounts: {
        support: {
          email: process.env.SUPPORT_GMAIL_USER || 'verdetech001@gmail.com',
          role: 'Support & Issue Reports',
          configured: supportPass,
          secretName: 'SUPPORT_GMAIL_APP_PASSWORD',
        },
        credentials: {
          email: process.env.CREDENTIALS_GMAIL_USER || 'credentialsverdetech@gmail.com',
          role: 'Credentials & Eco Number Dispatch',
          configured: credsPass,
          secretName: 'CREDENTIALS_GMAIL_APP_PASSWORD',
        },
        verify: {
          email: process.env.VERIFY_GMAIL_USER || 'verifyverdetechsystems@gmail.com',
          role: 'Verification Codes & OTP',
          configured: verifyPass,
          secretName: 'VERIFY_GMAIL_APP_PASSWORD',
        },
      },
    });
  });

  // Fallback handler for all API requests to ensure JSON response (never HTML SPA)
  app.all('/api/*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.path}`,
      message: 'This endpoint was not recognized. Please check the URL or use POST /api/redeem-code.',
      availableEndpoints: [
        'POST /api/redeem-code',
        'GET /econumberExists?n=83152',
        'POST /smartBinDisposal',
        'POST /api/redeem-gift-card'
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
