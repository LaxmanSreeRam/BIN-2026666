import React from 'react';
import {
  Leaf,
  Target,
  Award,
  Users,
  ShieldCheck,
  Globe,
  Sparkles,
  Mail,
  Heart,
  CheckCircle2,
  TreePine,
  Zap,
  Recycle,
  Building2,
  ArrowRight,
  Info,
  MessageSquare,
  ExternalLink,
  Megaphone,
  Share2
} from 'lucide-react';
import { Student } from '../types';
import { TeamBiosSection } from './TeamBiosSection';

interface AboutUsViewProps {
  currentStudent?: Student | null;
  onNavigateToTab?: (tab: string) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  currentStudent,
  onNavigateToTab,
}) => {
  return (
    <div className="container py-4 space-y-4">
      
      {/* Hero Section - Eco Yellow */}
      <div className="card rounded-0 p-4 p-md-5 text-dark border border-4 border-dark shadow-[8px_8px_0px_0px_black]" style={{ backgroundColor: '#F0C020' }}>
        <div className="max-w-3xl space-y-3">
          <div className="badge bg-dark text-white fw-black px-3 py-2 rounded-0 text-uppercase border border-2 border-dark">
            <Sparkles className="w-3.5 h-3.5 me-1 text-warning" />
            Official Platform Overview
          </div>

          <h1 className="display-5 fw-black text-dark text-uppercase tracking-tight m-0">
            About Verde Tech Portal
          </h1>

          <p className="text-dark fw-bold fs-6 m-0 opacity-90">
            The Verde Tech Portal is our school's official sustainability tracking platform designed to inspire, measure, and reward everyday environmental actions. From smart bin recycling to energy conservation, every positive step counts toward a greener campus.
          </p>

          <div className="pt-2 d-flex flex-wrap gap-3">
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('feed')}
                className="btn btn-danger text-white fw-black text-uppercase rounded-0 border border-4 border-dark px-4 py-3 shadow-[4px_4px_0px_0px_black]"
              >
                <span>Explore Eco Feed</span>
                <ArrowRight className="w-4 h-4 ms-2 inline" />
              </button>
            )}
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('rewards')}
                className="btn btn-light text-dark fw-black text-uppercase rounded-0 border border-4 border-dark px-4 py-3 shadow-[4px_4px_0px_0px_black]"
              >
                <span>Browse Rewards</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Official Social Media Channels Banner - Royal Blue */}
      <div className="card rounded-0 p-4 p-md-5 text-white border border-4 border-dark shadow-[6px_6px_0px_0px_black]" style={{ backgroundColor: '#1040C0' }}>
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
          <div>
            <div className="badge bg-warning text-dark fw-black px-3 py-2 rounded-0 text-uppercase mb-2 border border-2 border-dark">
              <Megaphone className="w-3.5 h-3.5 me-1" />
              Official Handles
            </div>
            <h2 className="h3 fw-black text-white text-uppercase m-0">Follow Us On:</h2>
            <p className="text-light small mt-1 m-0 fw-medium">
              Connect with Verde Tech across our official social channels for live campus updates, competition notices, and eco highlights.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <a
              href="https://www.instagram.com/verdetechsystems?stkn=MWcxbGRhYThyN2VlOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light fw-black rounded-0 border border-2 border-dark px-3 py-2 text-dark text-uppercase shadow-[2px_2px_0px_0px_black]"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/verdetechsystemss"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light fw-black rounded-0 border border-2 border-dark px-3 py-2 text-dark text-uppercase shadow-[2px_2px_0px_0px_black]"
            >
              LinkedIn
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61594541660052"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light fw-black rounded-0 border border-2 border-dark px-3 py-2 text-dark text-uppercase shadow-[2px_2px_0px_0px_black]"
            >
              Facebook
            </a>
            <a
              href="https://www.youtube.com/channel/UCilJpKT3EpbNywLsUycQbFw"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light fw-black rounded-0 border border-2 border-dark px-3 py-2 text-dark text-uppercase shadow-[2px_2px_0px_0px_black]"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>

      {/* Team Bios Section */}
      <div className="card rounded-0 border border-4 border-dark p-4 p-md-5 shadow-[6px_6px_0px_0px_black] bg-white text-dark">
        <h3 className="h4 fw-black text-dark text-uppercase mb-4">Leadership & Team Bios</h3>
        <TeamBiosSection currentStudent={currentStudent} />
      </div>

    </div>
  );
};
