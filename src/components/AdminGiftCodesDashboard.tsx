import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { PlusCircle } from 'lucide-react';

export const AdminGiftCodesDashboard: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'giftCards'));
    const fetchedCodes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCodes(fetchedCodes);
    setLoading(false);
  };

  const generateCode = async () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    await addDoc(collection(db, 'giftCards'), {
      code: newCode,
      points: 50,
      redeemed: false,
      createdAt: new Date().toISOString()
    });
    fetchCodes();
  };

  const toggleRedeemed = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'giftCards', id), { redeemed: !currentStatus });
    fetchCodes();
  };

  return (
    <div className="p-4 bg-light">
      <h2 className="fw-black text-uppercase">Admin Redeem Codes</h2>
      <button onClick={generateCode} className="btn btn-primary my-3">
        <PlusCircle className="me-2" /> Generate Random 4-Digit Code
      </button>
      {loading ? <p>Loading...</p> : (
        <table className="table table-bordered bg-white">
          <thead>
            <tr>
              <th>Code</th>
              <th>Points</th>
              <th>Redeemed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.points}</td>
                <td>{c.redeemed ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleRedeemed(c.id, c.redeemed)} className="btn btn-sm btn-warning">
                    Toggle Redeem State
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
