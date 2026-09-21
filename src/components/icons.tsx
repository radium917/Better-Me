import type { ReactNode } from 'react'

/** 轻量线性图标（继承 currentColor） */
type P = { size?: number; className?: string }
const base = (size = 22) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IcHome = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
)
export const IcUser = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
)
export const IcPlus = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
)
export const IcBack = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M15 5l-7 7 7 7" /></svg>
)
export const IcHeart = ({ size, className, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.5-9.2-9C1.3 8 3 4.8 6.2 4.8c2 0 3.2 1.2 3.8 2.4.6-1.2 1.8-2.4 3.8-2.4 3.2 0 4.9 3.2 3.4 6.2C19 15.5 12 20 12 20z" /></svg>
)
export const IcComment = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-4.5A8 8 0 1 1 21 12z" /></svg>
)
export const IcBell = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M18 8a6 6 0 0 0-12 0c0 7-2 9-2 9h16s-2-2-2-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
)
export const IcChevron = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M9 6l6 6-6 6" /></svg>
)
export const IcDots = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" /></svg>
)
export const IcImage = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 16l-5-5-6 6" /></svg>
)
export const IcCamera = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" /><circle cx="12" cy="13" r="4" /></svg>
)
export const IcSettings = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h5l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z" /></svg>
)
export const IcFlag = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 21V4h11l-1.5 4L16 12H5" /></svg>
)
export const IcTrophy = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 15h6M8 21h8M12 15v6" /></svg>
)
export const IcCheck = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12l4.5 4.5L19 6" /></svg>
)

export function IconBox({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center justify-center">{children}</span>
}
