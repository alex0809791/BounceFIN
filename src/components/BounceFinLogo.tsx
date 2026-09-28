import React from 'react';

interface BounceFinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSlogan?: boolean;
  variant?: 'light' | 'dark' | 'emerald';
}

/**
 * BounceFIN Official Logo Icon
 * Symbol concept: An architectural "B" merged with an upward growth trajectory/return arc
 * evoking momentum, bounce, financial recovery, and forward evolution.
 */
export const BounceFinIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BounceFIN Icon"
    >
      <defs>
        <linearGradient id="bouncefin_grad_primary" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" /> {/* Emerald 500 */}
          <stop offset="60%" stopColor="#059669" /> {/* Emerald 600 */}
          <stop offset="100%" stopColor="#0f766e" /> {/* Teal 700 */}
        </linearGradient>
        <linearGradient id="bouncefin_grad_arrow" x1="14" y1="28" x2="28" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
        <linearGradient id="bouncefin_glow" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Rounded container with subtle gradient border */}
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#bouncefin_grad_primary)" />
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="url(#bouncefin_glow)" strokeWidth="1.5" />

      {/* Stylized Modern "B" backbone & Ascending Curve */}
      {/* Vertical Stem of "B" */}
      <rect x="11" y="10" width="3.5" height="20" rx="1.75" fill="white" />

      {/* Upper loop of "B" */}
      <path
        d="M13 10H20C22.7614 10 25 12.0147 25 14.5C25 16.9853 22.7614 19 20 19H13"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower dynamic ascending loop/arrow representing the "Bounce" upward recovery */}
      <path
        d="M13 19H21.5C24.5376 19 27 21.4624 27 24.5C27 26.5 25.5 28.5 22.5 29.5"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Growth Arrowhead indicating financial recovery and upward acceleration */}
      <path
        d="M21 26.5L25 30.5L29 25.5"
        stroke="url(#bouncefin_grad_arrow)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const BounceFinLogo: React.FC<BounceFinLogoProps> = ({
  size = 'md',
  showText = true,
  showSlogan = false,
  variant = 'dark',
  className = '',
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 52,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="shrink-0 drop-shadow-sm transition-transform hover:scale-105 duration-200">
        <BounceFinIcon size={iconSizes[size]} />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-black tracking-tight ${textSizes[size]} ${
                isLight ? 'text-white' : 'text-slate-900'
              }`}
            >
              Bounce
            </span>
            <span
              className={`font-extrabold tracking-tight ${textSizes[size]} ${
                isLight ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              FIN
            </span>
          </div>
          {showSlogan && (
            <span
              className={`text-[11px] font-medium tracking-tight -mt-0.5 ${
                isLight ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Gestão financeira local e privada
            </span>
          )}
        </div>
      )}
    </div>
  );
};
