import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { moodMap, templateOf, userOf } from '../lib/selectors'
import { dateStrOf, relTime } from '../lib/date'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/CheckInCard'
import { IcComment, IcHeart } from '../components/icons'

export function CheckInDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const checkIn = useStore((s) => s.checkIns.find((c) => c.id === id))
  const goals = useStore((s) => s.goals)
  const comments = useStore((s) => s.comments.filter((c) => c.checkInId === id))
  const addComment = useStore((s) => s.addComment)
  const deleteComment = useStore((s) => s.deleteComment)
  const toggleLike = useStore((s) => s.toggleLike)
  const [text, setText] = useState('')

  if (!checkIn) {
    return (
      <div>
        <TopBar title="打卡详情" />
        <div className="p-6 text-muted">这条内容已被删除。</div>
      </div>
    )
  }

  const goal = goals.find((g) => g.id === checkIn.goalId)
  const tpl = templateOf(goal?.templateId)
  const author = userOf(checkIn.userId)
  const liked = checkIn.likedBy.includes('me')
  const mood = checkIn.mood ? moodMap[checkIn.mood] : undefined

  return (
    <div className="flex flex-col h-full">
      <TopBar title="打卡详情" />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* 完整打卡内容 */}
        <article className="card p-4">
          <div className="flex items-start gap-3">
            <Avatar emoji={author.avatar} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-paper truncate tracking-tightish">{author.nickname}</span>
                <span className="text-[11px] text-faint shrink-0 whitespace-nowrap">{dateStrOf(checkIn.createdAt)}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                <span className="chip bg-ink-800/70 text-paper">{tpl?.emoji} {tpl?.name}</span>
                {mood && (
                  <span className="chip bg-accent/10 text-accent border-accent/25">{mood.emoji} {mood.label}</span>
                )}
              </div>
            </div>
          </div>

          {checkIn.image && (
            <img
              src={checkIn.image}
              alt="打卡配图"
              className="block mt-3 w-full max-h-[440px] rounded-2xl border border-ink-700/50 object-cover bg-ink-800"
            />
          )}
          {checkIn.text && (
            <p className="mt-3 text-[15px] leading-relaxed text-paper/90 whitespace-pre-wrap">{checkIn.text}</p>
          )}

          <div className="mt-3.5 pt-3 border-t border-ink-700/40 flex items-center gap-6 text-muted">
            <button
              onClick={() => toggleLike(checkIn.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-danger' : ''}`}
            >
              <IcHeart size={19} filled={liked} />
              {checkIn.likedBy.length || ''}
            </button>
            <span className="flex items-center gap-1.5 text-sm">
              <IcComment size={19} />
              {comments.length || ''}
            </span>
          </div>
        </article>

        <div>
          <div className="label mb-2">评论 {comments.length > 0 && `· ${comments.length}`}</div>
          <div className="space-y-3">
            {comments.length === 0 && <div className="text-sm text-faint py-4 text-center">还没有评论，来陪 TA 说两句。</div>}
            {comments
              .slice()
              .sort((a, b) => a.createdAt - b.createdAt)
              .map((c) => {
                const author = userOf(c.userId)
                return (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <Avatar emoji={author.avatar} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-paper">{author.nickname}</span>
                        <span className="text-[11px] text-faint">{relTime(c.createdAt)}</span>
                        {c.userId === 'me' && (
                          <button onClick={() => deleteComment(c.id)} className="text-[11px] text-danger ml-auto">
                            删除
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-paper/90 mt-0.5 whitespace-pre-wrap">{c.text}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      <div className="border-t border-ink-700/40 p-3 flex gap-2 bg-ink-850/90 backdrop-blur-xl">
        <input
          className="input"
          placeholder="写下你的鼓励…"
          value={text}
          maxLength={120}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && text.trim()) {
              addComment(checkIn.id, text)
              setText('')
            }
          }}
        />
        <button
          className="btn-primary px-5 disabled:opacity-40"
          disabled={!text.trim()}
          onClick={() => {
            addComment(checkIn.id, text)
            setText('')
          }}
        >
          发送
        </button>
      </div>
    </div>
  )
}
