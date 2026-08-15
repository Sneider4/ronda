/**
 * Marca temporal del producto: "Ronda".
 * El isotipo es una copa dentro de un anillo — "otra ronda" — y funciona
 * igual de bien en el sidebar oscuro, en el comprobante impreso y como favicon.
 */
export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-300 via-brand-400 to-brand-600 shadow-sm shadow-brand-900/25 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.68}
        height={size * 0.68}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="16"
          cy="16"
          r="12.5"
          stroke="#0a0d14"
          strokeOpacity="0.85"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="58 20"
          transform="rotate(-32 16 16)"
        />
        <path d="M10.6 11.4h10.8L16 17.6z" fill="#0a0d14" fillOpacity="0.9" />
        <path
          d="M16 17.6v3.9M12.9 21.5h6.2"
          stroke="#0a0d14"
          strokeOpacity="0.9"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Wordmark({
  compact = false,
  tone = "light",
}: {
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const main = tone === "light" ? "text-white" : "text-slate-900";
  const sub = tone === "light" ? "text-white/45" : "text-slate-500";
  return (
    <span className="flex flex-col leading-none">
      <span className={`text-[17px] font-semibold tracking-tight ${main}`}>
        Ronda
        <span className="text-brand-400">.</span>
      </span>
      {!compact && (
        <span className={`mt-1 text-[10px] font-medium tracking-[0.14em] uppercase ${sub}`}>
          Gestión para bares
        </span>
      )}
    </span>
  );
}

export function Logo({
  tone = "light",
  compact = false,
}: {
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={36} />
      <Wordmark tone={tone} compact={compact} />
    </span>
  );
}
