import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppNotification,
  Badge,
  CheckIn,
  Comment,
  DayMood,
  Frequency,
  Goal,
  NotificationPrefs,
  NotificationType,
  User,
} from '../types'
import {
  ALL_BADGES,
  defaultUser,
  PEERS,
  SEED_COMMENTS,
  SEED_PEER_CHECKINS,
  SEED_PEER_GOALS,
} from './seed'
import { computeStats, dateStrOf, startOfDay, startOfWeek, uid } from './date'

const POINTS_CHECKIN = 10
const POINTS_MILESTONE = 30
const UNLOCK_SLOT_COST = 200

interface CreateGoalInput {
  templateId: string
  title: string
  note?: string
  frequency: Frequency
  startDate: string
}

interface AppState {
  onboarded: boolean
  authed: boolean
  user: User
  peers: User[]
  goals: Goal[] // 我的目标 + 同行者目标（同行者目标 id 以 sg_ 开头）
  checkIns: CheckIn[]
  comments: Comment[]
  badges: Badge[] // 已获得
  notifications: AppNotification[]
  prefs: NotificationPrefs
  unlockedExtraSlot: boolean

  // auth / profile
  login: (phone: string, nickname: string) => void
  logout: () => void
  deleteAccount: () => void
  updateProfile: (patch: Partial<Pick<User, 'nickname' | 'avatar' | 'bio'>>) => void
  wearBadge: (badgeId?: string) => void
  finishOnboarding: () => void

  // goals
  myGoals: () => Goal[]
  activeGoals: () => Goal[]
  createGoal: (input: CreateGoalInput) => string | { error: string }
  setGoalStatus: (goalId: string, status: Goal['status']) => void
  unlockSlot: () => boolean

  // check-ins
  publishCheckIn: (goalId: string, text: string, image?: string, mood?: DayMood) => { checkIn: CheckIn; earnedPoints: number; newBadges: Badge[] }
  deleteCheckIn: (id: string) => void
  toggleLike: (checkInId: string) => void
  addComment: (checkInId: string, text: string) => void
  deleteComment: (id: string) => void

  // social safety
  blockUser: (userId: string) => void
  unblockUser: (userId: string) => void
  reportContent: (checkInId: string, reason: string) => void

  // notifications
  markAllRead: () => void
  updatePrefs: (patch: Partial<NotificationPrefs>) => void
}

function isEffective(goalId: string, goals: Goal[], checkIns: CheckIn[], at: number): boolean {
  const goal = goals.find((g) => g.id === goalId)
  if (!goal) return false
  if (goal.frequency.type === 'daily') {
    const day = dateStrOf(at)
    return !checkIns.some((c) => c.goalId === goalId && c.effective && dateStrOf(c.createdAt) === day)
  } else {
    // weekly：本周有效次数未达上限则算有效
    const weekStart = startOfWeek(at)
    const count = checkIns.filter((c) => c.goalId === goalId && c.effective && c.createdAt >= weekStart).length
    return count < goal.frequency.timesPerWeek
  }
}

function pushNotification(
  list: AppNotification[],
  prefs: NotificationPrefs,
  type: NotificationType,
  title: string,
  body: string,
): AppNotification[] {
  if (!prefs[type as keyof NotificationPrefs]) return list
  return [
    { id: uid('n'), type, title, body, createdAt: Date.now(), read: false },
    ...list,
  ]
}

