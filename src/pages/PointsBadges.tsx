import { useState } from 'react'
import { useStore } from '../lib/store'
import { POINTS } from '../lib/store'
import { ALL_BADGES } from '../lib/seed'
import { TopBar } from '../components/TopBar'
import { relTime } from '../lib/date'

const SHOP = [
  { id: 'slot', name: '解锁第 4 个目标名额', emoji: '🎯', cost: POINTS.unlockSlot, kind: 'slot' as const },
  { id: 'frame_gold', name: '金色头像框', emoji: '🖼️', cost: 120, kind: 'cosmetic' as const },
  { id: 'theme_forest', name: '森野主题', emoji: '🌲', cost: 150, kind: 'cosmetic' as const },
  { id: 'badge_slot', name: '勋章展示位', emoji: '✨', cost: 80, kind: 'cosmetic' as const },
]

export function PointsBadges() {
  const user = useStore((s) => s.user)
  const badges = useStore((s) => s.badges)
  const unlockedExtraSlot = useStore((s) => s.unlockedExtraSlot)
  const unlockSlot = useStore((s) => s.unlockSlot)
  const [tab, setTab] = useState<'badges' | 'shop'>('badges')
  const [toast, setToast] = useState('')

  const notify = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(''), 1600)
  }

  return (
    <div>
      <TopBar title="积分与勋章" />
      <div className="p-4 space-y-4">
        <div className="card p-5 bg-gradient-to-br from-accent/12 via-accent/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=single%20gold%20reward%20coin%20icon%2C%20front-facing%20orthographic%20view%2C%20centered%20and%20occupying%2070%20percent%20of%20the%20canvas%2C%20subtle%20embossed%20leaf%20symbol%2C%20soft%20matte%203D%20finish%2C%20solid%20warm%20ivory%20background%2C%20minimal%20premium%20wellness%20mobile%20app%20style%2C%20one%20object%20only%2C%20no%20text%2C%20no%20letters%2C%20no%20extra%20objects%2C%20no%20border%2C%20sharp%20clean%20edges&image_size=square"
                alt="积分币"
                width="56"
                height="56"
                loading="eager"
                className="block w-full h-full rounded-2xl object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted">当前积分</div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-[38px] font-semibold text-accent leading-none tracking-tightish">{user.points}</span>
                <span className="text-sm text-muted">分</span>
              </div>
            </div>
          </div>
          <p className="mt-4 pt-3.5 border-t border-accent/15 text-[11px] text-faint leading-relaxed">
            积分只奖励真实坚持：有效打卡、连续周期与里程碑。点赞、评论、提醒、重复发布都不产生积分。
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab('badges')} className={`chip ${tab === 'badges' ? 'bg-accent text-white border-accent' : 'bg-ink-800/70 text-muted'}`}>勋章墙</button>
          <button onClick={() => setTab('shop')} className={`chip ${tab === 'shop' ? 'bg-accent text-white border-accent' : 'bg-ink-800/70 text-muted'}`}>积分兑换</button>
        </div>

        {tab === 'badges' ? (
          <div className="grid grid-cols-2 gap-3">
            {ALL_BADGES.map((b) => {
              const earned = badges.find((x) => x.id === b.id)
              return (
                <div
                  key={b.id}
                  className={`card p-4 flex flex-col ${earned ? '' : 'opacity-50'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[26px] ${earned ? 'bg-accent/12' : 'bg-ink-800 grayscale'}`}>{b.emoji}</div>
                  <div className="mt-3 text-sm font-medium text-paper leading-snug tracking-tightish">{b.name}</div>
                  <div className="mt-1 text-[11px] text-muted leading-relaxed flex-1">{b.desc}</div>
                  <div className={`mt-2.5 text-[11px] font-medium ${earned ? 'text-accent' : 'text-faint'}`}>
                    {earned?.earnedAt ? `${relTime(earned.earnedAt)}获得` : '尚未获得'}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {SHOP.map((item) => {
              const owned = item.kind === 'slot' && unlockedExtraSlot
              const affordable = user.points >= item.cost
              return (
                <div key={item.id} className="card p-4 flex items-center gap-3">
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="flex-1">
                    <div className="text-sm text-paper">{item.name}</div>
                    <div className="text-xs text-accent">{item.cost} 积分</div>
                  </div>
                  <button
                    disabled={owned || !affordable}
                    onClick={() => {
                      if (item.kind === 'slot') {
                        if (unlockSlot()) notify('已解锁第 4 个目标名额')
                      } else {
                        notify('兑换成功（演示）')
                      }
                    }}
                    className={`text-sm px-4 py-2 rounded-full transition-colors ${owned ? 'bg-ink-800 text-muted' : affordable ? 'bg-accent text-white' : 'bg-ink-800 text-faint'}`}
                  >
                    {owned ? '已拥有' : affordable ? '兑换' : '积分不足'}
                  </button>
                </div>
              )
            })}
            <p className="text-[11px] text-faint leading-relaxed px-1">
              MVP 暂不支持实体奖牌、现金权益、积分转移、排行榜与积分购买。
            </p>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed left-1/2 bottom-24 -translate-x-1/2 bg-ink-700 text-paper text-sm px-4 py-2 rounded-full z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
