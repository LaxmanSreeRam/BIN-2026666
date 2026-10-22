import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "halogen-gamma-pshk",
  appId: "1:42713573805:web:3d55b171c7071f34495924",
  apiKey: "AIzaSyChX53jktv2Ii9CHPbEfT1Er4cst7yWOEM",
  authDomain: "halogen-gamma-pshk.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-verdetechportal-1cd94cb5-c37b-438d-8e7c-f29b62c47683",
  storageBucket: "halogen-gamma-pshk.firebasestorage.app",
  messagingSenderId: "42713573805"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

    const cardRef = doc(db, 'giftCards', docId);
    await setDoc(cardRef, cardData, { merge: true });

    return res.status(201).json({
      success: true,
      message: 'Gift Card created successfully',
      giftCard: {
        redeemCode: cleanCode,
        pointsGiven: pts,
        status: 'active'
      },
    });

  } catch (err: any) {
    console.error('[VERCEL API CRASH ERROR]:', err);
    return res.status(500).json({
      success: false,
      error: 'Serverless execution failed',
      details: err?.message || String(err)
    });
  }
}
