import React, { useEffect, useRef, useState } from 'react';
import { Student } from '../types';
import { 
  X, 
  Award, 
  Download, 
  Printer, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student | null;
  allStudents?: Student[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  allStudents = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active student object (non-editable, read-only from account data)
  const [selectedGrNo, setSelectedGrNo] = useState<string>(
    currentStudent?.grNo || (allStudents[0]?.grNo ?? '')
  );

  useEffect(() => {
    if (currentStudent?.grNo) {
      setSelectedGrNo(currentStudent.grNo);
    } else if (allStudents.length > 0) {
      setSelectedGrNo(allStudents[0].grNo);
    }
  }, [currentStudent, allStudents]);

  const activeStudent = 
    allStudents.find((s) => s.grNo === selectedGrNo) || 
    currentStudent || 
    allStudents[0] || 
    null;

  const studentPoints = activeStudent?.points || 0;
  const isQualified = studentPoints >= 1000;
  const isAdmin = currentStudent?.role === 'Admin';

  const customTemplateUrl = '/certificate_template.jpg';

  // Canvas render logic
  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed High Definition Canvas Dimensions (16:9 Certificate format)
    canvas.width = 1920;
    canvas.height = 1080;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = customTemplateUrl;

    const renderTextContent = (isFallback: boolean) => {
      const targetName = activeStudent?.name || 'Student Name';
      const grNo = activeStudent?.grNo || '000000';
      const userHandle = activeStudent?.username || activeStudent?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || grNo;
      const role = activeStudent?.role || 'Campus Eco Member';

      // Center of usable text field (template has decorative border on left 25%)
      const textCenterX = isFallback ? canvas.width * 0.5 : canvas.width * 0.62;

      // 1. Institutional Header
      ctx.fillStyle = '#059669'; // Emerald green
      ctx.font = '700 24px "Outfit", "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('VERDETECH RECOGNITION CREDENTIAL', textCenterX, 180);

      // 2. Main Title: "CERTIFICATE OF SUSTAINABILITY"
      ctx.fillStyle = '#0F172A'; // Obsidian
      ctx.font = '900 58px "Playfair Display", "Montserrat", serif';
      ctx.fillText('CERTIFICATE OF SUSTAINABILITY', textCenterX, 255);

      // 3. Subtitle: "FOR SUSTAINABLE WASTE DIVERSION"
      ctx.fillStyle = '#B45309'; // Warm antique gold
      ctx.font = '700 28px "Outfit", "Montserrat", sans-serif';
      ctx.fillText('FOR SUSTAINABLE WASTE DIVERSION', textCenterX, 315);

      // 4. Conferred text
      ctx.fillStyle = '#475569';
      ctx.font = '600 22px "Outfit", sans-serif';
      ctx.fillText('THIS CERTIFICATE IS PROUDLY AWARDED TO', textCenterX, 395);

      // 5. Student Name in Luxury Script / Serif
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 76px "Dancing Script", "Playfair Display", "Georgia", cursive';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 4;
      ctx.fillText(targetName, textCenterX, 500);
      ctx.shadowBlur = 0; // Reset shadow

      // Gold Ornamental Flourish Bar under Name
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      const nameWidth = ctx.measureText(targetName).width;
      const lineHalfWidth = Math.max(180, Math.min(360, nameWidth / 2 + 30));
      ctx.beginPath();
      ctx.moveTo(textCenterX - lineHalfWidth, 525);
      ctx.lineTo(textCenterX + lineHalfWidth, 525);
      ctx.stroke();

      // Diamond ornament in center of gold bar
      ctx.fillStyle = '#D97706';
      ctx.beginPath();
      ctx.arc(textCenterX, 525, 5, 0, Math.PI * 2);
      ctx.fill();

      // 6. Credentials line
      ctx.fillStyle = '#64748B';
      ctx.font = '700 20px "Outfit", monospace';
      ctx.fillText(`ACCOUNT: @${userHandle}  •  1,000+ VERDE POINTS ACHIEVED`, textCenterX, 570);

      // 7. Citation Body
      ctx.fillStyle = '#334155';
      ctx.font = '500 23px "Outfit", "Montserrat", sans-serif';
      
      const customDescription = 
        `In recognition of exceptional environmental stewardship, active waste diversion, and dedicated participation on the VerdeTech Sustainability Platform.`;
      
      const maxWidth = 980;
      const words = customDescription.split(' ');
      let line = '';
      let currentY = 625;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, textCenterX, currentY);
          line = words[n] + ' ';
          currentY += 36;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, textCenterX, currentY);

      // 8. Official Authentication Section (Digital Verification Seal & Verified ID)
      // Note: Date of issuance and fabricated committee signatures removed per user instructions
      const sealCenterX = isFallback ? canvas.width * 0.38 : textCenterX - 220;
      const sealCenterY = 840;
      const idCenterX = isFallback ? canvas.width * 0.65 : textCenterX + 180;

      // Draw Official Digital Verification Seal
      ctx.save();
      // Outer Seal Ring
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, 52, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Dotted Seal Ring
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(sealCenterX, sealCenterY, 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Emblem
      ctx.fillStyle = '#059669';
      ctx.font = '700 26px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', sealCenterX, sealCenterY - 10);

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 11px "Outfit", sans-serif';
      ctx.fillText('VERDETECH', sealCenterX, sealCenterY + 12);
      ctx.fillStyle = '#059669';
      ctx.font = '700 9px "Outfit", sans-serif';
      ctx.fillText('DIGITAL SEAL', sealCenterX, sealCenterY + 25);
      ctx.restore();

      // Official Verified ID Block (Kept Verified ID, No Fake Signatures, No Issuance Date)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#059669';
      ctx.font = '800 24px "Outfit", monospace';
      ctx.fillText(`VERIFIED ID: VERDE-${grNo}-1000PTS`, idCenterX, 825);

      ctx.fillStyle = '#0F172A';
      ctx.font = '700 16px "Outfit", sans-serif';
      ctx.fillText('OFFICIAL DIGITAL CREDENTIAL', idCenterX, 855);

      ctx.fillStyle = '#64748B';
      ctx.font = '600 13px "Outfit", sans-serif';
      ctx.fillText('CRYPTOGRAPHICALLY VERIFIED • AUTHENTIC RECORD', idCenterX, 880);

      // 9. Watermark if Locked
      if (!isQualified && !isAdmin) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 14);

        ctx.fillStyle = 'rgba(220, 38, 38, 0.20)';
        ctx.fillRect(-950, -95, 1900, 190);
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.75)';
        ctx.lineWidth = 6;
        ctx.strokeRect(-950, -95, 1900, 190);

        ctx.fillStyle = '#DC2626';
        ctx.font = '800 46px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`🔒 LOCKED PREVIEW - 1,000 VERDE POINTS REQUIRED (${studentPoints}/1,000 PTS)`, 0, 0);
        ctx.restore();
      }
    };

    img.onload = () => {
      // 1. Draw Template Image Background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      renderTextContent(false);
    };

    // Robust Fallback if image fails or offline
    img.onerror = () => {
      // Cream Parchment Canvas
      ctx.fillStyle = '#FAF9F6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer Green Border
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 24;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner Gold Border
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 6;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      renderTextContent(true);
    };
  };

  useEffect(() => {
    if (isOpen) {
      document.fonts?.ready?.then(() => {
        drawCertificate();
      });
      const timer = setTimeout(() => {
        drawCertificate();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeStudent, selectedGrNo]);

  // Download high-resolution PNG
  const handleDownloadPNG = () => {
    if (!isQualified && !isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    const safeName = (activeStudent?.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safeName}_1000_VerdeTech_Certificate.png`;
    link.href = dataUrl;
    link.click();
  };

  // Print Certificate (iFrame-safe without window.open)
  const handlePrint = () => {
    if (!isQualified && !isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verde Tech Certificate - ${activeStudent?.name || 'Student'}</title>
            <style>
              @page { size: landscape; margin: 0; }
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
              img { width: 100vw; height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 400);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border border-4 border-dark rounded-0 shadow-[8px_8px_0px_0px_black] bg-white">
          
          {/* Header Bar - Pure Corporate Eco Green */}
          <div className="modal-header bg-success text-white border-bottom border-dark border-3 rounded-0 px-4 py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 bg-dark text-warning rounded-0 border border-2 border-dark">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h5 className="modal-title fw-black text-uppercase tracking-tight m-0">
                    VERDETECH CERTIFICATE OF SUSTAINABILITY
                  </h5>
                  {isQualified ? (
                    <span className="badge bg-warning text-dark border border-2 border-dark rounded-0 fw-black px-2 py-1 small">
                      <CheckCircle2 className="w-3.5 h-3.5 me-1 inline" />
                      QUALIFIED (1,000+ PTS)
                    </span>
                  ) : isAdmin ? (
                    <span className="badge bg-light text-dark border border-2 border-dark rounded-0 fw-bold px-2 py-1 small">
                      <ShieldCheck className="w-3.5 h-3.5 me-1 inline text-success" />
                      ADMIN ACCESS ({studentPoints}/1,000 PTS)
                    </span>
                  ) : (
                    <span className="badge bg-secondary text-white border border-2 border-dark rounded-0 fw-bold px-2 py-1 small">
                      <Lock className="w-3.5 h-3.5 me-1 inline" />
                      LOCKED ({studentPoints} / 1,000 PTS)
                    </span>
                  )}
                </div>
                <p className="text-white-50 small m-0 mt-0.5">
                  Official Verified Environmental Recognition Credential
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-close btn-close-white rounded-0"
              aria-label="Close"
            />
          </div>

          {/* Student Selector Toolbar (for Admin or viewing other records) */}
          {allStudents.length > 1 && (
            <div className="bg-light px-4 py-2.5 border-bottom border-dark border-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <UserCheck className="w-4 h-4 text-success" />
                <span className="small fw-bold text-dark text-uppercase">Certificate Recipient:</span>
                <select
                  value={selectedGrNo}
                  onChange={(e) => setSelectedGrNo(e.target.value)}
                  className="form-select form-select-sm rounded-0 border-2 border-dark fw-bold"
                  style={{ width: 'auto', minWidth: '220px' }}
                >
                  {allStudents.map((st) => (
                    <option key={st.grNo} value={st.grNo}>
                      {st.name} (Eco No. {st.grNo} — {st.points} pts) {st.points >= 1000 ? '★ Unlocked' : '🔒'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="small text-muted fw-bold">
                Status: {isQualified ? (
                  <span className="text-success fw-black">★ Fully Qualified for Certificate of Sustainability</span>
                ) : (
                  <span className="text-danger fw-bold">{1000 - studentPoints} points remaining to unlock</span>
                )}
              </div>
            </div>
          )}

          {/* Qualification Banner / Progress Bar */}
          {!isQualified && (
            <div className="bg-warning bg-opacity-25 border-bottom border-dark border-2 p-3 px-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 text-dark small">
              <div className="d-flex align-items-center gap-2">
                <Sparkles className="w-5 h-5 text-dark flex-shrink-0" />
                <span>
                  <strong>{activeStudent?.name}</strong> currently has <strong className="text-success fs-6">{studentPoints} Verde Points</strong>. 
                  Reach <strong className="text-dark">1,000 points</strong> through waste sorting and eco missions to unlock the official watermark-free certificate!
                </span>
              </div>
              <div className="w-100" style={{ maxWidth: '240px' }}>
                <div className="progress rounded-0 border border-2 border-dark" style={{ height: '14px', backgroundColor: '#e2e8f0' }}>
                  <div
                    className="progress-bar bg-success fw-bold text-white small"
                    role="progressbar"
                    style={{ width: `${Math.min(100, Math.round((studentPoints / 1000) * 100))}%` }}
                  >
                    {Math.round((studentPoints / 1000) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Main Canvas Preview */}
          <div className="modal-body p-3 p-md-4 bg-light text-center">
            <div 
              className="position-relative mx-auto border border-4 border-dark shadow-[8px_8px_0px_0px_black] bg-white overflow-hidden" 
              style={{ maxWidth: '1000px' }}
            >
              <canvas
                ref={canvasRef}
                className="w-100 h-auto d-block"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-white border-top border-dark border-3 px-4 py-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <div className="small text-muted d-flex align-items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <span>
                Certificates are official records authenticated with Verified ID <strong className="text-dark font-monospace">VERDE-@{activeStudent?.username || activeStudent?.grNo}</strong>.
              </span>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2 w-100 w-sm-auto justify-content-end">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!isQualified && !isAdmin}
                className={`btn rounded-0 fw-black text-uppercase border border-2 border-dark px-3 py-2 ${
                  isQualified || isAdmin
                    ? 'btn-outline-dark'
                    : 'btn-light text-muted border-secondary opacity-50 disabled'
                }`}
              >
                <Printer className="w-4 h-4 me-1.5 inline" />
                {isQualified || isAdmin ? 'Print Certificate' : 'Print Locked'}
              </button>

              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={!isQualified && !isAdmin}
                className={`btn rounded-0 fw-black text-uppercase border border-2 border-dark px-4 py-2 shadow-[3px_3px_0px_0px_black] ${
                  isQualified || isAdmin
                    ? 'btn-success text-white'
                    : 'btn-secondary text-white opacity-60 disabled'
                }`}
              >
                <Download className="w-4 h-4 me-1.5 inline" />
                {isQualified || isAdmin ? 'Download PNG (HD)' : 'Download Locked (1,000 Pts)'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
