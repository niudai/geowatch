export default function BrandIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="32" cy="32" r="27" stroke="#22d3ee" strokeWidth="2" opacity="0.25" />
      {/* Middle ring */}
      <circle cx="32" cy="32" r="18" stroke="#22d3ee" strokeWidth="2" opacity="0.5" />
      {/* Inner ring */}
      <circle cx="32" cy="32" r="9" stroke="#22d3ee" strokeWidth="2.5" />
      {/* Core dot */}
      <circle cx="32" cy="32" r="3.5" fill="#34d399" />
      {/* Crosshair — top */}
      <line x1="32" y1="2" x2="32" y2="13" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crosshair — bottom */}
      <line x1="32" y1="51" x2="32" y2="62" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crosshair — left */}
      <line x1="2" y1="32" x2="13" y2="32" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crosshair — right */}
      <line x1="51" y1="32" x2="62" y2="32" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      {/* Signal wave 1 */}
      <path d="M46 18C49 15 52 13.5 55 13" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      {/* Signal wave 2 */}
      <path d="M43.5 15.5C47.5 11 51.5 9 56 8" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}
