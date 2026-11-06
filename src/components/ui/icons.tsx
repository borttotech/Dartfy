/** Ícones em SVG inline (traço 1.8, estilo Lucide) — sem dependência externa. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export const IconHome = (p: P) => (<svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>);
export const IconTicket = (p: P) => (<svg {...base(p)}><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M13 6v2M13 11v2M13 16v2" /></svg>);
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconGlass = (p: P) => (<svg {...base(p)}><path d="M7 3h10l-1 7a4 4 0 0 1-8 0Z" /><path d="M12 14v7M8.5 21h7" /></svg>);
export const IconUser = (p: P) => (<svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const IconUsers = (p: P) => (<svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.5A6.5 6.5 0 0 1 21.5 20" /></svg>);
export const IconPin = (p: P) => (<svg {...base(p)}><path d="M12 21s7-6.1 7-11.5a7 7 0 0 0-14 0C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const IconCalendar = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
export const IconClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconGift = (p: P) => (<svg {...base(p)}><rect x="3" y="8" width="18" height="5" rx="1.5" /><path d="M5 13v8h14v-8M12 8v13" /><path d="M12 8S10.5 3 8 3.5 7 8 12 8ZM12 8s1.5-5 4-4.5S17 8 12 8Z" /></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7" /></svg>);
export const IconX = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconShare = (p: P) => (<svg {...base(p)}><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>);
export const IconCopy = (p: P) => (<svg {...base(p)}><rect x="8" y="8" width="13" height="13" rx="2.5" /><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8" /></svg>);
export const IconChevronRight = (p: P) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const IconChevronLeft = (p: P) => (<svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>);
export const IconQr = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></svg>);
export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconSparkles = (p: P) => (<svg {...base(p)}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></svg>);
export const IconWallet = (p: P) => (<svg {...base(p)}><path d="M3 7a2 2 0 0 1 2-2h12v4" /><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M16 13.5h2" /></svg>);
export const IconShield = (p: P) => (<svg {...base(p)}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6Z" /><path d="m9 12 2 2 4-4" /></svg>);
export const IconLogout = (p: P) => (<svg {...base(p)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></svg>);
export const IconMapArrow = (p: P) => (<svg {...base(p)}><path d="M3 11 21 3l-8 18-2-8Z" /></svg>);
export const IconMap = (p: P) => (<svg {...base(p)}><path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5Z" /><path d="M9 4v13.5M15 6.5V20" /></svg>);
export const IconPhone = (p: P) => (<svg {...base(p)}><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M11 18.5h2" /></svg>);
export const IconInfo = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.01" /></svg>);

export const IconWhatsapp = ({ size = 20, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.09c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.83 0-1.34.7-2 .95-2.28.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.28-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.33Z" />
  </svg>
);
