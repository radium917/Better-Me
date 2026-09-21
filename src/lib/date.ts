import type { CheckIn, Frequency, Goal } from '../types'

export const DAY = 24 * 60 * 60 * 1000

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateStrOf(ts: number): string {
  return todayStr(new Date(ts))
}

/** 该时间戳属于哪一天的 00:00（本地） */
export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** ISO 周一为一周起点，返回周起始日 00:00 */
export function startOfWeek(ts: number): number {
  const d = new Date(startOfDay(ts))
  const day = (d.getDay() + 6) % 7 // 周一=0
  d.setDate(d.getDate() - day)
  return d.getTime()
}

export function freqLabel(f: Frequency): string {
  return f.type === 'daily' ? '每天' : `每周 ${f.timesPerWeek} 次`
}

export function relTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  const days = Math.floor(diff / 86_400_000)
  if (days < 30) return `${days} 天前`
  return dateStrOf(ts)
}

/** 某目标的所有有效打卡（按天去重后）的日期集合 */
export function effectiveDates(goalId: string, checkIns: CheckIn[]): Set<string> {
  const set = new Set<string>()
  checkIns
    .filter((c) => c.goalId === goalId && c.effective)
    .forEach((c) => set.add(dateStrOf(c.createdAt)))
  return set
}

export interface GoalStats {
  total: number // 累计有效打卡次数
  currentStreak: number // 当前连续（天/周）
  longestStreak: number
  last30Rate: number // 最近30天完成率 0-1
  weekDone: number // 本周已完成次数
  weekTarget: number // 本周目标次数
  lastCheckInAt?: number
}

/** 计算目标统计。daily 用“天”，weekly 用“周” */
export function computeStats(goal: Goal, checkIns: CheckIn[]): GoalStats {
  const mine = checkIns
    .filter((c) => c.goalId === goal.id && c.effective)
    .sort((a, b) => a.createdAt - b.createdAt)

  const total = mine.length
  const lastCheckInAt = mine.length ? mine[mine.length - 1].createdAt : undefined

  // 本周完成度
  const weekStart = startOfWeek(Date.now())
  const weekDone = mine.filter((c) => c.createdAt >= weekStart).length
  const weekTarget = goal.frequency.type === 'daily' ? 7 : goal.frequency.timesPerWeek

  // 最近30天完成率
  const since = startOfDay(Date.now()) - 29 * DAY
  const recent = mine.filter((c) => c.createdAt >= since).length
  const denom = goal.frequency.type === 'daily' ? 30 : Math.max(1, Math.round((30 / 7) * goal.frequency.timesPerWeek))
  const last30Rate = Math.min(1, recent / denom)

  let currentStreak = 0
  let longestStreak = 0

  if (goal.frequency.type === 'daily') {
    const days = new Set(mine.map((c) => dateStrOf(c.createdAt)))
    // 当前连续：从今天或昨天往回
    let cursor = startOfDay(Date.now())
    if (!days.has(dateStrOf(cursor))) cursor -= DAY // 允许今天还没打，从昨天算
    while (days.has(dateStrOf(cursor))) {
      currentStreak++
      cursor -= DAY
    }
    // 最长连续
    const sorted = [...days].sort()
    let run = 0
    let prev = 0
    for (const ds of sorted) {
      const t = startOfDay(new Date(ds + 'T00:00:00').getTime())
      if (prev && t - prev === DAY) run++
      else run = 1
      longestStreak = Math.max(longestStreak, run)
      prev = t
    }
  } else {
    // weekly：按“自然周是否完成”记录连续次数
    // 规则：本周（进行中）计入其已打卡的全部次数；再往前累加每个「已达标」自然周
    // 的次数；一旦遇到未达标（< 目标次数）的过去周，连续即中断为 0。
    const perWeek = new Map<number, number>()
    mine.forEach((c) => {
      const w = startOfWeek(c.createdAt)
      perWeek.set(w, (perWeek.get(w) || 0) + 1)
    })
    const target = goal.frequency.timesPerWeek

    const thisWeek = startOfWeek(Date.now())
    currentStreak = perWeek.get(thisWeek) || 0 // 本周未判定失败，先计入其次数
    let cursor = thisWeek - 7 * DAY
    while ((perWeek.get(cursor) || 0) >= target) {
      currentStreak += perWeek.get(cursor)!
      cursor -= 7 * DAY
    }

    // 历史最长：连续达标周内累计次数的最大值
    const weeks = [...perWeek.keys()].sort((a, b) => a - b)
    let run = 0
    let prev = 0
    for (const w of weeks) {
      const cnt = perWeek.get(w)!
      if (cnt >= target) {
        if (prev && w - prev === 7 * DAY) run += cnt
        else run = cnt
        longestStreak = Math.max(longestStreak, run)
        prev = w
      } else {
        run = 0
        prev = 0
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak)
  }

  return { total, currentStreak, longestStreak, last30Rate, weekDone, weekTarget, lastCheckInAt }
}

/** 生成进度文案数组 */
export function progressLabels(goal: Goal, stats: GoalStats): string[] {
  const out: string[] = []
  if (goal.frequency.type === 'daily') {
    out.push(`连续第 ${stats.currentStreak} 天`)
  } else {
    out.push(`本周第 ${stats.weekDone}/${stats.weekTarget} 次`)
  }
  out.push(`累计完成 ${stats.total} 次`)
  return out
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}
