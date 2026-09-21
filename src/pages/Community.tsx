import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { rankFeed } from '../lib/feed'
import { templateOf } from '../lib/selectors'
import { CheckInCard } from '../components/CheckInCard'
import { IcBell } from '../components/icons'

export function Community() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const pinnedId = sp.get('pin') || undefined
  const refreshKey = sp.get('r') || undefined
  const checkIns = useStore((s) => s.checkIns)
  const goals = useStore((s) => s.goals)
  const user = useStore((s) => s.user)
  const notifications = useStore((s) => s.notifications)
  const activeGoals = useStore((s) => s.activeGoals())

  const myTemplateIds = useMemo(() => new Set(activeGoals.map((g) => g.templateId)), [activeGoals])
  const myTemplates = useMemo(
    () => [...myTemplateIds].map((id) => templateOf(id)!).filter(Boolean),
    [myTemplateIds],
  )
  const [tab, setTab] = useState<string>('all')
  const unread = notifications.filter((n) => !n.read).length

  // 点击「同行」tab 刷新时，重置为「全部」子筛选
  useEffect(() => {
    if (refreshKey) setTab('all')
  }, [refreshKey])

  const feed = useMemo(() => {
    let ranked = rankFeed(checkIns, { goals, me: user, myTemplateIds, pinnedId })
    if (tab !== 'all') {
      ranked = ranked.filter((c) => {
        const g = goals.find((x) => x.id === c.goalId)
        return g?.templateId === tab
      })
    }
    return ranked
  }, [checkIns, goals, user, myTemplateIds, tab, pinnedId])

  return (
    <div>
      <div className="app-header">
        <div className="px-4 pt-4 pb-1 flex items-start justify-between">
          <div>
            <div className="page-title">同行</div>
            <div className="text-xs text-muted mt-1.5">和同行者一起，慢慢坚持</div>
          </div>
          <button onClick={() => nav('/notifications')} className="relative w-9 h-9 flex items-center justify-center rounded-full active:bg-ink-800 text-paper transition-colors">
            <IcBell />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-ink-900" />}
          </button>
        </div>
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setTab('all')} className={`chip ${tab === 'all' ? 'bg-accent text-white border-accent' : 'bg-ink-800/70 text-muted'}`}>
            全部
          </button>
          {myTemplates.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`chip ${tab === t.id ? 'bg-accent text-white border-accent' : 'bg-ink-800/70 text-muted'}`}>
              {t.emoji} {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        <div className="space-y-2.5">
          {feed.length ? (
            feed.map((c, i) => (
              <div key={c.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}>
                <CheckInCard checkIn={c} />
              </div>
            ))
          ) : (
            <div className="card p-10 text-center text-muted text-sm leading-relaxed">
              <div className="text-4xl mb-3">🌱</div>
              这里还很安静。<br />点击下方「+」发布你的第一条打卡吧。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
