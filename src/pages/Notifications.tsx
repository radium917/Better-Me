import { useEffect } from 'react'
import { useStore } from '../lib/store'
import { relTime } from '../lib/date'
import { TopBar } from '../components/TopBar'
import type { NotificationType } from '../types'

const ICONS: Record<NotificationType, string> = {
  reminder: '⏰',
  like: '❤️',
  comment: '💬',
  milestone: '🏅',
  points: '✨',
}

export function Notifications() {
  const notifications = useStore((s) => s.notifications)
  const markAllRead = useStore((s) => s.markAllRead)

  useEffect(() => {
    const t = setTimeout(markAllRead, 400)
    return () => clearTimeout(t)
  }, [markAllRead])

  return (
    <div>
      <TopBar title="通知中心" />
      <div className="p-4 space-y-2">
        {notifications.length === 0 && (
          <div className="card p-8 text-center text-sm text-muted">暂时没有通知。<br />打卡、点赞、评论和里程碑都会出现在这里。</div>
        )}
        {notifications.map((n) => (
          <div key={n.id} className={`card p-4 flex items-start gap-3 ${n.read ? '' : 'border-accent/40'}`}>
            <div className="text-xl">{ICONS[n.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-paper">{n.title}</span>
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </div>
              <div className="text-sm text-muted mt-0.5">{n.body}</div>
              <div className="text-[11px] text-faint mt-1">{relTime(n.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
