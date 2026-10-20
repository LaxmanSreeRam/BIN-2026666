import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Paperclip, 
  Trash2, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  Copy, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  Zap,
  KeyRound,
  ShieldCheck,
  X
} from 'lucide-react';
import { Student } from '../types';
import { saveIssueToFirestore } from '../lib/firebaseSync';
import { getApiUrl } from '../utils/apiConfig';

interface SupportViewProps {
  currentStudent: Student | null;
  onOpenCredentials?: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ 
  currentStudent,
  onOpenCredentials 
}) => {
  const [name, setName] = useState(currentStudent?.name || '');
  const [email, setEmail] = useState(currentStudent?.email || '');
  const [grNo, setGrNo] = useState(currentStudent?.grNo || '');
  const [category, setCategory] = useState('Points Discrepancy');
  const [priority, setPriority] = useState<'Standard' | 'Urgent'>('Standard');
  const [description, setDescription] = useState('');
  const [attachedFile, setAttachedFile] = useState<{
    file: File;
    name: string;
    size: string;
    dataUrl?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    timestamp: string;
  } | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentStudent) {
      setName((prev) => prev || currentStudent.name || '');
      setEmail((prev) => prev || currentStudent.email || '');
      setGrNo((prev) => prev || currentStudent.grNo || '');
    }
  }, [currentStudent]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be under 5MB.');
      return;
    }

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile({
        file,
        name: file.name,
        size: sizeStr,
        dataUrl: reader.result as string,
      });
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address so we can reply.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please write details about the issue or question.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const ticketId = `VT-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    try {
      await fetch(getApiUrl('/api/report-issue'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          description: `[Category: ${category}] [Priority: ${priority}] [Ticket: ${ticketId}]\n\n${description.trim()}`,
          fileName: attachedFile ? attachedFile.name : null,
          fileData: attachedFile?.dataUrl || null,
          grNo: grNo.trim() || currentStudent?.grNo || 'N/A',
          targetEmail: 'verdetech001@gmail.com',
        }),
      });

      await saveIssueToFirestore({
        id: ticketId,
        name: name.trim(),
        email: email.trim(),
        category,
        description: description.trim(),
        grNo: grNo.trim() || currentStudent?.grNo || 'N/A',
        status: 'Open - Pending Review',
        timestamp,
      });

      setSubmittedTicket({
        ticketId,
        timestamp,
      });
    } catch (err: any) {
      console.error('Error reporting support issue:', err);
      setSubmittedTicket({
        ticketId,
        timestamp,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How long does it take for submitted Eco activities to be verified?',
      a: 'Activities submitted through the portal are reviewed and validated by teachers or student officers within 24 to 48 hours. Once approved, points, CO₂ offset, and water savings are instantly credited to your balance.',
    },
    {
      q: 'What should I do if my points or house score do not update?',
      a: 'Ensure your activity status is "Approved". If it has been more than 48 hours, submit an issue report in this Support section with your Activity Title and @Username.',
    },
    {
      q: 'How can I recover my lost Username or account password?',
      a: 'Use the "Credentials" button in the navigation header or click "Request Credentials" to have your credentials automatically dispatched to your registered email address.',
    },
    {
      q: 'How do I claim physical vouchers and store rewards?',
      a: 'Once you redeem a reward in the Rewards Store, an official unique redemption code is generated. Present this voucher code at the school Eco Office to collect your reward.',
    },
  ];

  return (
    <div className="container py-5 space-y-5">
      
      {/* Hero Banner - Eco Yellow */}
      <div className="card rounded-0 p-4 p-md-5 text-dark border border-4 border-dark shadow-[8px_8px_0px_0px_black]" style={{ backgroundColor: '#F0C020' }}>
        <div className="max-w-3xl space-y-3">
          <div className="badge bg-dark text-white fw-black px-3 py-2 rounded-0 text-uppercase border border-2 border-dark">
            <Headphones className="w-3.5 h-3.5 me-1 text-warning" />
            Dedicated Verde Tech Support
          </div>

          <h1 className="display-5 fw-black text-dark text-uppercase tracking-tight m-0">
            Help & Support Center
          </h1>

          <p className="text-dark fw-bold fs-6 m-0 opacity-90">
            Need help with your points, account access, activity verification, or smart bins? Report an issue directly below for a guaranteed response within <strong>24 to 48 hours</strong>, or reach out instantly via WhatsApp, phone, or email.
          </p>

          <div className="pt-2 d-flex flex-wrap gap-2">
            <span className="badge bg-white text-dark fw-bold px-3 py-2 rounded-0 border border-2 border-dark">
              <Clock className="w-4 h-4 text-danger me-1" /> Guaranteed reply within 24–48 hours
            </span>
            <span className="badge bg-white text-dark fw-bold px-3 py-2 rounded-0 border border-2 border-dark">
              <ShieldCheck className="w-4 h-4 text-success me-1" /> Official Verde Tech Team
            </span>
          </div>
        </div>
      </div>

      {/* 3 Quick Direct Contact Channels */}
      <div className="row g-4">
        
        {/* Channel 1: WhatsApp */}
        <div className="col-12 col-md-4">
          <div className="card h-100 rounded-0 border border-4 border-dark p-4 shadow-[6px_6px_0px_0px_black] bg-white d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-0 bg-success text-white p-2 border border-2 border-dark">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="badge bg-warning text-dark fw-black rounded-0 border border-2 border-dark text-uppercase">
                  24h Reply
                </span>
              </div>

              <h3 className="fw-black text-dark text-uppercase fs-5 mb-1">WhatsApp Support</h3>
              <p className="small text-muted mb-3">Chat directly with our VerdeTech Support Team.</p>

              <div className="p-2 bg-light border border-2 border-dark font-monospace fw-bold text-dark small d-flex align-items-center justify-content-between mb-3">
                <span>+968 9548 1981</span>
                <button
                  type="button"
                  onClick={() => handleCopy('+96895481981', 'whatsapp')}
                  className="btn btn-sm btn-outline-dark rounded-0 border-dark py-0 px-2"
                >
                  {copiedText === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <a
              href="https://wa.me/96895481981?text=Hello%20Verde%20Tech%20Support,%20I%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success fw-black text-uppercase rounded-0 border border-2 border-dark shadow-[2px_2px_0px_0px_black] w-100"
            >
              Open WhatsApp Chat <ExternalLink className="w-3.5 h-3.5 ms-1" />
            </a>
          </div>
        </div>

        {/* Channel 2: Phone Call */}
        <div className="col-12 col-md-4">
          <div className="card h-100 rounded-0 border border-4 border-dark p-4 shadow-[6px_6px_0px_0px_black] bg-white d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-0 bg-primary text-white p-2 border border-2 border-dark">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="badge bg-warning text-dark fw-black rounded-0 border border-2 border-dark text-uppercase">
                  Direct Call
                </span>
              </div>

              <h3 className="fw-black text-dark text-uppercase fs-5 mb-1">Direct Helpline</h3>
              <p className="small text-muted mb-3">Call our VerdeTech Support Team and resolve queries instantly.</p>

              <div className="p-2 bg-light border border-2 border-dark font-monospace fw-bold text-dark small d-flex align-items-center justify-content-between mb-3">
                <span>+968 9548 1981</span>
                <button
                  type="button"
                  onClick={() => handleCopy('+96895481981', 'call')}
                  className="btn btn-sm btn-outline-dark rounded-0 border-dark py-0 px-2"
                >
                  {copiedText === 'call' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <a
              href="tel:+96895481981"
              className="btn btn-primary fw-black text-uppercase rounded-0 border border-2 border-dark shadow-[2px_2px_0px_0px_black] w-100"
            >
              Call +968 9548 1981
            </a>
          </div>
        </div>

        {/* Channel 3: Email */}
        <div className="col-12 col-md-4">
          <div className="card h-100 rounded-0 border border-4 border-dark p-4 shadow-[6px_6px_0px_0px_black] bg-white d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="rounded-0 bg-danger text-white p-2 border border-2 border-dark">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="badge bg-warning text-dark fw-black rounded-0 border border-2 border-dark text-uppercase">
                  24-48h Reply
                </span>
              </div>

              <h3 className="fw-black text-dark text-uppercase fs-5 mb-1">Email Support</h3>
              <p className="small text-muted mb-3">Send us an email regarding your query/issue.</p>

              <div className="p-2 bg-light border border-2 border-dark font-monospace fw-bold text-dark small d-flex align-items-center justify-content-between mb-3">
                <span className="truncate">verdetech001@gmail.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy('verdetech001@gmail.com', 'email')}
                  className="btn btn-sm btn-outline-dark rounded-0 border-dark py-0 px-2"
                >
                  {copiedText === 'email' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <a
              href="mailto:verdetech001@gmail.com?subject=Verde%20Tech%20Portal%20Support%20Request"
              className="btn btn-danger fw-black text-uppercase rounded-0 border border-2 border-dark shadow-[2px_2px_0px_0px_black] w-100"
            >
              Email Support Team
            </a>
          </div>
        </div>

      </div>

      {/* Main Issue Reporting Form Section */}
      <div className="card rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black] bg-white text-dark">
        <div className="d-flex flex-column sm:flex-row align-items-sm-center justify-content-between gap-3 border-bottom border-3 border-dark pb-4 mb-4">
          <div>
            <h2 className="h4 fw-black text-dark text-uppercase m-0">Direct Issue Reporting</h2>
            <p className="small text-muted m-0 mt-1">
              Submit your report directly to our authorities. Guaranteed reply within <strong>24 to 48 hours</strong>.
            </p>
          </div>
          <span className="badge bg-success text-white fw-bold rounded-0 px-3 py-2 border border-2 border-dark text-uppercase">
            Turnaround: 24–48 Hours
          </span>
        </div>

        {submittedTicket ? (
          <div className="py-5 text-center space-y-4">
            <div className="display-4 text-success mb-2">✅</div>
            <h3 className="fw-black text-dark text-uppercase">Your Report Has Been Submitted!</h3>
            <p className="small text-muted">Ticket ID: <strong>{submittedTicket.ticketId}</strong>. We will reply to <strong>{email}</strong> within 24-48 hours.</p>
            <button
              type="button"
              onClick={() => {
                setDescription('');
                setAttachedFile(null);
                setSubmittedTicket(null);
              }}
              className="btn btn-warning text-dark fw-black rounded-0 text-uppercase px-4 border border-2 border-dark shadow-[2px_2px_0px_0px_black]"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="alert alert-danger rounded-0 border border-2 border-dark fw-bold small">
                {errorMsg}
              </div>
            )}

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-black text-uppercase small text-dark">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  required
                  className="form-control rounded-0 border border-2 border-dark shadow-none"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-black text-uppercase small text-dark">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="form-control rounded-0 border border-2 border-dark shadow-none"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-black text-uppercase small text-dark">Username / Handle</label>
                <input
                  type="text"
                  value={grNo}
                  onChange={(e) => setGrNo(e.target.value)}
                  placeholder="e.g. @username"
                  className="form-control rounded-0 border border-2 border-dark shadow-none"
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-black text-uppercase small text-dark">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select rounded-0 border border-2 border-dark shadow-none"
                >
                  <option value="Points Discrepancy">Points Discrepancy</option>
                  <option value="Smart Bin Error / Jammed">Smart Bin Error / Jammed</option>
                  <option value="Account Access / Credentials">Account Access / Credentials</option>
                  <option value="Activity Verification Delay">Activity Verification Delay</option>
                  <option value="Other Inquiry">Other Inquiry</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-black text-uppercase small text-dark">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="form-select rounded-0 border border-2 border-dark shadow-none"
                >
                  <option value="Standard">Standard (24-48h SLA)</option>
                  <option value="Urgent">Urgent (Bin malfunction / Critical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label fw-black text-uppercase small text-dark">Issue Details & Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your issue clearly..."
                required
                className="form-control rounded-0 border border-2 border-dark shadow-none"
              ></textarea>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-danger fw-black text-uppercase rounded-0 border border-4 border-dark px-5 py-3 shadow-[4px_4px_0px_0px_black]"
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Issue Report'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FAQ Section */}
      <div className="card rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black] bg-white text-dark">
        <h3 className="h4 fw-black text-dark text-uppercase mb-4">Frequently Asked Questions</h3>
        <div className="accordion rounded-0 border border-2 border-dark" id="faqAccordion">
          {faqs.map((faq, idx) => (
            <div className="accordion-item rounded-0 border-0 border-bottom border-dark" key={idx}>
              <h2 className="accordion-header" id={`heading${idx}`}>
                <button 
                  className={`accordion-button rounded-0 fw-bold text-dark shadow-none ${openFaqIndex === idx ? '' : 'collapsed'}`}
                  type="button" 
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  {faq.q}
                </button>
              </h2>
              <div id={`collapse${idx}`} className={`accordion-collapse collapse ${openFaqIndex === idx ? 'show' : ''}`}>
                <div className="accordion-body bg-light text-dark small fw-medium">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
