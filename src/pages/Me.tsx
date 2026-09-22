import { Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { GoalCard } from '../components/GoalCard'
import { Avatar } from '../components/CheckInCard'
import { IcSettings } from '../components/icons'
import { ALL_BADGES } from '../lib/seed'

export function Me() {
  const nav = useNavigate()
  const authed = useStore((s) => s.authed)
  const onboarded = useStore((s) => s.onboarded)
  const user = useStore((s) => s.user)
  const goals = useStore((s) => s.myGoals())
  const badges = useStore((s) => s.badges)
  const wearBadge = useStore((s) => s.wearBadge)
  const unlockedExtraSlot = useStore((s) => s.unlockedExtraSlot)

  const active = goals.filter((g) => g.status === 'active')
  const archived = goals.filter((g) => g.status !== 'active')
  const slotLimit = unlockedExtraSlot ? 4 : 3
  const earnedIds = new Set(badges.map((b) => b.id))
  const worn = user.wornBadgeId ? ALL_BADGES.find((b) => b.id === user.wornBadgeId) : undefined

  if (!authed) {
    return (
      <div>
        <div className="app-header">
          <div className="h-14 px-4 flex items-center">
            <div className="page-title">我的</div>
          </div>
        </div>

        <div className="px-5 pt-14 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-accent/10 border border-accent/15 flex items-center justify-center text-[34px]">
            🌱
          </div>
          <h1 className="mt-5 text-xl font-semibold text-paper serif">建立你的坚持档案</h1>
          <p className="mt-2.5 text-sm text-muted leading-relaxed">
            注册后创建自己的目标，记录每一次行动与成长。
          </p>
          <button
            className="btn-primary w-full mt-7"
            onClick={() => nav('/auth', { state: { from: '/me' } })}
          >
            注册 / 登录
          </button>
          <button className="mt-3 px-4 py-2 text-sm text-muted" onClick={() => nav('/community')}>
            先逛逛同行
          </button>
        </div>
      </div>
    )
  }

  if (!onboarded) return <Navigate to="/onboarding" replace />

  return (
    <div>
      <div className="app-header">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="page-title">我的</div>
          <button onClick={() => nav('/settings')} className="w-9 h-9 flex items-center justify-center rounded-full active:bg-ink-800 text-paper transition-colors">
            <IcSettings />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* 资料卡：头像 / 名称(可佩戴勋章) / 简介 + 数据条 */}
        <div className="card p-4">
          <div className="flex items-start gap-3.5">
            <Avatar emoji={user.avatar} size={56} />
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-semibold text-paper truncate tracking-tightish serif">{user.nickname || '未命名'}</span>
                {worn && (
                  <span className="text-base leading-none shrink-0" title={`佩戴中 · ${worn.name}`}>{worn.emoji}</span>
                )}
              </div>
              <div className="mt-1 text-[13px] text-muted line-clamp-2 leading-relaxed">{user.bio}</div>
            </div>
            <button
              onClick={() => nav('/profile-edit')}
              className="shrink-0 text-xs text-muted border border-ink-700/60 px-3 py-1.5 rounded-full active:bg-ink-800 active:text-accent transition-colors"
            >
              编辑
            </button>
          </div>

          {/* 数据条：积分 / 勋章 / 进行中 */}
          <div className="mt-4 grid grid-cols-3 rounded-2xl bg-ink-900 border border-ink-700/40 divide-x divide-ink-700/40 overflow-hidden">
            <Stat value={user.points} label="积分" accent />
            <Stat value={earnedIds.size} label="勋章" />
            <Stat value={active.length} label="进行中" />
          </div>
        </div>

        {/* 勋章卡：点击已获得的勋章佩戴到名称旁 */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="section-title">我的勋章</div>
            <button onClick={() => nav('/points')} className="text-xs text-accent">全部</button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {ALL_BADGES.map((b) => {
              const earned = earnedIds.has(b.id)
              const isWorn = user.wornBadgeId === b.id
              return (
                <button
                  key={b.id}
                  disabled={!earned}
                  onClick={() => wearBadge(b.id)}
                  title={earned ? (isWorn ? `取消佩戴 · ${b.name}` : `佩戴 · ${b.name}`) : `${b.name}（未获得）`}
                  className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all duration-200 ${
                    isWorn ? 'bg-accent/12 ring-2 ring-accent' : 'bg-ink-800 border border-ink-700/40'
                  } ${earned ? 'active:scale-95' : 'opacity-25 grayscale'}`}
                >
                  {b.emoji}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[11px] text-faint leading-relaxed">点击已获得的勋章即可佩戴到名称旁，再次点击取消。</p>
        </div>

        {/* 进行中目标 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="section-title">进行中的目标 <span className="text-faint font-normal text-xs">· {active.length}/{slotLimit}</span></div>
            <button onClick={() => nav('/onboarding')} className="text-xs text-accent px-2.5 py-1 rounded-full active:bg-accent/10 transition-colors">+ 新目标</button>
          </div>
          <div className="space-y-3">
            {active.length ? (
              active.map((g) => <GoalCard key={g.id} goal={g} />)
            ) : (
              <div className="card p-8 text-center text-sm text-muted leading-relaxed">还没有进行中的目标，去创建一个吧。</div>
            )}
          </div>
        </div>

        {/* 已结束/暂停 */}
        {archived.length > 0 && (
          <div>
            <div className="section-title mb-3">已暂停 / 已结束</div>
            <div className="space-y-3">
              {archived.map((g) => <GoalCard key={g.id} goal={g} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className="py-2.5 text-center">
      <div className={`text-lg font-semibold leading-none tracking-tightish ${accent ? 'text-accent' : 'text-paper'}`}>{value}</div>
      <div className="mt-1 text-[10.5px] text-faint">{label}</div>
    </div>
  )
}
