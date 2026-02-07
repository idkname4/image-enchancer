import type { SVGProps } from "react";

export function BlurIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <filter id="blur-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" />
        </filter>
      </defs>
      <circle cx="12" cy="12" r="10" filter="url(#blur-filter)" />
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
    </svg>
  );
}
