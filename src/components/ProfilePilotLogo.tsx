import React from 'react';

interface ProfilePilotLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  isLightMode?: boolean;
}

export const ProfilePilotLogo: React.FC<ProfilePilotLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  isLightMode = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Rocket Graphic SVG */}
      <div 
        style={{ width: size, height: size }} 
        className="relative shrink-0 filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Stars */}
          {/* Top Left Yellow Star */}
          <path
            d="M50 45L54 57L66 58L57 67L60 79L50 72L40 79L43 67L34 58L46 57L50 45Z"
            fill="#FACC15"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Small Top Star */}
          <path
            d="M80 30L82 36L88 37L83 41L85 47L80 44L75 47L77 41L72 37L78 36L80 30Z"
            fill="#FACC15"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Right Orange Star */}
          <path
            d="M170 60L173 68L182 69L175 75L177 84L170 79L163 84L165 75L158 69L167 68L170 60Z"
            fill="#FB923C"
            stroke="#1E293B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Fluffy Blue & White Cloud Base */}
          <path
            d="M35 135 C20 135 15 115 30 105 C35 90 60 85 75 95 C85 80 115 80 125 95 C140 85 165 95 165 110 C180 115 180 135 165 145 C170 160 145 170 130 160 C115 170 85 170 70 155 C55 165 35 155 35 135 Z"
            fill="#38BDF8"
            stroke="#1E293B"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M45 130 C35 130 30 115 42 108 C46 96 66 92 78 100 C86 88 110 88 118 100 C130 92 150 100 150 112 C162 116 162 132 150 140 C154 152 134 160 122 152 C110 160 86 160 74 148 C62 156 46 148 45 130 Z"
            fill="#E0F2FE"
          />

          {/* Rocket Flames & Blast */}
          <path
            d="M75 125 L45 155 C40 160 50 165 60 150 L85 130 Z"
            fill="#EF4444"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M85 125 L60 165 C55 170 68 172 78 155 L98 132 Z"
            fill="#F97316"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M92 128 L80 160 C76 164 86 165 92 152 L102 130 Z"
            fill="#FACC15"
          />

          {/* Rocket Rear Fins */}
          <path
            d="M80 110 L60 125 C55 128 55 115 65 102 L82 95 Z"
            fill="#EA580C"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M115 80 L135 105 C140 112 128 118 120 110 L108 92 Z"
            fill="#EA580C"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Rocket Body (White + Sleek Shading) */}
          <path
            d="M102 110 C85 98 80 65 120 35 C155 75 122 110 102 110 Z"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M102 110 C88 98 85 75 110 48 C100 68 100 95 102 110 Z"
            fill="#E2E8F0"
          />

          {/* Rocket Nose Cone (Orange / Red) */}
          <path
            d="M120 35 C132 47 142 58 147 65 C140 50 130 40 120 35 Z"
            fill="#EA580C"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Rocket Center Fin */}
          <path
            d="M98 90 L85 115 C82 120 90 122 98 112 L108 90 Z"
            fill="#F97316"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Rocket Round Viewport Window */}
          <circle
            cx="122"
            cy="68"
            r="16"
            fill="#38BDF8"
            stroke="#1E293B"
            strokeWidth="4"
          />
          <circle
            cx="122"
            cy="68"
            r="11"
            fill="#0284C7"
          />
          {/* Window Specular Highlight */}
          <circle
            cx="118"
            cy="64"
            r="4"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Optional Matching Text Branding */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center text-xl font-extrabold tracking-tight">
            <span className="text-[#0284c7]">Profile</span>
            <span className="text-[#f97316]">Pilot</span>
          </div>
          <span className={`text-[10px] font-semibold tracking-wide ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            AI DATING WINGMAN
          </span>
        </div>
      )}
    </div>
  );
};
