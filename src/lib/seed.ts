import type { Badge, CheckIn, Comment, Goal, GoalTemplate, User } from '../types'
import { DAY } from './date'

export const TEMPLATES: GoalTemplate[] = [
  { id: 't_read', name: '阅读', emoji: '📖', category: '成长学习', blurb: '每天翻开一本书，把碎片时间还给自己。', memberCount: 1248 },
  { id: 't_run', name: '跑步', emoji: '🏃', category: '健康生活', blurb: '一步步跑起来，和同频的人互相打气。', memberCount: 986 },
  { id: 't_sleep', name: '早睡', emoji: '🌙', category: '健康生活', blurb: '放下手机，给身体一个准时的夜晚。', memberCount: 1523 },
  { id: 't_wake', name: '早起', emoji: '🌅', category: '生活重启', blurb: '把清晨夺回来，一天从容一点。', memberCount: 742 },
  { id: 't_words', name: '背单词', emoji: '🔤', category: '成长学习', blurb: '每天一点，词汇量悄悄长起来。', memberCount: 631 },
  { id: 't_fit', name: '健身', emoji: '💪', category: '健康生活', blurb: '不追求完美身材，只追求今天动过。', memberCount: 890 },
  { id: 't_write', name: '写作', emoji: '✍️', category: '成长学习', blurb: '哪怕只写三行，也是在整理自己。', memberCount: 415 },
  { id: 't_exam', name: '备考', emoji: '🎯', category: '成长学习', blurb: '把大目标拆成每天可完成的一小步。', memberCount: 528 },
]

// ---- 虚拟同行者 ----
export const PEERS: User[] = [
  { id: 'u_lin', phone: '', nickname: '林间读书', avatar: '🦉', bio: '睡前一章，雷打不动。', points: 320, blockedUserIds: [] },
  { id: 'u_ann', phone: '', nickname: '安晓跑', avatar: '🦌', bio: '慢慢跑，不停下。', points: 210, blockedUserIds: [] },
  { id: 'u_zhou', phone: '', nickname: '周十一点', avatar: '🐨', bio: '和熬夜说再见。', points: 480, blockedUserIds: [] },
  { id: 'u_mo', phone: '', nickname: '墨鱼写字', avatar: '🐙', bio: '日更三百字。', points: 156, blockedUserIds: [] },
  { id: 'u_qi', phone: '', nickname: '七点起床', avatar: '🐓', bio: '清晨是我的。', points: 275, blockedUserIds: [] },
]

const now = Date.now()

const MOCK_IMAGES = {
  run: 'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20editorial%20smartphone%20photograph%20of%20a%20quiet%20green%20riverside%20running%20path%20after%20a%20morning%20jog%2C%20running%20shoes%20resting%20in%20the%20foreground%2C%20soft%20natural%20daylight%2C%20fresh%20and%20authentic%2C%20premium%20wellness%20journal%20aesthetic%2C%20no%20people%2C%20no%20text%2C%20natural%20colors&image_size=landscape_4_3',
  sunrise: 'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20smartphone%20photograph%20of%20a%20warm%20sunrise%20seen%20from%20a%20quiet%20bedroom%20window%2C%20soft%20morning%20light%2C%20subtle%20curtains%2C%20calm%20daily%20life%20moment%2C%20premium%20lifestyle%20journal%20aesthetic%2C%20no%20people%2C%20no%20text%2C%20natural%20colors&image_size=landscape_4_3',
  reading: 'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20editorial%20smartphone%20photograph%20of%20an%20open%20book%20on%20a%20wooden%20desk%20beside%20a%20ceramic%20cup%20and%20small%20green%20plant%2C%20gentle%20window%20light%2C%20quiet%20evening%20reading%20moment%2C%20premium%20natural%20lifestyle%20aesthetic%2C%20no%20visible%20text%2C%20no%20people&image_size=landscape_4_3',
  sleep: 'https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=realistic%20smartphone%20photograph%20of%20a%20calm%20bedside%20table%20at%20night%2C%20phone%20placed%20face%20down%2C%20warm%20reading%20lamp%2C%20neatly%20made%20bed%2C%20peaceful%20healthy%20sleep%20routine%2C%20premium%20wellness%20journal%20aesthetic%2C%20no%20people%2C%20no%20text&image_size=landscape_4_3',
}

