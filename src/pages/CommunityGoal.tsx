import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { rankFeed } from '../lib/feed'
import { templateOf } from '../lib/selectors'
import { CheckInCard } from '../components/CheckInCard'
import { TopBar } from '../components/TopBar'

export function CommunityGoal() {
  const { templateId } = useParams()
  const tpl = templateOf(templateId)
  const checkIns = useStore((s) => s.checkIns)
  const goals = useStore((s) => s.goals)
  const user = useStore((s) => s.user)

  const feed = useMemo(() => {
    const ranked = rankFeed(checkIns, { goals, me: user, myTemplateIds: new Set([templateId!]) })
    return ranked.filter((c) => {
      const g = goals.find((x) => x.id === c.goalId)
      return g?.templateId === templateId
    })
  }, [checkIns, goals, user, templateId])

  if (!tpl) return <div className="p-6 text-muted">未找到社区</div>

  return (
    <div>
      <TopBar title={`${tpl.emoji} ${tpl.name}社区`} subtitle={`${tpl.memberCount.toLocaleString()} 人正在坚持`} />
      <div className="p-4 space-y-4">
        <div className="card p-4">
          <p className="text-sm text-muted leading-relaxed">{tpl.blurb}</p>
        </div>

        <div>
          <div className="label mb-2">最新动态</div>
          <div className="space-y-3">
            {feed.length ? (
              feed.map((c) => <CheckInCard key={c.id} checkIn={c} />)
            ) : (
              <div className="card p-8 text-center text-muted text-sm">还没有人在这个社区打卡，来做第一个吧。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