const defaultPrefs: NotificationPrefs = {
  reminder: true,
  like: true,
  comment: true,
  milestone: true,
  points: true,
  reminderTime: '21:00',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      authed: false,
      user: defaultUser(),
      peers: PEERS,
      goals: [...SEED_PEER_GOALS],
      checkIns: [...SEED_PEER_CHECKINS],
      comments: [...SEED_COMMENTS],
      badges: [],
      notifications: [],
      prefs: defaultPrefs,
      unlockedExtraSlot: false,

      login: (phone, nickname) =>
        set((s) => ({
          authed: true,
          user: { ...s.user, phone, nickname: nickname || s.user.nickname || '新同学' },
        })),

      logout: () => set({ authed: false }),

      deleteAccount: () =>
        set({
          onboarded: false,
          authed: false,
          user: defaultUser(),
          goals: [...SEED_PEER_GOALS],
          checkIns: [...SEED_PEER_CHECKINS],
          comments: [...SEED_COMMENTS],
          badges: [],
          notifications: [],
          unlockedExtraSlot: false,
        }),

      updateProfile: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      wearBadge: (badgeId) =>
        set((s) => ({
          user: {
            ...s.user,
            wornBadgeId: s.user.wornBadgeId === badgeId ? undefined : badgeId,
          },
        })),

      finishOnboarding: () => set({ onboarded: true, authed: true }),

      myGoals: () => get().goals.filter((g) => !g.id.startsWith('sg_')),
      activeGoals: () => get().goals.filter((g) => !g.id.startsWith('sg_') && g.status === 'active'),

      createGoal: (input) => {
        const active = get().activeGoals()
        const limit = get().unlockedExtraSlot ? 4 : 3
        if (active.length >= limit) {
          return { error: `进行中的目标已达上限（${limit} 个），可暂停已有目标或用积分解锁名额。` }
        }
        const goal: Goal = {
          id: uid('goal'),
          templateId: input.templateId,
          title: input.title.trim() || '我的目标',
          note: input.note?.trim() || undefined,
          frequency: input.frequency,
          startDate: input.startDate,
          status: 'active',
        }
        set((s) => ({ goals: [goal, ...s.goals] }))
        return goal.id
      },

      setGoalStatus: (goalId, status) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === goalId ? { ...g, status } : g)) })),

      unlockSlot: () => {
        const { user, unlockedExtraSlot } = get()
        if (unlockedExtraSlot) return true
        if (user.points < UNLOCK_SLOT_COST) return false
        set({ unlockedExtraSlot: true, user: { ...user, points: user.points - UNLOCK_SLOT_COST } })
        return true
      },

      publishCheckIn: (goalId, text, image, mood) => {
        const state = get()
        const at = Date.now()
        const effective = isEffective(goalId, state.goals, state.checkIns, at)
        const checkIn: CheckIn = {
          id: uid('ci'),
          goalId,
          userId: 'me',
          text: text.trim(),
          image,
          mood,
          createdAt: at,
          likedBy: [],
          effective,
        }

        let earnedPoints = 0
        const newBadges: Badge[] = []
        let notifications = state.notifications

        const nextCheckIns = [checkIn, ...state.checkIns]
        const goal = state.goals.find((g) => g.id === goalId)!

        if (effective) {
          earnedPoints += POINTS_CHECKIN
          // 里程碑判断
          const stats = computeStats(goal, nextCheckIns)
          const haveBadge = (id: string) => state.badges.some((b) => b.id === id)
          const grant = (id: string) => {
            const def = ALL_BADGES.find((b) => b.id === id)
            if (def && !haveBadge(id) && !newBadges.some((b) => b.id === id)) {
              newBadges.push({ ...def, earnedAt: at })
            }
          }
          // 第一次开始
          if (state.checkIns.filter((c) => c.userId === 'me' && c.effective).length === 0) grant('b_start')
          const myTotal = nextCheckIns.filter((c) => c.userId === 'me' && c.effective).length
          if (myTotal >= 7) grant('b_7')
          if (myTotal >= 30) grant('b_30')
          if (goal.frequency.type === 'daily' && stats.currentStreak >= 7) {
            grant('b_streak7')
            earnedPoints += POINTS_MILESTONE
            notifications = pushNotification(notifications, state.prefs, 'milestone', '里程碑达成', `「${goal.title}」连续坚持 7 天！`)
          }
          // 中断后重新开始：上一次有效打卡距今 > 1 个周期
          const myPrev = state.checkIns
            .filter((c) => c.goalId === goalId && c.effective)
            .sort((a, b) => b.createdAt - a.createdAt)[0]
          if (myPrev) {
            const gap = goal.frequency.type === 'daily'
              ? startOfDay(at) - startOfDay(myPrev.createdAt) > 24 * 3600_000 * 1.5
              : startOfWeek(at) - startOfWeek(myPrev.createdAt) > 7 * 24 * 3600_000
            if (gap) grant('b_restart')
          }

          notifications = pushNotification(notifications, state.prefs, 'points', '获得积分', `有效打卡 +${POINTS_CHECKIN} 积分`)
        }

        newBadges.forEach((b) => {
          notifications = pushNotification(notifications, state.prefs, 'milestone', '获得勋章', `${b.emoji} ${b.name}`)
        })

        set({
          checkIns: nextCheckIns,
          user: { ...state.user, points: state.user.points + earnedPoints },
          badges: [...state.badges, ...newBadges],
          notifications,
        })

        return { checkIn, earnedPoints, newBadges }
      },

      deleteCheckIn: (id) => {
        const state = get()
        const target = state.checkIns.find((c) => c.id === id)
        if (!target) return
        let points = state.user.points
        // 删除有效打卡：退回基础积分并让同周期后续内容中最早一条转正
        let checkIns = state.checkIns.filter((c) => c.id !== id)
        if (target.effective && target.userId === 'me') {
          points = Math.max(0, points - POINTS_CHECKIN)
          const goal = state.goals.find((g) => g.id === target.goalId)
          if (goal) {
            const sameCycle = checkIns
              .filter((c) => c.goalId === target.goalId && c.userId === 'me' && !c.effective)
              .filter((c) =>
                goal.frequency.type === 'daily'
                  ? dateStrOf(c.createdAt) === dateStrOf(target.createdAt)
                  : startOfWeek(c.createdAt) === startOfWeek(target.createdAt),
              )
              .sort((a, b) => a.createdAt - b.createdAt)
            if (sameCycle[0]) {
              checkIns = checkIns.map((c) => (c.id === sameCycle[0].id ? { ...c, effective: true } : c))
              points += POINTS_CHECKIN
            }
          }
        }
        set({
          checkIns,
          comments: state.comments.filter((c) => c.checkInId !== id),
          user: { ...state.user, points },
        })
      },

      toggleLike: (checkInId) =>
        set((s) => {
          let liked = false
          const checkIns = s.checkIns.map((c) => {
            if (c.id !== checkInId) return c
            const has = c.likedBy.includes('me')
            liked = !has
            return { ...c, likedBy: has ? c.likedBy.filter((u) => u !== 'me') : [...c.likedBy, 'me'] }
          })
          const target = s.checkIns.find((c) => c.id === checkInId)
          let notifications = s.notifications
          if (liked && target && target.userId !== 'me') {
            notifications = pushNotification(notifications, s.prefs, 'like', '收到点赞', '有人为你的打卡点了赞')
          }
          return { checkIns, notifications }
        }),

      addComment: (checkInId, text) =>
        set((s) => {
          const comment: Comment = { id: uid('cm'), checkInId, userId: 'me', text: text.trim(), createdAt: Date.now() }
          const target = s.checkIns.find((c) => c.id === checkInId)
          let notifications = s.notifications
          if (target && target.userId !== 'me') {
            notifications = pushNotification(notifications, s.prefs, 'comment', '收到评论', text.trim().slice(0, 20))
          }
          return { comments: [...s.comments, comment], notifications }
        }),

      deleteComment: (id) => set((s) => ({ comments: s.comments.filter((c) => c.id !== id) })),

      blockUser: (userId) =>
        set((s) => ({ user: { ...s.user, blockedUserIds: [...new Set([...s.user.blockedUserIds, userId])] } })),

      unblockUser: (userId) =>
        set((s) => ({ user: { ...s.user, blockedUserIds: s.user.blockedUserIds.filter((u) => u !== userId) } })),

      reportContent: (_checkInId, _reason) => {
        // MVP：仅记录到通知，作为“已收到举报”的反馈
        set((s) => ({
          notifications: pushNotification(s.notifications, s.prefs, 'points', '举报已提交', '我们会尽快处理，感谢你维护社区。'),
        }))
      },

      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      updatePrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),
    }),
    {
      name: 'better-me-store',
      version: 3,
      // v3: 将同行 mock 配图升级为真实图片，并移除旧版用户打卡中的 emoji 图片占位
      migrate: (persisted: any, version) => {
        if (!persisted) return persisted
        if (version < 3) {
          const userCheckIns = (persisted.checkIns ?? [])
            .filter((c: CheckIn) => !c.id.startsWith('seed_'))
            .map((c: CheckIn) => {
              const isRealImage = c.image?.startsWith('http') || c.image?.startsWith('data:image/')
              return c.image && !isRealImage ? { ...c, image: undefined } : c
            })
          const userGoals = (persisted.goals ?? []).filter((g: Goal) => !g.id.startsWith('sg_'))
          persisted.checkIns = [...SEED_PEER_CHECKINS, ...userCheckIns]
          persisted.goals = [...SEED_PEER_GOALS, ...userGoals]
        }
        return persisted
      },
    },
  ),
)

export const POINTS = { checkin: POINTS_CHECKIN, milestone: POINTS_MILESTONE, unlockSlot: UNLOCK_SLOT_COST }
