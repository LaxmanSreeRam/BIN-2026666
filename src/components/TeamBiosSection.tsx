import React, { useState, useEffect } from 'react';
import { TeamMemberBio, Student } from '../types';
import { 
  Sparkles, 
  Users, 
  Edit3, 
  Check, 
  X, 
  Heart, 
  ShieldCheck, 
  Info, 
  Save, 
  User, 
  Quote, 
  RotateCcw,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { syncTeamBios, saveTeamBioToFirestore } from '../lib/firebaseSync';

interface TeamBiosSectionProps {
  currentStudent?: Student | null;
}

export const INITIAL_TEAM_BIOS: TeamMemberBio[] = [
  {
    id: 'bio-laxman',
    name: 'Laxman Sree Ram',
    role: 'Project Co-Lead - Website Developer & Social Media Lead',
    aboutMe: 'Passionate student technologist, high school programmer, and environmental advocate driven by creating real-world digital solutions for our campus community.',
    bio: 'Conceptualized and engineered the Verde Tech Portal from the ground up. Developed the full-stack architecture, real-time Cloud Firestore synchronization, Smart Bin authentication integration, and the peer eco social wall to make sustainable campus habits measurable, transparent, and rewarding.',
    whyVerdeTechSpecial: 'VerdeTech is special to me because it turns environmental action from a passive poster into an active, verifiable game. By connecting smart sensors, real points, and peer social cheer, it empowers every single student to take tangible pride in diverted waste and campus impact.',
    avatarUrl: '/laxman_sree_ram.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/laxman-sree-ram-424340420/',
    isLead: true,
  },
  {
    id: 'bio-dhruv',
    name: 'Dhruv Mudgal',
    role: 'Project Lead - Technical Components Handler',
    aboutMe: 'Enthusiastic STEM student with a strong passion for hardware diagnostics, sensor systems, and collaborative campus technology projects.',
    bio: 'Coordinates technical hardware components, Smart Eco Bin sensor verification routines, and disposal data calibration to ensure dependable real-time logging across campus stations.',
    whyVerdeTechSpecial: 'What makes VerdeTech unique is seeing code interact directly with the physical world. Watching an empty plastic bottle drop into the bin, trigger the sensor, and immediately update the student leaderboard proves how technology can inspire genuine daily change.',
    avatarUrl: '',
    linkedinUrl: 'https://www.linkedin.com/in/mudgal-dhruv/',
    isLead: true,
  },
  {
    id: 'bio-arnav',
    name: 'Arnav Goel',
    role: 'Project Lead - Technical Components Handler',
    aboutMe: 'Curious developer focused on electronics reliability, data analytics, and making complex systems intuitive for everyday school users.',
    bio: 'Collaborates on testing Smart Bin telemetry, hardware sensor accuracy, and data consistency between physical drop-off points and the portal database.',
    whyVerdeTechSpecial: 'VerdeTech removes all guesswork from sustainability. Students earn verified points for climate action and smart bin recycling, fostering healthy inter-house pride and genuine responsibility.',
    avatarUrl: '',
    linkedinUrl: 'https://www.linkedin.com/in/arnav-goel-56ab99381/',
    isLead: true,
  },
  {
    id: 'bio-talha',
    name: 'Talha Faizi',
    role: 'Technical Components Coder',
    aboutMe: 'Creative coder interested in embedded systems, efficient firmware logic, and interactive digital experiences.',
    bio: 'Develops microcontroller logic routines, sensor verification scripts, and component communication protocols connecting the physical Smart Bins to the school network.',
    whyVerdeTechSpecial: 'VerdeTech gave our team a chance to build something with meaningful purpose. Every circuit calibrated and algorithm written directly helps make our school grounds cleaner, greener, and more technologically forward-thinking.',
    avatarUrl: '',
    isLead: false,
  },
];

export const TeamBiosSection: React.FC<TeamBiosSectionProps> = ({ currentStudent }) => {
  const [teamBios, setTeamBios] = useState<TeamMemberBio[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('verdetech_team_bios');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_TEAM_BIOS;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamMemberBio | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = syncTeamBios((remoteBios) => {
      if (remoteBios && remoteBios.length > 0) {
        setTeamBios((prev) => {
          const merged = [...prev];
          remoteBios.forEach((remote) => {
            const idx = merged.findIndex((m) => m.id === remote.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...remote };
            } else {
              merged.push(remote);
            }
          });
          localStorage.setItem('verdetech_team_bios', JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => unsub();
  }, []);

  const handleStartEdit = (member: TeamMemberBio) => {
    setEditingId(member.id);
    setFormData({ ...member });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const updated = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    setTeamBios((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      localStorage.setItem('verdetech_team_bios', JSON.stringify(next));
      return next;
    });

    saveTeamBioToFirestore(updated);

    setSaveSuccessNotice(`Updated bio for ${updated.name}`);
    setTimeout(() => setSaveSuccessNotice(null), 3500);
    setEditingId(null);
    setFormData(null);
  };

  const handleResetToDefault = (memberId: string) => {
    const def = INITIAL_TEAM_BIOS.find((b) => b.id === memberId);
    if (!def) return;
    if (confirm(`Reset ${def.name}'s bio to initial template?`)) {
      setTeamBios((prev) => {
        const next = prev.map((m) => (m.id === def.id ? def : m));
        localStorage.setItem('verdetech_team_bios', JSON.stringify(next));
        return next;
      });
      saveTeamBioToFirestore(def);
      setSaveSuccessNotice(`Reset bio for ${def.name}`);
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {saveSuccessNotice && (
        <div className="alert alert-success rounded-0 border border-3 border-dark fw-bold text-dark shadow-[4px_4px_0px_0px_black] d-flex align-items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      <div className="space-y-4">
        {teamBios.map((member) => {
          const isEditing = editingId === member.id;
          const isLaxman = member.id === 'bio-laxman';
          const avatarToDisplay = isLaxman && currentStudent?.avatarUrl ? currentStudent.avatarUrl : member.avatarUrl;

          return (
            <div
              key={member.id}
              className={`card rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black] ${
                member.isLead ? 'bg-light border-success' : 'bg-white'
              }`}
            >
              {isEditing && formData ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div className="d-flex justify-content-between align-items-center border-bottom border-dark pb-2">
                    <span className="fw-black text-uppercase text-success">Editing {member.name}'s Profile</span>
                    <button type="button" onClick={handleCancelEdit} className="btn btn-sm btn-outline-dark rounded-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-uppercase small">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="form-control rounded-0 border-2 border-dark fw-medium"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-uppercase small">Role / Designation</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                        className="form-control rounded-0 border-2 border-dark fw-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label fw-bold text-uppercase small">About Me (Personal Background & Passions)</label>
                    <textarea
                      rows={2}
                      value={formData.aboutMe}
                      onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  <div>
                    <label className="form-label fw-bold text-uppercase small">Full Bio & Technical Contributions</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      required
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  <div>
                    <label className="form-label fw-bold text-uppercase small">Why VerdeTech is Special to Me</label>
                    <textarea
                      rows={3}
                      value={formData.whyVerdeTechSpecial}
                      onChange={(e) => setFormData({ ...formData, whyVerdeTechSpecial: e.target.value })}
                      required
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  <div>
                    <label className="form-label fw-bold text-uppercase small">Avatar Image URL</label>
                    <input
                      type="url"
                      value={formData.avatarUrl || ''}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://..."
                      className="form-control rounded-0 border-2 border-dark fw-medium"
                    />
                  </div>

                  <div>
                    <label className="form-label fw-bold text-uppercase small">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl || ''}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://www.linkedin.com/in/..."
                      className="form-control rounded-0 border-2 border-dark fw-medium font-monospace"
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-3 border-top border-dark">
                    <button type="button" onClick={handleCancelEdit} className="btn btn-outline-dark rounded-0 fw-bold border-2">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success text-white fw-black text-uppercase rounded-0 border border-3 border-dark px-4 py-2">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row g-4 align-items-center">
                  <div className="col-md-3 text-center">
                    {avatarToDisplay ? (
                      <img
                        src={avatarToDisplay}
                        alt={member.name}
                        className="rounded-0 border border-3 border-dark mx-auto shadow-[4px_4px_0px_0px_black]"
                        style={{ width: '120px', height: '140px', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="bg-success text-white d-flex align-items-center justify-content-center mx-auto border border-3 border-dark shadow-[4px_4px_0px_0px_black]" style={{ width: '120px', height: '140px' }}>
                        <User className="w-12 h-12" />
                      </div>
                    )}
                    <div className="mt-3">
                      {member.isLead && (
                        <span className="badge bg-warning text-dark fw-black rounded-0 px-2.5 py-1 border border-dark text-uppercase d-block mb-2">
                          {member.id === 'bio-laxman' ? 'Project Co-Lead' : 'Project Lead'}
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(member)}
                        className="btn btn-sm btn-outline-dark rounded-0 fw-bold border-2 w-100"
                      >
                        <Edit3 className="w-3.5 h-3.5 me-1 inline" /> Edit Info
                      </button>
                    </div>
                  </div>

                  <div className="col-md-9 space-y-3">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <div>
                        <h4 className="fw-black text-uppercase text-dark m-0">{member.name}</h4>
                        <p className="text-success fw-bold small text-uppercase m-0 mt-1">{member.role}</p>
                      </div>

                      {member.linkedinUrl && (
                        <div className="d-flex flex-column align-items-md-end gap-1">
                          <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-dark text-white fw-black text-uppercase rounded-0 border border-2 border-dark px-3 py-1.5 shadow-[2px_2px_0px_0px_black] d-inline-flex align-items-center gap-1.5"
                            title="View LinkedIn Profile"
                          >
                            <i className="bi bi-linkedin text-warning"></i>
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3.5 h-3.5 text-warning" />
                          </a>
                          <span className="small font-monospace text-muted fw-bold">500+ Connections on LinkedIn</span>
                        </div>
                      )}
                    </div>

                    {member.aboutMe && (
                      <div className="p-3 bg-light border border-2 border-dark">
                        <span className="d-block fw-bold text-uppercase small text-muted mb-1">About Me</span>
                        <p className="text-dark fw-medium small m-0">{member.aboutMe}</p>
                      </div>
                    )}

                    <div>
                      <span className="d-block fw-bold text-uppercase small text-muted mb-1">Bio & Contributions</span>
                      <p className="text-dark fw-medium m-0">{member.bio}</p>
                    </div>

                    {member.whyVerdeTechSpecial && (
                      <div className="p-3 bg-success-subtle border border-2 border-dark">
                        <span className="d-block fw-bold text-uppercase small text-success mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Why VerdeTech is Special
                        </span>
                        <p className="text-dark fw-medium m-0 italic">"{member.whyVerdeTechSpecial}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
