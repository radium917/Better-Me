import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'

export function Splash() {
  const nav = useNavigate()
  const authed = useStore((s) => s.authed)
  const onboarded = useStore((s) => s.onboarded)
  const nextPath = authed ? (onboarded ? '/community' : '/onboarding') : '/auth'

  return (
    <div className="h-full min-h-screen sm:min-h-0 flex flex-col justify-between p-8 bg-gradient-to-b from-ink-900 to-ink-850">
      <div className="pt-16 animate-rise">
        <div className="text-5xl">🌿</div>
        <h1 className="mt-6 text-[2.1rem] font-semibold leading-snug text-paper serif tracking-tightish">
          先因共同目标相遇，<br />再彼此陪伴坚持。
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          从零建立你的目标档案，用持续打卡记录过程，
          和拥有相同目标的人一起走下去。
        </p>
      </div>

      <div className="space-y-3 pb-6">
        <div className="flex gap-2 text-xs text-faint">
          <span className="chip bg-ink-800/70">🌱 低发布压力</span>
          <span className="chip bg-ink-800/70">🍃 同类陪伴</span>
          <span className="chip bg-ink-800/70">🔄 允许重新开始</span>
        </div>
        <button className="btn-primary w-full text-center" onClick={() => nav(nextPath)}>
          {authed && onboarded ? '继续坚持' : authed ? '继续设置目标' : '开始使用'}
        </button>
        {authed && onboarded && (
          <p className="text-center text-xs text-faint">已有档案，继续你的坚持</p>
        )}
      </div>
    </div>
  )
}
