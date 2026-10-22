import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';


export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
      // Set CORS headers for Raspberry Pi / Python requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }


    // Initialize Firebase safely for serverless environment
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firebaseConfig.firestoreDatabaseId);

    const { redeemCode, code, pointsGiven, points, binId } = req.body || {};
    const rawCode = redeemCode || code;
    const rawPoints = pointsGiven || points;

    if (!rawCode || String(rawCode).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: redeemCode',
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

    // Save directly to Firestore
    const cardRef = doc(db, 'giftCards', docId);
    await setDoc(cardRef, cardData, { merge: true });

    console.log(`[VERCEL API] Gift card ${cleanCode} (${pts} pts) saved to Firestore.`);

    return res.status(201).json({
      success: true,
      message: 'Gift Card created successfully on Vercel',
      giftCard: {
        redeemCode: cleanCode,
        pointsGiven: pts,
        status: 'active',
      },
    });
  } catch (err: any) {
    console.error('[VERCEL API ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'Function execution failed',
      details: err?.message || String(err)
    });
  }




















}