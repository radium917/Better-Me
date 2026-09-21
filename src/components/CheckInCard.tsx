import { useNavigate } from 'react-router-dom'
import type { CheckIn, Goal } from '../types'
import { useStore } from '../lib/store'
import { templateOf, userOf } from '../lib/selectors'
import { dateStrOf, effectiveDates } from '../lib/date'
import { IcComment, IcDots, IcHeart } from './icons'
import { useState } from 'react'

export function Avatar({ emoji, size = 40 }: { emoji: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-ink-800 to-ink-700/50 border border-ink-700/50 shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </span>
  )
}

/** 内容简介卡：日期 + 类别/已坚持天数 + 内容摘要（图片优先，其次文字），点击查看详情 */
export function CheckInCard({ checkIn, showActions = true }: { checkIn: CheckIn; showActions?: boolean }) {
  const nav = useNavigate()
  const goals = useStore((s) => s.goals)
  const checkIns = useStore((s) => s.checkIns)
  const comments = useStore((s) => s.comments)
  const toggleLike = useStore((s) => s.toggleLike)
  const deleteCheckIn = useStore((s) => s.deleteCheckIn)
  const blockUser = useStore((s) => s.blockUser)
  const [menu, setMenu] = useState(false)

  const goal = goals.find((g) => g.id === checkIn.goalId) as Goal | undefined
  const tpl = templateOf(goal?.templateId)
  const author = userOf(checkIn.userId)
  const liked = checkIn.likedBy.includes('me')
  const commentCount = comments.filter((c) => c.checkInId === checkIn.id).length
  const mine = checkIn.userId === 'me'
  // 已坚持天数：该目标去重后的有效打卡天数
  const persistedDays = goal ? effectiveDates(goal.id, checkIns).size : 0

  return (
    <article className="card p-3">
      <div className="flex items-start gap-2.5">
        <Avatar emoji={author.avatar} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-paper truncate tracking-tightish">{author.nickname}</span>
            <span className="text-[11px] text-faint shrink-0 whitespace-nowrap">{dateStrOf(checkIn.createdAt).slice(5)}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 text-muted">
              <span className="text-[13px] leading-none">{tpl?.emoji}</span>
              {tpl?.name}
            </span>
            {persistedDays > 0 && (
              <>
                <span className="text-faint/50">·</span>
                <span className="text-accent font-medium">已坚持 {persistedDays} 天</span>
              </>
            )}
          </div>
        </div>
        {showActions && (
          <div className="relative">
            <button onClick={() => setMenu((v) => !v)} className="text-faint w-6 h-6 flex items-center justify-center rounded-full active:bg-ink-800 transition-colors">
              <IcDots size={16} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-8 z-40 w-32 card p-1 text-sm shadow-lift">
                  {mine ? (
                    <button
                      onClick={() => {
                        deleteCheckIn(checkIn.id)
                        setMenu(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-danger active:bg-ink-800"
                    >
                      删除
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          nav(`/report/${checkIn.id}`)
                          setMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl active:bg-ink-800"
                      >
                        举报
                      </button>
                      <button
                        onClick={() => {
                          blockUser(checkIn.userId)
                          setMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-danger active:bg-ink-800"
                      >
                        拉黑
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 内容摘要：图片优先，其次文字。点击查看详情 */}
      <div onClick={() => nav(`/checkin/${checkIn.id}`)} className="mt-2.5 cursor-pointer">
        {checkIn.image ? (
          <img
            src={checkIn.image}
            alt=""
            loading="lazy"
            className="block w-full aspect-[16/10] rounded-xl border border-ink-700/50 object-cover bg-ink-800"
          />
        ) : (
          <p className="text-[13px] leading-relaxed text-paper/90 line-clamp-3 whitespace-pre-wrap">{checkIn.text}</p>
        )}
        {checkIn.image && checkIn.text && (
          <p className="mt-2 text-[13px] leading-relaxed text-paper/90 line-clamp-2 whitespace-pre-wrap">{checkIn.text}</p>
        )}
      </div>

      {showActions && (
        <div className="mt-2.5 pt-2.5 border-t border-ink-700/40 flex items-center gap-5 text-muted">
          <button
            onClick={() => toggleLike(checkIn.id)}
            className={`flex items-center gap-1.5 text-[13px] transition-colors ${liked ? 'text-danger' : 'active:text-danger'}`}
          >
            <IcHeart size={16} filled={liked} />
            {checkIn.likedBy.length || ''}
          </button>
          <button onClick={() => nav(`/checkin/${checkIn.id}`)} className="flex items-center gap-1.5 text-[13px] active:text-accent transition-colors">
            <IcComment size={16} />
            {commentCount || ''}
          </button>
        </div>
      )}
    </article>
  )
}
