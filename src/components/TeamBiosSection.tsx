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
import { playSound } from '../utils/soundFx';

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
    id: 'bio-arav',
    name: 'Arav Goel',
    role: 'Project Lead - Technical Components Handler',
    aboutMe: 'Hardware and embedded engineering enthusiast passionate about smart bins, microcontrollers, and IoT sensor networks.',
    bio: 'Assists in designing hardware enclosures, power distribution, and load cell calibration routines for verified recycling telemetry.',
    whyVerdeTechSpecial: 'I love how VerdeTech makes waste reduction practical and immediate. Rewarding clean student choices on the spot encourages our school to lead by example for Oman 2040 sustainability visions.',
    avatarUrl: '',
    linkedinUrl: 'https://www.linkedin.com/in/arav-goel-226875326/',
    isLead: true,
  },
];

export const TeamBiosSection: React.FC<TeamBiosSectionProps> = ({ currentStudent }) => {
  const [teamBios, setTeamBios] = useState<TeamMemberBio[]>(() => {
    const saved = localStorage.getItem('verdetech_team_bios');
    if (!saved) return INITIAL_TEAM_BIOS;
    try {
      const parsed: TeamMemberBio[] = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEAM_BIOS;
    } catch {
      return INITIAL_TEAM_BIOS;
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamMemberBio | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Firestore real-time synchronization
  useEffect(() => {
    const unsubscribe = syncTeamBios((firestoreBios) => {
      if (firestoreBios && firestoreBios.length > 0) {
        setTeamBios(firestoreBios);
        localStorage.setItem('verdetech_team_bios', JSON.stringify(firestoreBios));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStartEdit = (member: TeamMemberBio) => {
    playSound('click');
    setEditingId(member.id);
    setFormData({ ...member });
  };

  const handleCancelEdit = () => {
    playSound('click');
    setEditingId(null);
    setFormData(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    playSound('success');
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

  return (
    <div className="space-y-6">
      {saveSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      <div className="space-y-6">
        {teamBios.map((member) => {
          const isEditing = editingId === member.id;
          const isLaxman = member.id === 'bio-laxman';
          const avatarToDisplay = isLaxman && currentStudent?.avatarUrl ? currentStudent.avatarUrl : member.avatarUrl;

          return (
            <div
              key={member.id}
              className={`rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                member.isLead 
                  ? 'bg-[#090e23]/90 border-cyan-400/30 shadow-[0_0_30px_rgba(94,242,255,0.1)]' 
                  : 'bg-[#080c1d]/80 border-white/10'
              }`}
            >
              {isEditing && formData ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="font-mono text-xs text-cyan-400 uppercase font-bold">
                      Editing {member.name}'s Profile
                    </span>
                    <button type="button" onClick={handleCancelEdit} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Role / Designation</label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">About Me</label>
                    <textarea
                      rows={2}
                      value={formData.aboutMe}
                      onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Bio & Contributions</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Why VerdeTech is Special</label>
                    <textarea
                      rows={2}
                      value={formData.whyVerdeTechSpecial}
                      onChange={(e) => setFormData({ ...formData, whyVerdeTechSpecial: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button type="button" onClick={handleCancelEdit} className="btn-stai-ghost text-xs">
                      Cancel
                    </button>
                    <button type="submit" className="btn-stai-cyan text-xs">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar Column */}
                  <div className="text-center shrink-0 w-36">
                    {avatarToDisplay ? (
                      <div className="w-28 h-32 rounded-2xl overflow-hidden border-2 border-cyan-400/40 p-1 bg-black/40 shadow-[0_0_20px_rgba(94,242,255,0.2)] mx-auto">
                        <img
                          src={avatarToDisplay}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-32 rounded-2xl border border-white/10 bg-slate-900/60 flex items-center justify-center mx-auto text-slate-500">
                        <User className="w-10 h-10 text-cyan-400/60" />
                      </div>
                    )}

                    <div className="mt-3 space-y-2">
                      {member.isLead && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                          {member.id === 'bio-laxman' ? 'Co-Lead' : 'Lead'}
                        </span>
                      )}
                      <button
                        onClick={() => handleStartEdit(member)}
                        className="btn-stai-ghost text-[11px] py-1 px-3 w-full justify-center flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Bio</span>
                      </button>
                    </div>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 space-y-3 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-xl sm:text-2xl font-bold font-display text-white">{member.name}</h4>
                        <p className="text-cyan-400 text-xs font-mono font-medium mt-0.5">{member.role}</p>
                      </div>

                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all shrink-0"
                          title="View LinkedIn Profile"
                        >
                          <i className="bi bi-linkedin text-cyan-400"></i>
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>

                    {member.aboutMe && (
                      <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">
                          Personal Statement
                        </span>
                        <p className="text-slate-300 text-xs leading-relaxed">{member.aboutMe}</p>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 leading-relaxed">
                      <span className="block text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-1">
                        Key Engineering Contributions
                      </span>
                      <p>{member.bio}</p>
                    </div>

                    {member.whyVerdeTechSpecial && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Why VerdeTech is Special</span>
                        </span>
                        <p className="text-slate-300 text-xs italic leading-relaxed">"{member.whyVerdeTechSpecial}"</p>
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
