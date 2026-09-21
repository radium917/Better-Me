import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TEMPLATES } from '../lib/seed'
import { TopBar } from '../components/TopBar'

const CATEGORIES = ['全部', '成长学习', '健康生活', '生活重启'] as const

export function OnboardingSelect() {
  const nav = useNavigate()
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('全部')

  const list = TEMPLATES.filter((t) => cat === '全部' || t.category === cat)

  return (
    <div>
      <TopBar title="选择你的第一个目标" subtitle="先加入目标，再认识同行者" />
      <div className="p-5">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip ${cat === c ? 'bg-accent text-white border-accent' : 'bg-ink-800/70 text-muted'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {list.map((t) => (
            <button
              key={t.id}
              onClick={() => nav(`/goal-setup/${t.id}`)}
              className="card card-press p-4 text-left"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent/12 to-ink-800 flex items-center justify-center text-2xl">{t.emoji}</div>
              <div className="mt-2.5 font-semibold text-paper tracking-tightish">{t.name}</div>
              <div className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">{t.blurb}</div>
              <div className="mt-2.5 text-[11px] text-faint whitespace-nowrap">{t.memberCount.toLocaleString()} 人正在坚持</div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-faint leading-relaxed">
          MVP 暂不支持自建公共目标模板，
          <br />相似目标聚合在一起，社区才不会冷清。
        </p>
      </div>
    </div>
  )
}
