import { useNavigate } from 'react-router-dom'
import type { Goal } from '../types'
import { useStore } from '../lib/store'
import { templateOf } from '../lib/selectors'
import { computeStats, freqLabel, relTime } from '../lib/date'
import { IcChevron } from './icons'

export function GoalCard({ goal }: { goal: Goal }) {
  const nav = useNavigate()
  const checkIns = useStore((s) => s.checkIns)
  const tpl = templateOf(goal.templateId)
  const stats = computeStats(goal, checkIns)

  const statusBadge =
    goal.status === 'active' ? null : (
      <span className={`chip ${goal.status === 'paused' ? 'bg-warn/15 text-warn' : 'bg-ink-700 text-muted'}`}>
        {goal.status === 'paused' ? '已暂停' : '已结束'}
      </span>
    )

  return (
    <button onClick={() => nav(`/goal/${goal.id}`)} className="card card-press p-4 w-full text-left">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/12 to-ink-800 flex items-center justify-center text-2xl shrink-0">{tpl?.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-paper truncate tracking-tightish">{goal.title}</span>
            {statusBadge}
          </div>
          <div className="text-xs text-muted mt-1">{tpl?.name} · {freqLabel(goal.frequency)}</div>
        </div>
        <IcChevron size={18} className="text-faint mt-1.5" />
      </div>

      <div className="mt-4 pt-4 border-t border-ink-700/40 grid grid-cols-4 gap-2 text-center">
        <Stat value={stats.currentStreak} label={goal.frequency.type === 'daily' ? '连续(天)' : '连续(次)'} accent />
        <Stat value={stats.longestStreak} label="历史最长" />
        <Stat value={`${Math.round(stats.last30Rate * 100)}%`} label="近30天" />
        <Stat value={stats.total} label="累计" />
      </div>

      {stats.lastCheckInAt && (
        <div className="mt-3 text-[11px] text-faint">最近打卡 · {relTime(stats.lastCheckInAt)}</div>
      )}
    </button>
  )
}

function Stat({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-lg font-semibold tracking-tightish ${accent ? 'text-accent' : 'text-paper'}`}>{value}</div>
      <div className="text-[10px] text-faint leading-tight mt-1">{label}</div>
    </div>
  )
}
