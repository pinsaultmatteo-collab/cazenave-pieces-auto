type MarqueeProps = {
  items: readonly string[];
  className?: string;
};

/** Bandeau défilant en continu (CSS pur), bords fondus. */
export function Marquee({ items, className = "" }: MarqueeProps) {
  const row = [...items, ...items];
  return (
    <div
      aria-hidden
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] ${className}`}
    >
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap motion-reduce:animate-none">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            <span className="font-display text-2xl font-semibold uppercase tracking-wide">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          </span>
        ))}
      </div>
    </div>
  );
}
