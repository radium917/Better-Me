import { useStore } from './store'
import { PEERS, TEMPLATES } from './seed'
import type { DayMood, User } from '../types'

export function useTemplate(templateId?: string) {
  return TEMPLATES.find((t) => t.id === templateId)
}

export function templateOf(templateId?: string) {
  return TEMPLATES.find((t) => t.id === templateId)
}

export function userOf(userId: string): User {
  if (userId === 'me') return useStore.getState().user
  return PEERS.find((p) => p.id === userId) || { id: userId, phone: '', nickname: '匿名同学', avatar: '👤', bio: '', points: 0, blockedUserIds: [] }
}

/** 常见心情列表（发布与展示共用，顺序即展示顺序） */
export const MOODS: { key: DayMood; label: string; emoji: string }[] = [
  { key: 'happy', label: '开心', emoji: '😊' },
  { key: 'calm', label: '平静', emoji: '🍃' },
  { key: 'motivated', label: '充满干劲', emoji: '🔥' },
  { key: 'proud', label: '有成就感', emoji: '🌟' },
  { key: 'tired', label: '有点累', emoji: '😮‍💨' },
  { key: 'struggling', label: '很挣扎', emoji: '🌧️' },
]

export const moodMap: Record<DayMood, { label: string; emoji: string }> = MOODS.reduce(
  (acc, m) => {
    acc[m.key] = { label: m.label, emoji: m.emoji }
    return acc
  },
  {} as Record<DayMood, { label: string; emoji: string }>,
)
