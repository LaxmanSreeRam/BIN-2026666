import React, { useState, useRef, useEffect } from 'react';
import { ExternalLink, X, Users, MessageCircle, Share2, Sparkles } from 'lucide-react';

interface SocialChannel {
  id: string;
  name: string;
  handle: string;
  url: string;
  color: string;
  bgColor: string;
  hoverBg: string;
  borderColor: string;
  iconSvg: React.ReactNode;
  badge?: string;
}

const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'verdetechsystemss',
    url: 'https://www.linkedin.com/company/verdetechsystemss',
    color: '#0A66C2',
    bgColor: 'bg-[#0A66C2]/10',
    hoverBg: 'hover:bg-[#0A66C2] hover:text-white',
    borderColor: 'border-[#0A66C2]/20',
    iconSvg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z" />
      </svg>
    ),
    badge: 'Professional',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@verdetechsystems',
    url: 'https://www.instagram.com/verdetechsystems?stkn=MWcxbGRhYThyN2VlOA==',
    color: '#E4405F',
    bgColor: 'bg-pink-500/10',
    hoverBg: 'hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-500 hover:to-amber-500 hover:text-white',
    borderColor: 'border-pink-500/20',
    iconSvg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    badge: 'Photos & Highlights',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'VerdeTech Systems',
    url: 'https://www.youtube.com/channel/UCilJpKT3EpbNywLsUycQbFw',
    color: '#FF0000',
    bgColor: 'bg-[#FF0000]/10',
    hoverBg: 'hover:bg-[#FF0000] hover:text-white',
    borderColor: 'border-[#FF0000]/20',
    iconSvg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    badge: 'Videos & Streams',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Verde Tech Official',
    url: 'https://www.facebook.com/profile.php?id=61594541660052',
    color: '#1877F2',
    bgColor: 'bg-[#1877F2]/10',
    hoverBg: 'hover:bg-[#1877F2] hover:text-white',
    borderColor: 'border-[#1877F2]/20',
    iconSvg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    badge: 'Community',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Channel',
    handle: 'Official Updates Channel',
    url: 'https://whatsapp.com/channel/0029Vb8TDOm7DAWxqSu3yq0O',
    color: '#25D366',
    bgColor: 'bg-[#25D366]/10',
    hoverBg: 'hover:bg-[#25D366] hover:text-white',
    borderColor: 'border-[#25D366]/20',
    iconSvg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984 0 1.762.459 3.481 1.332 5.001L2 22l5.127-1.334c1.468.799 3.125 1.218 4.885 1.218 5.508 0 9.991-4.478 9.991-9.984 0-2.665-1.039-5.17-2.926-7.058C17.189 3.053 14.68 2 12.012 2zm5.828 14.282c-.244.686-1.228 1.258-2.023 1.428-.544.116-1.255.209-3.643-.781-3.054-1.264-5.018-4.364-5.17-4.566-.148-.198-1.229-1.636-1.229-3.118 0-1.482.775-2.21 1.05-2.511.275-.301.602-.376.802-.376.199 0 .399.002.573.01.186.009.436-.07.683.522.248.598.847 2.072.922 2.223.075.151.125.326.025.526-.099.201-.15.326-.299.501-.15.175-.315.391-.45.525-.15.151-.307.315-.132.616.175.301.778 1.285 1.67 2.08 1.148 1.023 2.116 1.34 2.417 1.491.301.15.476.125.651-.075.175-.201.751-.876.951-1.176.2-.301.401-.251.676-.151.275.101 1.748.824 2.048.974.3.151.5.226.574.351.076.126.076.726-.168 1.412z" />
      </svg>
    ),
    badge: 'Instant Broadcasts',
  },
];

export const SocialHubWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Pop-up Bubble Container */}
      {isOpen && (
        <div className="mb-3.5 w-[310px] sm:w-[340px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ring-1 ring-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight text-white flex items-center space-x-1.5">
                    <span>Connect With Us</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    Verde Tech Official Channels
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close social hub"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Social Links Grid / List */}
          <div className="p-3 max-h-[380px] overflow-y-auto space-y-2 divide-y divide-slate-800/60">
            {SOCIAL_CHANNELS.map((channel) => (
              <a
                key={channel.id}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer border ${channel.borderColor} hover:border-transparent hover:shadow-md ${channel.hoverBg}`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-xs ${channel.bgColor} text-slate-200 group-hover:text-white`}
                    style={{ color: channel.color }}
                  >
                    <span className="group-hover:text-white">{channel.iconSvg}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-white truncate">
                        {channel.name}
                      </span>
                      {channel.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold group-hover:bg-white/20 group-hover:text-white shrink-0">
                          {channel.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 group-hover:text-white/90 truncate font-mono">
                      {channel.handle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>

          {/* Footer note inside bubble */}
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-center">
            <p className="text-[10px] font-semibold text-slate-400">
              Join the Verde Tech community across all official handles! 🌿
            </p>
          </div>
        </div>
      )}

      {/* Main Composite Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Social Channels Menu"
        className="group relative flex items-center space-x-2 p-2.5 pl-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 cursor-pointer border-2 border-white/20"
      >
        {/* Composite Group-Like Logo Display */}
        <div className="relative flex items-center justify-center">
          {/* 2x2 Mini Social Badge Cluster */}
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md p-1 border border-white/30 grid grid-cols-2 gap-0.5 shadow-inner">
            {/* Instagram Mini Icon */}
            <div className="flex items-center justify-center text-pink-300">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            {/* LinkedIn Mini Icon */}
            <div className="flex items-center justify-center text-sky-300">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9Z" />
              </svg>
            </div>
            {/* Facebook Mini Icon */}
            <div className="flex items-center justify-center text-blue-300">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            {/* YouTube Mini Icon */}
            <div className="flex items-center justify-center text-red-300">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
          </div>

          {/* Pulse Active Notification Indicator */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-white"></span>
          </span>
        </div>

        {/* Button Text */}
        <span className="font-extrabold text-xs pr-1 tracking-wide text-white">
          Social Hub
        </span>
      </button>
    </div>
  );
};