// 生成一些历史打卡（同行者），让社区不空
function peerCheckIns(): CheckIn[] {
  const list: CheckIn[] = []
  const push = (
    goalId: string,
    userId: string,
    text: string,
    daysAgo: number,
    mood: CheckIn['mood'],
    image?: string,
  ) => {
    list.push({
      id: `seed_${goalId}_${userId}_${daysAgo}`,
      goalId,
      userId,
      text,
      mood,
      image,
      createdAt: now - daysAgo * DAY - Math.floor(Math.random() * 6) * 3600_000,
      likedBy: [],
      effective: true,
    })
  }
  push('sg_ann_run', 'u_ann', '5 公里，配速比上周快了 10 秒。', 0, 'motivated', MOCK_IMAGES.run)
  push('sg_qi_wake', 'u_qi', '6:40 起床，看了日出，值了。', 0, 'happy', MOCK_IMAGES.sunrise)
  push('sg_lin_read', 'u_lin', '读完《被讨厌的勇气》第三章，课题分离真的很戳。', 0, 'proud', MOCK_IMAGES.reading)
  push('sg_mo_write', 'u_mo', '写了 300 字随笔，关于地铁上的陌生人。', 1, 'calm')
  push('sg_zhou_sleep', 'u_zhou', '10:45 躺下，手机放到了客厅充电。', 1, 'happy', MOCK_IMAGES.sleep)
  push('sg_lin_read', 'u_lin', '今天只读了 15 分钟，但没有断。', 2, 'tired')
  push('sg_ann_run', 'u_ann', '下雨改室内跑步机，也算数。', 2, 'struggling')
  return list
}

// 同行者的"个人目标"（供社区展示进度）
export const SEED_PEER_GOALS: Goal[] = [
  { id: 'sg_lin_read', templateId: 't_read', title: '睡前读书 20 分钟', frequency: { type: 'daily' }, startDate: '2026-08-01', status: 'active' },
  { id: 'sg_mo_write', templateId: 't_write', title: '每天写 300 字', frequency: { type: 'daily' }, startDate: '2026-08-10', status: 'active' },
  { id: 'sg_ann_run', templateId: 't_run', title: '每周跑 4 次', frequency: { type: 'weekly', timesPerWeek: 4 }, startDate: '2026-07-20', status: 'active' },
  { id: 'sg_zhou_sleep', templateId: 't_sleep', title: '11 点前睡觉', frequency: { type: 'daily' }, startDate: '2026-08-05', status: 'active' },
  { id: 'sg_qi_wake', templateId: 't_wake', title: '每天 6:30 起床', frequency: { type: 'daily' }, startDate: '2026-08-15', status: 'active' },
]

export const SEED_PEER_CHECKINS: CheckIn[] = peerCheckIns()

export const SEED_COMMENTS: Comment[] = [
  { id: 'c1', checkInId: 'seed_sg_lin_read_0', userId: 'u_zhou', text: '这本我也在读，一起加油！', createdAt: now - 2 * 3600_000 },
]

export const ALL_BADGES: Badge[] = [
  { id: 'b_start', name: '第一次开始', emoji: '🌱', desc: '创建并完成第一次打卡' },
  { id: 'b_7', name: '累计完成 7 次', emoji: '🔥', desc: '任意目标累计打卡 7 次' },
  { id: 'b_30', name: '累计完成 30 次', emoji: '🏅', desc: '任意目标累计打卡 30 次' },
  { id: 'b_streak7', name: '连续坚持 7 天', emoji: '⚡', desc: '某个每日目标连续 7 天' },
  { id: 'b_restart', name: '中断后重新开始', emoji: '🔄', desc: '断签后再次打卡' },
]

export const RANDOM_PROMPTS = [
  '今天完成了什么？',
  '今天最难的是什么？',
  '有什么值得记录？',
  '明天准备如何继续？',
]

export function defaultUser(): User {
  return {
    id: 'me',
    phone: '',
    nickname: '',
    avatar: '🙂',
    bio: '从零开始，慢慢坚持。',
    points: 0,
    blockedUserIds: [],
  }
}
