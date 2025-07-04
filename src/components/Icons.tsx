export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const TabbedViewIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 8 V4 H28 V8" />
    <path d="M4 8 H14 V28 H4 Z" />
    <path d="M18 8 H28 V28 H18 Z" />
  </svg>
);

export const SideBySideViewIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4 H28 V28 H4 Z" />
    <path d="M16 4 V28" />
  </svg>
);
