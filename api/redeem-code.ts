import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './hi.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Always set CORS headers first so the Pi can read any response (even errors)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // 2. Wrap EVERYTHING in try/catch so runtime crashes return clean JSON to the Pi
  try {
    // Initialize Firebase safely inside the guarded block
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

    // Parse incoming payload safely
    const { redeemCode, code, pointsGiven, points, binId } = req.body || {};
    const rawCode = redeemCode || code;
    const rawPoints = pointsGiven || points;

    if (!rawCode || String(rawCode).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: redeemCode',
        receivedBody: req.body
      });
    }

    const cleanCode = String(rawCode).trim().toUpperCase();
    const pts = Number(rawPoints) && Number(rawPoints) > 0 ? Number(rawPoints) : 50;
    const docId = cleanCode.replace(/[^a-zA-Z0-9_-]/g, '_');

    const cardData = {
      code: cleanCode,
      redeemCode: cleanCode,
      pointsGiven: pts,
      points: pts,
      isRedeemed: false,
      status: 'active',
      binId: binId || 'Raspberry Pi Smart Eco Bin',
      source: 'Raspberry Pi',
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    // Attempt to write to Firestore
    const cardRef = doc(db, 'giftCards', docId);
    await setDoc(cardRef, cardData, { merge: true });

    console.log(`[VERCEL API SUCCESS] Gift card ${cleanCode} (${pts} pts) written to Firestore.`);

    return res.status(201).json({
      success: true,
      message: 'Gift Card created successfully on Vercel',
      giftCard: {
        redeemCode: cleanCode,
        pointsGiven: pts,
        status: 'active'
      },
    });

  } catch (err: any) {
    // If anything fails (Firebase config error, Firestore permission block, etc.),
    // it will be caught here and sent back to your Pi as JSON!
    console.error('[VERCEL API CRASH ERROR]:', err);
    return res.status(500).json({
      success: false,
      error: 'Serverless execution failed',
      details: err?.message || String(err),
      stack: err?.stack || undefined
    });
  }
}
