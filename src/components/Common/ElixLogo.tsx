import React from 'react';

interface ElixLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  showBackground?: boolean;
  symbolOnly?: boolean;
  onClick?: () => void;
  title?: string;
}

export const ElixLogo: React.FC<ElixLogoProps> = ({
  size = 24,
  className = '',
  showText = false,
  showBackground = false,
  onClick,
  title = 'Elix IDE'
}) => {
  return (
    <div 
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      onClick={onClick}
      title={title}
    >
      <svg 
        viewBox="245 190 300 300"
        width={size} 
        height={size} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Precision Minimalist Monogram: Geometric 'E' + Code Bracket */}
        <g id="brand-symbol">
          {/* Floating Top Bar of 'E' */}
          <path 
            d="M 280 220 L 510 220" 
            stroke="var(--elix-logo-primary, #F1F5F9)" 
            strokeWidth={24} 
            strokeLinecap="round" 
            className="transition-colors duration-200"
          />

          {/* Center Segment: Syntax bracket arm `<` forming middle bar */}
          <path 
            d="M 370 295 L 305 340 L 370 385" 
            stroke="var(--elix-logo-secondary, #E2E8F0)" 
            strokeWidth={24} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-colors duration-200"
          />
          <path 
            d="M 305 340 L 460 340" 
            stroke="var(--elix-logo-secondary, #E2E8F0)" 
            strokeWidth={24} 
            strokeLinecap="round" 
            className="transition-colors duration-200"
          />

          {/* Bottom Structural Base of 'E' */}
          <path 
            d="M 280 460 L 510 460" 
            stroke="var(--elix-logo-primary, #F1F5F9)" 
            strokeWidth={24} 
            strokeLinecap="round" 
            className="transition-colors duration-200"
          />

          {/* Vertical Spine */}
          <path 
            d="M 280 220 L 280 460" 
            stroke="var(--elix-logo-primary, #F1F5F9)" 
            strokeWidth={24} 
            strokeLinecap="round" 
            className="transition-colors duration-200"
          />

          {/* Signature Accent: Single electric cyan status pulse / prompt dot */}
          <circle 
            cx="505" 
            cy="340" 
            r={14} 
            fill="var(--elix-logo-accent, #00E5FF)" 
            className="transition-colors duration-200"
          />
        </g>
      </svg>

      {showText && (
        <span className="font-mono font-semibold tracking-tight text-[var(--ide-text,#F1F5F9)] flex items-center text-sm">
          elix<span className="text-[var(--elix-logo-accent,#00E5FF)]">.</span>ide
        </span>
      )}
    </div>
  );
};
