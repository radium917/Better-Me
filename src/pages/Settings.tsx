import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import type { NotificationPrefs } from '../types'
import { TopBar } from '../components/TopBar'
import { IcChevron } from '../components/icons'

const NOTIFY_ROWS: { key: keyof Omit<NotificationPrefs, 'reminderTime'>; label: string }[] = [
  { key: 'reminder', label: '打卡提醒' },
  { key: 'like', label: '收到点赞' },
  { key: 'comment', label: '收到评论' },
  { key: 'milestone', label: '达成里程碑 / 获得勋章' },
  { key: 'points', label: '获得积分' },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-accent' : 'bg-ink-700'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

export function Settings() {
  const nav = useNavigate()
  const prefs = useStore((s) => s.prefs)
  const updatePrefs = useStore((s) => s.updatePrefs)
  const logout = useStore((s) => s.logout)
  const deleteAccount = useStore((s) => s.deleteAccount)
  const [confirm, setConfirm] = useState<'logout' | 'delete' | null>(null)

  return (
    <div>
      <TopBar title="设置与隐私" />
      <div className="p-4 space-y-4">
        {/* 通知设置 */}
        <div className="card divide-y divide-ink-800">
          <div className="px-4 py-3 label">通知</div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-paper">打卡提醒时间</span>
            <input
              type="time"
              value={prefs.reminderTime}
              onChange={(e) => updatePrefs({ reminderTime: e.target.value })}
              className="bg-ink-900 border border-ink-700 rounded-lg px-2 py-1 text-sm text-paper"
            />
          </div>
          {NOTIFY_ROWS.map((r) => (
            <div key={r.key} className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-paper">{r.label}</span>
              <Toggle on={prefs[r.key]} onChange={(v) => updatePrefs({ [r.key]: v } as Partial<NotificationPrefs>)} />
            </div>
          ))}
          <div className="px-4 py-2.5 text-[11px] text-faint">非必要通知不反复推送，我们只在你真正坚持时提醒你。</div>
        </div>

        {/* 隐私与安全 */}
        <div className="card divide-y divide-ink-800">
          <div className="px-4 py-3 label">隐私与安全</div>
          <Row label="黑名单管理" onClick={() => nav('/blocklist')} />
          <Row label="社区规范" onClick={() => {}} />
          <Row label="用户协议" onClick={() => {}} />
          <Row label="隐私政策" onClick={() => {}} />
        </div>

        {/* 账号 */}
        <div className="card divide-y divide-ink-800">
          <div className="px-4 py-3 label">账号</div>
          <button onClick={() => setConfirm('logout')} className="w-full px-4 py-3.5 text-left text-sm text-paper active:bg-ink-800">退出登录</button>
          <button onClick={() => setConfirm('delete')} className="w-full px-4 py-3.5 text-left text-sm text-danger active:bg-ink-800">注销账号</button>
        </div>

        <p className="text-center text-[11px] text-faint">坚持 · Better Me · MVP 演示版</p>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-paper/40 p-4" onClick={() => setConfirm(null)}>
          <div className="card p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="font-semibold text-paper">{confirm === 'logout' ? '退出登录' : '注销账号'}</div>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              {confirm === 'logout'
                ? '退出后可用手机号重新登录，数据仍会保留。'
                : '注销将按隐私规则清除你的个人数据与公开内容，此操作不可恢复。'}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost flex-1" onClick={() => setConfirm(null)}>取消</button>
              <button
                className={`flex-1 rounded-xl px-4 py-3 font-semibold ${confirm === 'delete' ? 'bg-danger text-white' : 'bg-accent text-white'}`}
                onClick={() => {
                  if (confirm === 'logout') {
                    logout()
                    nav('/', { replace: true })
                  } else {
                    deleteAccount()
                    nav('/', { replace: true })
                  }
                }}
              >
                确认{confirm === 'logout' ? '退出' : '注销'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3.5 flex items-center justify-between text-sm text-paper active:bg-ink-800">
      <span>{label}</span>
      <IcChevron size={16} className="text-faint" />
    </button>
  )
}
