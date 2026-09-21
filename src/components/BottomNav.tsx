import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { IcHome, IcPlus, IcUser } from './icons'

export function BottomNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const [spinning, setSpinning] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const hidden = loc.pathname.startsWith('/publish')
  if (hidden) return null

  const refreshCommunity = () => {
    // 点击「同行」时刷新：滚回顶部并重置动态（清掉置顶/子筛选）
    document.getElementById('app-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
    nav(`/community?r=${Date.now()}`, { replace: true })
    // icon 转圈反馈，内容更新后恢复
    setSpinning(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setSpinning(false), 700)
  }

  const item = (to: string, label: string, Icon: typeof IcHome) => {
    const isCommunity = to === '/community'
    return (
      <NavLink
        to={to}
        onClick={(e) => {
          if (isCommunity) {
            e.preventDefault()
            refreshCommunity()
          }
        }}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10.5px] font-medium transition-colors duration-200 ${
            isActive ? 'text-accent' : 'text-faint'
          }`
        }
      >
        <Icon size={22} className={isCommunity && spinning ? 'animate-spin' : undefined} />
        <span className="tracking-wide">{label}</span>
      </NavLink>
    )
  }

  return (
    <div className="relative border-t border-ink-700/40 bg-ink-850/90 backdrop-blur-xl">
      <div className="flex items-stretch h-[4.25rem] px-2">
        {item('/community', '同行', IcHome)}
        <div className="w-20 flex items-start justify-center">
          <button
            onClick={() => nav('/publish')}
            className="-mt-6 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center border-4 border-ink-850 active:scale-95 transition-transform duration-200"
            style={{ boxShadow: '0 6px 16px -4px rgba(76,90,62,0.5), 0 2px 4px rgba(38,37,31,0.12)' }}
            aria-label="发布打卡"
          >
            <IcPlus size={26} />
          </button>
        </div>
        {item('/me', '我的', IcUser)}
      </div>
    </div>
  )
}
