import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { moodMap, templateOf } from '../lib/selectors'
import { computeStats, DAY, dateStrOf, effectiveDates, freqLabel, startOfDay, startOfWeek } from '../lib/date'
import type { CheckIn } from '../types'
import { TopBar } from '../components/TopBar'
import { CheckInCard } from '../components/CheckInCard'

type Tab = 'summary' | 'history'

export function GoalDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const goal = useStore((s) => s.goals.find((g) => g.id === id))
  const checkIns = useStore((s) => s.checkIns)
  const setGoalStatus = useStore((s) => s.setGoalStatus)
  const [menu, setMenu] = useState(false)
  const [tab, setTab] = useState<Tab>('summary')

  const stats = useMemo(() => (goal ? computeStats(goal, checkIns) : undefined), [goal, checkIns])
  const dates = useMemo(() => (goal ? effectiveDates(goal.id, checkIns) : new Set<string>()), [goal, checkIns])
  // 每天对应的打卡（同一天多条取最新，用于日历点开查看当天详情）
  const checkinByDate = useMemo(() => {
    const map = new Map<string, CheckIn>()
    checkIns
      .filter((c) => c.goalId === id)
      .sort((a, b) => a.createdAt - b.createdAt)
      .forEach((c) => map.set(dateStrOf(c.createdAt), c))
    return map
  }, [checkIns, id])
  // 历史打卡（倒序）
  const myHistory = useMemo(
    () => checkIns.filter((c) => c.goalId === id).sort((a, b) => b.createdAt - a.createdAt),
    [checkIns, id],
  )

  if (!goal || !stats) {
    return (
      <div>
        <TopBar title="目标详情" />
        <div className="p-6 text-muted">未找到该目标。</div>
      </div>
    )
  }

  const tpl = templateOf(goal.templateId)

  // 最近 5 周日历（周一为起点，行=周），每格：日期 + 心情 emoji
  const thisWeekStart = startOfWeek(Date.now())
  const todayDs = dateStrOf(Date.now())
  const calendarRows = Array.from({ length: 5 }).map((_, row) => {
    const weekStart = thisWeekStart - (4 - row) * 7 * DAY
    const days = Array.from({ length: 7 }).map((_, col) => {
      const t = weekStart + col * DAY
      const ds = dateStrOf(t)
      const d = new Date(t)
      return {
        ds,
        dayNum: d.getDate(),
        isFirstOfMonth: d.getDate() === 1,
        month: d.getMonth() + 1,
        future: t > startOfDay(Date.now()),
        isToday: ds === todayDs,
        done: dates.has(ds),
        checkIn: checkinByDate.get(ds),
      }
    })
    return { weekStart, days }
  })
  const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div>
      <TopBar
        title={goal.title}
        subtitle={`${tpl?.name} · ${freqLabel(goal.frequency)}`}
        right={
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)} className="text-sm text-muted px-2">管理</button>
            {menu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-8 z-40 w-32 card p-1 text-sm">
                  {goal.status !== 'active' && (
                    <button onClick={() => { setGoalStatus(goal.id, 'active'); setMenu(false) }} className="w-full text-left px-3 py-2 rounded-lg active:bg-ink-800">恢复进行</button>
                  )}
                  {goal.status === 'active' && (
                    <button onClick={() => { setGoalStatus(goal.id, 'paused'); setMenu(false) }} className="w-full text-left px-3 py-2 rounded-lg active:bg-ink-800">暂停目标</button>
                  )}
                  <button onClick={() => { setGoalStatus(goal.id, 'ended'); setMenu(false) }} className="w-full text-left px-3 py-2 rounded-lg text-danger active:bg-ink-800">结束目标</button>
                </div>
              </>
            )}
          </div>
        }
      />

      {/* 两个 tab：汇总 / 历史打卡 */}
      <div className="px-4 pt-3">
        <div className="inline-flex gap-1 p-1 rounded-full bg-ink-800/60">
          {([
            { key: 'summary', label: '汇总' },
            { key: 'history', label: '历史打卡' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                tab === t.key ? 'bg-ink-850 text-paper shadow-soft' : 'text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {goal.note && <div className="text-sm text-muted">{goal.note}</div>}

        {/* 重新开始提示 */}
        {goal.status === 'active' && stats.currentStreak === 0 && stats.total > 0 && (
          <div className="card p-4 border-accent/40 bg-accent/5">
            <div className="text-sm text-paper font-medium">要不要重新开始？🔄</div>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              连续记录中断了，但你已累计 {stats.total} 次的努力都还在。直接继续打卡就好，无需重建目标。
            </p>
            <button onClick={() => nav(`/publish?goal=${goal.id}`)} className="btn-primary mt-3 w-full text-sm py-2.5">继续打卡</button>
          </div>
        )}

        {tab === 'summary' ? (
          <>
            {/* 关键数据 */}
            <div className="card p-5">
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <Metric value={stats.currentStreak} label={goal.frequency.type === 'daily' ? '当前连续（天）' : '当前连续（次）'} accent />
                <Metric value={stats.longestStreak} label="历史最长连续" />
                <Metric value={`${Math.round(stats.last30Rate * 100)}%`} label="最近 30 天完成率" />
                <Metric value={stats.total} label="累计完成次数" />
              </div>
              <p className="mt-4 pt-3 border-t border-ink-700/40 text-[11px] text-faint leading-relaxed">我们同时展示累计与完成率，而不仅是连续天数——断签不等于失败。</p>
            </div>

            {/* 日历：最近 5 周，每格 日期 + 心情，点击查看当天详情 */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="label">最近 5 周</div>
                <div className="flex items-center gap-3 text-[11px] text-faint">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[4px] bg-accent/70 inline-block" />已打卡</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[4px] bg-ink-800 border border-ink-700/60 inline-block" />未打卡</span>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {WEEK_LABELS.map((w) => (
                  <div key={w} className="text-center text-[10px] text-faint/80">{w}</div>
                ))}
              </div>
              <div className="space-y-1.5">
                {calendarRows.map((rowData) => (
                  <div key={rowData.weekStart} className="grid grid-cols-7 gap-1.5">
                    {rowData.days.map((d) => {
                      const mood = d.checkIn?.mood ? moodMap[d.checkIn.mood] : undefined
                      const clickable = !!d.checkIn
                      return (
                        <button
                          key={d.ds}
                          disabled={!clickable}
                          onClick={() => d.checkIn && nav(`/checkin/${d.checkIn.id}`)}
                          title={d.ds}
                          className={`h-12 rounded-xl px-1 py-1.5 flex flex-col items-center overflow-hidden border text-center transition-all duration-200 ${
                            d.done
                              ? 'bg-accent/10 border-accent/30'
                              : d.future
                                ? 'bg-transparent border-transparent'
                                : 'bg-ink-800/60 border-ink-700/50'
                          } ${d.isToday ? 'ring-1 ring-accent ring-offset-1 ring-offset-ink-850' : ''} ${clickable ? 'active:scale-95' : ''}`}
                        >
                          {!d.future && (
                            <>
                              <span className={`h-2.5 shrink-0 text-[9px] leading-none ${d.done ? 'text-accent font-semibold' : 'text-faint'}`}>
                                {d.isFirstOfMonth ? `${d.month}/1` : d.dayNum}
                              </span>
                              <div className="mt-1 flex-1 min-h-0 w-full flex items-center justify-center">
                                {mood ? (
                                  <span className="text-[15px] leading-none">{mood.emoji}</span>
                                ) : d.done ? (
                                  <span className="text-accent text-xs leading-none">✓</span>
                                ) : null}
                              </div>
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-faint leading-relaxed">仅展示日期与当天心情，点击某天可查看完整详情。</p>
            </div>
          </>
        ) : (
          /* 历史打卡：完整记录 */
          <div className="space-y-3">
            {myHistory.length ? (
              myHistory.map((c, i) => (
                <div key={c.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 6) * 45}ms` }}>
                  <CheckInCard checkIn={c} />
                </div>
              ))
            ) : (
              <div className="card p-8 text-center text-sm text-muted">还没有打卡记录。</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-[26px] font-semibold leading-none tracking-tightish ${accent ? 'text-accent' : 'text-paper'}`}>{value}</div>
      <div className="text-xs text-faint mt-1.5">{label}</div>
    </div>
  )
}
