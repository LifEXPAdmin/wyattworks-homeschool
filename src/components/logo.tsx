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
      {/* Custom SVG Logo */}
      <svg
        className={`${sizeClasses[size]} text-primary`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book/Pages */}
        <rect
          x="4"
          y="6"
          width="20"
          height="20"
          rx="2"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Book spine */}
        <rect x="4" y="6" width="4" height="20" rx="2" fill="currentColor" fillOpacity="0.2" />

        {/* Pages lines */}
        <line
          x1="10"
          y1="10"
          x2="20"
          y2="10"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <line
          x1="10"
          y1="13"
          x2="18"
          y2="13"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <line
          x1="10"
          y1="16"
          x2="20"
          y2="16"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        <line
          x1="10"
          y1="19"
          x2="16"
          y2="19"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* Star/Achievement symbol */}
        <g transform="translate(20, 4)">
          <path
            d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z"
            fill="currentColor"
            fillOpacity="0.8"
          />
        </g>

        {/* Graduation cap */}
        <g transform="translate(2, 2)">
          <path d="M2 4L6 2L10 4L6 6Z" fill="currentColor" fillOpacity="0.7" />
          <line
            x1="6"
            y1="6"
            x2="6"
            y2="8"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
        </g>
      </svg>

      {/* Text */}
      {showText && (
        <span className={`text-primary font-bold ${textSizes[size]}`}>Astra Academy</span>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function LogoIcon({ size = "md", className = "" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} className={className} showText={false} />;
}
