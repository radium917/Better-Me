// ------- 核心领域类型 -------

export type Frequency =
  | { type: 'daily' } // 每天一次
  | { type: 'weekly'; timesPerWeek: number } // 每周指定次数

export type GoalStatus = 'active' | 'paused' | 'ended'

/** 打卡时的心情标记 */
export type DayMood = 'happy' | 'calm' | 'motivated' | 'tired' | 'struggling' | 'proud'

/** 平台预置的目标模板 */
export interface GoalTemplate {
  id: string
  name: string
  emoji: string
  /** 所属冷启动分类 */
  category: '成长学习' | '健康生活' | '生活重启'
  blurb: string
  memberCount: number
}

/** 用户基于模板创建的个人目标 */
export interface Goal {
  id: string
  templateId: string
  title: string
  note?: string
  frequency: Frequency
  startDate: string // YYYY-MM-DD
  status: GoalStatus
}

/** 一条打卡内容 */
export interface CheckIn {
  id: string
  goalId: string
  userId: string
  text: string
  image?: string // 远程图片 URL 或本地上传后的 data URL
  mood?: DayMood
  createdAt: number
  likedBy: string[]
  /** 是否为该周期内的有效打卡（首条计基础积分） */
  effective: boolean
}

export interface Comment {
  id: string
  checkInId: string
  userId: string
  text: string
  createdAt: number
}

export interface Badge {
  id: string
  name: string
  emoji: string
  desc: string
  earnedAt?: number
}

export type NotificationType =
  | 'reminder'
  | 'like'
  | 'comment'
  | 'milestone'
  | 'points'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  createdAt: number
  read: boolean
}

export interface User {
  id: string
  phone: string
  nickname: string
  avatar: string // emoji
  bio: string
  points: number
  blockedUserIds: string[]
  /** 佩戴在昵称旁的勋章 id（可为空） */
  wornBadgeId?: string
}

export interface NotificationPrefs {
  reminder: boolean
  like: boolean
  comment: boolean
  milestone: boolean
  points: boolean
  reminderTime: string // HH:mm
}
