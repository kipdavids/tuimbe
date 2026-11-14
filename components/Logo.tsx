export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role="img" aria-label="Tuimbe">
      <rect width="512" height="512" rx="112" fill="var(--primary)" />
      <path d="M96 200c60-24 118-20 160 14v186c-42-32-100-36-160-12z" fill="#fff" />
      <path d="M416 200c-60-24-118-20-160 14v186c42-32 100-36 160-12z" fill="#fff" opacity=".88" />
      <ellipse cx="318" cy="312" rx="34" ry="26" fill="var(--accent)" transform="rotate(-18 318 312)" />
      <path d="M346 306V130l72 34v36l-48-22v128z" fill="var(--accent)" />
    </svg>
  );
}
