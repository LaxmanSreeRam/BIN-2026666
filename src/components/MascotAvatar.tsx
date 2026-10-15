import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface MascotAvatarProps {
  isPasswordVisible?: boolean;
  isPasswordFocused?: boolean;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  isPasswordVisible = false,
  isPasswordFocused = false,
}) => {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const avatarCenterX = rect.left + rect.width / 2;
      const avatarCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - avatarCenterX;
      const dy = e.clientY - avatarCenterY;
      const distance = Math.hypot(dx, dy);

      // Max pupil movement radius in px
      const maxRadius = 7;
      const angle = Math.atan2(dy, dx);
      const moveDistance = Math.min(maxRadius, distance / 22);

      setPupilPos({
        x: Math.cos(angle) * moveDistance,
        y: Math.sin(angle) * moveDistance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // State calculations
  const coverEyes = isPasswordVisible;
  const isLookingAway = isPasswordFocused && !isPasswordVisible;

  return (
    <div
      ref={avatarRef}
      className="relative w-28 h-28 mx-auto my-1 flex items-center justify-center select-none pointer-events-none"
    >
      <motion.div
        className="w-full h-full relative"
        animate={{
          rotate: coverEyes ? 12 : isLookingAway ? -14 : 0,
          x: coverEyes ? 10 : isLookingAway ? -8 : 0,
          y: isLookingAway ? 3 : 0,
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
          {/* Brown Ears */}
          {/* Left Ear */}
          <circle cx="28" cy="34" r="15" fill="#795548" stroke="#4E342E" strokeWidth="2" />
          <circle cx="28" cy="34" r="9" fill="#D7CCC8" />

          {/* Right Ear */}
          <circle cx="92" cy="34" r="15" fill="#795548" stroke="#4E342E" strokeWidth="2" />
          <circle cx="92" cy="34" r="9" fill="#D7CCC8" />

          {/* Eco Leaf Badge on Top */}
          <path
            d="M 60 16 C 50 2 C 34 12 44 24 60 22 C 76 24 86 12 70 2 Z"
            fill="#22c55e"
          />
          <path
            d="M 60 22 L 60 6"
            stroke="#15803d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Head - Main Warm Brown Body */}
          <circle cx="60" cy="65" r="39" fill="#8D6E63" stroke="#4E342E" strokeWidth="2.5" />

          {/* Light Muzzle / Snout area */}
          <ellipse cx="60" cy="74" rx="22" ry="16" fill="#F5E0C3" />

          {/* Cheeks */}
          <circle cx="33" cy="71" r="6" fill="#FF8A80" opacity="0.5" />
          <circle cx="87" cy="71" r="6" fill="#FF8A80" opacity="0.5" />

          {/* Cute Nose */}
          <ellipse cx="60" cy="67" rx="6" ry="4.5" fill="#3E2723" />
          <circle cx="58.5" cy="65.5" r="1" fill="#FFFFFF" opacity="0.8" />

          {/* Mouth */}
          <motion.path
            stroke="#3E2723"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: coverEyes
                ? "M 53 79 Q 60 74 67 79"
                : isLookingAway
                ? "M 55 77 Q 60 74 65 77"
                : "M 52 75 Q 60 82 68 75",
            }}
          />

          {/* Eyes Container */}
          {!coverEyes ? (
            <g>
              {/* Left Eye White */}
              <circle cx="42" cy="54" r="10.5" fill="#FFFFFF" stroke="#3E2723" strokeWidth="1.5" />
              {/* Right Eye White */}
              <circle cx="78" cy="54" r="10.5" fill="#FFFFFF" stroke="#3E2723" strokeWidth="1.5" />

              {/* Left Pupil */}
              <circle
                cx={42 + (isLookingAway ? -6 : pupilPos.x)}
                cy={54 + (isLookingAway ? -2 : pupilPos.y)}
                r="5"
                fill="#1A1A1A"
              />
              <circle
                cx={40.2 + (isLookingAway ? -6 : pupilPos.x)}
                cy={52.2 + (isLookingAway ? -2 : pupilPos.y)}
                r="1.8"
                fill="#FFFFFF"
              />

              {/* Right Pupil */}
              <circle
                cx={78 + (isLookingAway ? -6 : pupilPos.x)}
                cy={54 + (isLookingAway ? -2 : pupilPos.y)}
                r="5"
                fill="#1A1A1A"
              />
              <circle
                cx={76.2 + (isLookingAway ? -6 : pupilPos.x)}
                cy={52.2 + (isLookingAway ? -2 : pupilPos.y)}
                r="1.8"
                fill="#FFFFFF"
              />
            </g>
          ) : (
            /* Shy Closed Eyes when Password View is Unmasked */
            <g stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 36 56 Q 42 50 48 56" />
              <path d="M 72 56 Q 78 50 84 56" />
            </g>
          )}

          {/* Animated Brown Paws Covering Eyes when password is viewable */}
          <motion.g
            animate={{
              y: coverEyes ? 0 : 42,
              opacity: coverEyes ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* Left Paw */}
            <circle cx="39" cy="53" r="12.5" fill="#8D6E63" stroke="#3E2723" strokeWidth="2" />
            <ellipse cx="39" cy="55" rx="5.5" ry="4.5" fill="#F5E0C3" />
            <circle cx="34" cy="48" r="2" fill="#F5E0C3" />
            <circle cx="39" cy="46" r="2" fill="#F5E0C3" />
            <circle cx="44" cy="48" r="2" fill="#F5E0C3" />

            {/* Right Paw */}
            <circle cx="81" cy="53" r="12.5" fill="#8D6E63" stroke="#3E2723" strokeWidth="2" />
            <ellipse cx="81" cy="55" rx="5.5" ry="4.5" fill="#F5E0C3" />
            <circle cx="76" cy="48" r="2" fill="#F5E0C3" />
            <circle cx="81" cy="46" r="2" fill="#F5E0C3" />
            <circle cx="86" cy="48" r="2" fill="#F5E0C3" />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};
