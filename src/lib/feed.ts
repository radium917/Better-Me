import type { CheckIn, Goal, User } from '../types'

/**
 * MVP 规则排序（无个性化推荐）：
 * 1. 指定置顶的打卡（如刚发布的内容）永远排第一
 * 2. 相同目标（模板）内容优先
 * 3. 有完整正文或图片的内容优先
 * 4. 发布时间较新的优先
 */
export function rankFeed(
  checkIns: CheckIn[],
  ctx: {
    goals: Goal[]
    me: User
    myTemplateIds: Set<string>
    pinnedId?: string
  },
): CheckIn[] {
  const goalById = new Map(ctx.goals.map((g) => [g.id, g]))

  const visible = checkIns.filter((c) => !ctx.me.blockedUserIds.includes(c.userId))

  const score = (c: CheckIn) => {
    const goal = goalById.get(c.goalId)
    let s = 0
    // 指定置顶（刚发布）优先级最高，不受内容质量影响
    if (ctx.pinnedId && c.id === ctx.pinnedId) s += 100000
    if (goal && ctx.myTemplateIds.has(goal.templateId)) s += 500
    if (c.text.length >= 10 || c.image) s += 100
    return s
  }

  return [...visible].sort((a, b) => {
    const d = score(b) - score(a)
    if (d !== 0) return d
    return b.createdAt - a.createdAt
  })
}
