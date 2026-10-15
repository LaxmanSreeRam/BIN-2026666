import { useState, useEffect } from 'react';
import defaultLogo from '../assets/images/verdetech_official_logo.jpg';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function getInitialLogo(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('verdetech_custom_logo');
    if (saved && (saved.startsWith('data:image/') || saved.startsWith('/'))) return saved;
  }
  return '/logo.jpg';
}

export function getInitialLockStatus(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('verdetech_logo_locked');
    if (saved !== null) return saved === 'true';
  }
  return false;
}

export function usePortalLogo(): [
  string,
  {
    isLocked: boolean;
    uploadAndLockLogo: (file: File) => Promise<boolean>;
    setLockStatus: (locked: boolean) => Promise<void>;
  }
] {
  const [logoSrc, setLogoSrc] = useState<string>(getInitialLogo);
  const [isLocked, setIsLocked] = useState<boolean>(getInitialLockStatus);

  // Sync with Firestore portalConfig/logo in real-time
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'portalConfig', 'logo'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.isLocked !== undefined) {
            setIsLocked(Boolean(data.isLocked));
            localStorage.setItem('verdetech_logo_locked', String(data.isLocked));
          }
          if (data.logoUrl && typeof data.logoUrl === 'string' && data.logoUrl.startsWith('data:image/')) {
            setLogoSrc(data.logoUrl);
            localStorage.setItem('verdetech_custom_logo', data.logoUrl);
          }
        }
      }, (err) => {
        const msg = err?.message || '';
        if (msg.includes('CANCELLED') || msg.includes('Call cancelled')) return;
        console.debug('[Logo Sync error]', msg);
      });
      return () => unsub();
    } catch (err) {
      console.warn('[Firebase] Could not subscribe to portalConfig/logo:', err);
    }
  }, []);

  const uploadAndLockLogo = async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          if (!dataUrl) throw new Error('Could not read image file');

          // 1. Update React state immediately
          setLogoSrc(dataUrl);
          setIsLocked(true);

          // 2. Persist to localStorage
          localStorage.setItem('verdetech_custom_logo', dataUrl);
          localStorage.setItem('verdetech_logo_locked', 'true');

          // 3. Send to Server to save on disk
          fetch('/api/upload-logo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl, isLocked: true })
          }).catch(console.error);

          // 4. Persist lock state & logoUrl to Firestore
          try {
            await setDoc(doc(db, 'portalConfig', 'logo'), {
              isLocked: true,
              logoUrl: dataUrl,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } catch (fireErr) {
            console.warn('[Firebase] Could not write lock status to firestore:', fireErr);
          }

          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const setLockStatus = async (locked: boolean) => {
    setIsLocked(locked);
    localStorage.setItem('verdetech_logo_locked', String(locked));
    try {
      await setDoc(doc(db, 'portalConfig', 'logo'), {
        isLocked: locked,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('[Firebase] Could not update lock status in Firestore:', err);
    }
  };

  return [logoSrc, { isLocked, uploadAndLockLogo, setLockStatus }];
}
