import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

const icons = {
  carrosserie: (p: P) => (
    <svg {...base(p)}>
      <path d="M5 4h10.5L19 7.5V20H5z" />
      <path d="M5 11h14" />
      <path d="M8 4v7" />
      <circle cx="15.5" cy="15.5" r="1" />
    </svg>
  ),
  mecanique: (p: P) => (
    <svg {...base(p)}>
      <path d="M4 10h3l2-2h6l2 2h3v6h-3l-2 2H9l-2-2H4z" />
      <path d="M10 6V4h4v2" />
      <path d="M4 13H2M22 13h-2" />
      <path d="M12 10v4" />
    </svg>
  ),
  eclairage: (p: P) => (
    <svg {...base(p)}>
      <path d="M13 5h6v14h-6a7 7 0 0 1 0-14z" />
      <path d="M13 9h-3M13 12h-3M13 15h-3" />
      <path d="M6 8 3.5 6.5M6 12H3M6 16l-2.5 1.5" />
    </svg>
  ),
  habitacle: (p: P) => (
    <svg {...base(p)}>
      <path d="M7.5 4h5l2 9H9.5z" />
      <path d="M6 13h11a2 2 0 0 1 2 2v3H6z" />
      <path d="M8 18v2M17 18v2" />
    </svg>
  ),
  electrique: (p: P) => (
    <svg {...base(p)}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  ),
  "direction-suspension": (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3.3 10.5h6M14.7 10.5h6M12 14.5V21" />
    </svg>
  ),
  freinage: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1" />
    </svg>
  ),
  "refroidissement-climatisation": (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-4 2-7 5-7-1 3-3 5-5 7z" />
      <path d="M14 12c4 0 7 2 7 5-3-1-5-3-7-5z" />
      <path d="M12 14c0 4-2 7-5 7 1-3 3-5 5-7z" />
      <path d="M10 12c-4 0-7-2-7-5 3 1 5 3 7 5z" />
    </svg>
  ),
  transmission: (p: P) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      <circle cx="12" cy="12" r="7.5" strokeDasharray="3 3" />
    </svg>
  ),
} as const;

export type CategoryIconSlug = keyof typeof icons;

export function CategoryIcon({ slug, ...props }: { slug: string } & P) {
  const Icon = icons[slug as CategoryIconSlug] ?? icons.mecanique;
  return <Icon {...props} />;
}
