import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IcBack } from './icons'

export function TopBar({
  title,
  subtitle,
  right,
  onBack,
  hideBack,
}: {
  title?: ReactNode
  subtitle?: string
  right?: ReactNode
  onBack?: () => void
  hideBack?: boolean
}) {
  const nav = useNavigate()
  return (
    <div className="app-header">
      <div className="h-14 px-2.5 flex items-center gap-1.5">
        {!hideBack && (
          <button
            onClick={() => (onBack ? onBack() : nav(-1))}
            className="w-9 h-9 flex items-center justify-center rounded-full text-paper active:bg-ink-800 transition-colors"
            aria-label="返回"
          >
            <IcBack />
          </button>
        )}
        <div className={`min-w-0 flex-1 ${hideBack ? 'pl-2' : ''}`}>
          {title && <div className="text-[17px] font-semibold text-paper truncate leading-tight serif">{title}</div>}
          {subtitle && <div className="text-xs text-muted truncate mt-0.5">{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  )
}
