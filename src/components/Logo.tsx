export function LogoMark({ size = 36, white = false }: { size?: number; white?: boolean }) {
  const teal = white ? "#ffffff" : "#0C8FA0";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* circular arrow — care that comes back around */}
      <path d="M40 16a18 18 0 1 0 2.2 12" fill="none" stroke={teal} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M41.5 9.5 40.4 16.6 33.6 14.8" fill="none" stroke={teal} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* D */}
      <path d="M17 17h6.5a8 8 0 0 1 0 16H17z" fill="none" stroke={teal} strokeWidth="3.6" strokeLinejoin="round" />
      {/* heart above the D */}
      <path d="M22 13.2c-1.6-2.6-5.4-1.6-5.4 1 0 2.1 2.6 3.6 5.4 5.6 2.8-2 5.4-3.5 5.4-5.6 0-2.6-3.8-3.6-5.4-1z" fill="#F4ADB3" transform="translate(0 -4)" />
    </svg>
  );
}

export function Logo({ white = false }: { white?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark white={white} />
      <span className={`text-2xl font-black tracking-tight ${white ? "text-white" : "text-brand"}`}>
        Im<span className="relative">Dayak</span>
      </span>
    </span>
  );
}
