type P = { className?: string };

export const IconArrow = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 16 16" fill="none" className={`${className} rtl:-scale-x-100`} aria-hidden>
    <path d="M2 8h11m-4-4.5L13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const IconWhatsApp = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.08c-.24.68-1.42 1.3-1.95 1.36-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.12.59.17.29.75 1.24 1.61 2 1.1.98 2.03 1.29 2.32 1.43.29.14.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.38-.24.65-.14.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
  </svg>
);

export const IconPhone = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconMail = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.5" />
    <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconClose = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconPlus = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const IconSearch = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
