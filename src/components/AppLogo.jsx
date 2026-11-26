import React from 'react';

export default function AppLogo({ className = 'w-16 h-16' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-label="Habit Mastery Logo"
    >
      <defs>
        <linearGradient id="hmBgGrad" x1="256" y1="24" x2="256" y2="488" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#192336" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="hmFlameGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#5cf9b8" />
          <stop offset="100%" stopColor="#12b981" />
        </linearGradient>
        <filter id="hmEmeraldGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#2ee59d" floodOpacity="0.45" />
        </filter>
        <filter id="hmFlameGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#34f5a8" floodOpacity="0.55" />
        </filter>
        <filter id="hmCheckShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="1" dy="5" stdDeviation="6.5" floodColor="#02060c" floodOpacity="0.75" />
        </filter>
      </defs>

      <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#hmBgGrad)" stroke="#293548" strokeWidth="2" />

      <rect x="106" y="106" width="88" height="88" rx="18" fill="#1b283b" stroke="#26354d" strokeWidth="1.5" />
      <rect x="212" y="106" width="88" height="88" rx="18" fill="#0d5b45" />
      <rect x="318" y="106" width="88" height="88" rx="18" fill="#32e29d" filter="url(#hmEmeraldGlow)" />

      <rect x="106" y="212" width="88" height="88" rx="18" fill="#118665" />
      <rect x="212" y="212" width="88" height="88" rx="18" fill="#14b27c" />
      <rect x="318" y="212" width="88" height="88" rx="18" fill="#16b981" />

      <rect x="106" y="318" width="88" height="88" rx="18" fill="#1c3840" />
      <rect x="212" y="318" width="88" height="88" rx="18" fill="#21ca8b" />
      <rect x="318" y="318" width="88" height="88" rx="18" fill="#32e29d" filter="url(#hmEmeraldGlow)" />

      <g filter="url(#hmFlameGlow)" transform="translate(96.93, 189.92) scale(0.0538, -0.0538)">
        <path
          d="M950 1303 c-25 -21 -55 -49 -67 -63 -53 -60 -107 -191 -133 -324 -12 -58 -12 -58 -32 -39 -10 11 -25 37 -32 57 l-13 38 -22 -30 c-39 -55 -82 -159 -98 -238 -13 -66 -14 -92 -5 -158 57 -390 516 -537 773 -248 139 156 152 377 37 607 -59 117 -128 200 -128 153 0 -16 -31 -78 -40 -78 -11 0 -84 109 -119 178 -17 34 -37 88 -44 119 -8 31 -18 58 -23 60 -6 2 -30 -14 -54 -34z m147 -468 c41 -55 86 -122 100 -149 27 -53 40 -141 29 -199 -16 -87 -107 -167 -207 -182 -162 -24 -308 141 -266 301 18 69 86 186 165 285 76 95 64 99 179 -56z"
          fill="url(#hmFlameGrad)"
        />
      </g>

      <path
        d="M195 255 L230 301 L331 199"
        stroke="#ffffff"
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#hmCheckShadow)"
      />
    </svg>
  );
}

