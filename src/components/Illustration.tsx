/** Simple hand-drawn-style illustration: a caregiver holding a baby, with a grandparent and a child. */
export function HeroIllustration({ className = "", label }: { className?: string; label: string }) {
  return (
    <svg viewBox="0 0 420 360" className={className} role="img" aria-label={label}>
      <circle cx="210" cy="190" r="150" fill="#E3F4F6" />
      <circle cx="330" cy="80" r="34" fill="#FDEEEF" />
      <path d="M318 74c-4-7-14-4-14 3 0 6 7 10 14 15 7-5 14-9 14-15 0-7-10-10-14-3z" fill="#F4ADB3" />
      <path d="M80 120c-3-5-10-3-10 2 0 4 5 7 10 10 5-3 10-6 10-10 0-5-7-7-10-2z" fill="#F4ADB3" />
      {/* grandmother */}
      <g>
        <rect x="70" y="210" width="90" height="110" rx="40" fill="#C9E7EB" />
        <circle cx="115" cy="180" r="34" fill="#F6D2B8" />
        <path d="M82 172c4-26 62-28 66 0-8-10-24-14-33-14s-25 4-33 14z" fill="#E7E3E0" />
        <circle cx="104" cy="182" r="3" fill="#1F3A40" />
        <circle cx="126" cy="182" r="3" fill="#1F3A40" />
        <path d="M106 196q9 7 18 0" stroke="#1F3A40" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="104" cy="182" r="9" fill="none" stroke="#1F3A40" strokeWidth="1.6" />
        <circle cx="126" cy="182" r="9" fill="none" stroke="#1F3A40" strokeWidth="1.6" />
      </g>
      {/* nanny */}
      <g>
        <rect x="170" y="190" width="110" height="140" rx="50" fill="#0C8FA0" />
        <circle cx="225" cy="150" r="40" fill="#EFC3A4" />
        <path d="M184 150c-4-44 86-48 82 0-6-18-20-26-41-26s-35 8-41 26z" fill="#5B3A2E" />
        <path d="M184 150c-6 20-2 46 10 52l2-40z M266 150c6 20 2 46-10 52l-2-40z" fill="#5B3A2E" />
        <circle cx="212" cy="152" r="3.5" fill="#1F3A40" />
        <circle cx="238" cy="152" r="3.5" fill="#1F3A40" />
        <circle cx="205" cy="165" r="6" fill="#F4ADB3" opacity=".6" />
        <circle cx="245" cy="165" r="6" fill="#F4ADB3" opacity=".6" />
        <path d="M214 170q11 9 22 0" stroke="#1F3A40" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* baby */}
        <ellipse cx="228" cy="245" rx="42" ry="28" fill="#FDEEEF" />
        <circle cx="206" cy="232" r="20" fill="#F6D2B8" />
        <path d="M196 226q4-3 8 0 M210 226q4-3 8 0" stroke="#1F3A40" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M202 240q4 3 8 0" stroke="#1F3A40" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M190 262c20 14 60 14 82-6" stroke="#EFC3A4" strokeWidth="14" fill="none" strokeLinecap="round" />
      </g>
      {/* child */}
      <g>
        <rect x="292" y="250" width="66" height="80" rx="28" fill="#F4ADB3" />
        <circle cx="325" cy="225" r="26" fill="#E6B593" />
        <path d="M299 222c0-30 52-30 52 0-6-10-14-14-26-14s-20 4-26 14z" fill="#2D2420" />
        <circle cx="316" cy="226" r="2.6" fill="#1F3A40" />
        <circle cx="334" cy="226" r="2.6" fill="#1F3A40" />
        <path d="M318 236q7 6 14 0" stroke="#1F3A40" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M358 268l20-24" stroke="#E6B593" strokeWidth="10" strokeLinecap="round" />
        <circle cx="384" cy="232" r="14" fill="#F2B33D" />
      </g>
      <ellipse cx="210" cy="335" rx="170" ry="10" fill="#1F3A40" opacity=".06" />
    </svg>
  );
}
