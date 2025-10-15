import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className = "", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Custom SVG Logo - Home² Design */}
      <svg
        className={`${sizeClasses[size]} text-primary`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main House Structure */}
        <path
          d="M16 4L4 12v16h8v-8h8v8h8V12L16 4z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* House Roof */}
        <path
          d="M16 4L4 12h24L16 4z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Door */}
        <rect
          x="12"
          y="20"
          width="8"
          height="8"
          rx="1"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* Window */}
        <rect
          x="6"
          y="16"
          width="4"
          height="4"
          rx="0.5"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="1"
        />

        {/* "Squared" Symbol - Small superscript 2 */}
        <g transform="translate(20, 8)">
          <text
            x="0"
            y="0"
            fontSize="8"
            fontWeight="bold"
            fill="currentColor"
            fillOpacity="0.8"
            textAnchor="middle"
            dominantBaseline="central"
          >
            ²
          </text>
        </g>

        {/* Subtle Learning Element - Small lightbulb */}
        <g transform="translate(22, 18)">
          <circle cx="2" cy="2" r="2" fill="currentColor" fillOpacity="0.3" />
          <path
            d="M2 0.5L2.5 2M2 3.5L2.5 2M0.5 2L2.5 2M3.5 2L2.5 2"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.6"
          />
        </g>
      </svg>

      {/* Text */}
      {showText && <span className={`text-primary font-bold ${textSizes[size]}`}>Home²</span>}
    </div>
  );
}

// Compact version for smaller spaces
export function LogoIcon({ size = "md", className = "" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} className={className} showText={false} />;
}
