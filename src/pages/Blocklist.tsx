import { useStore } from '../lib/store'
import { userOf } from '../lib/selectors'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/CheckInCard'

export function Blocklist() {
  const blocked = useStore((s) => s.user.blockedUserIds)
  const unblockUser = useStore((s) => s.unblockUser)

  return (
    <div>
      <TopBar title="黑名单" />
      <div className="p-4 space-y-2">
        {blocked.length === 0 && (
          <div className="card p-8 text-center text-sm text-muted">黑名单为空。<br />拉黑后对方的内容将不再出现在你的社区中。</div>
        )}
        {blocked.map((uid) => {
          const u = userOf(uid)
          return (
            <div key={uid} className="card p-4 flex items-center gap-3">
              <Avatar emoji={u.avatar} size={40} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-paper">{u.nickname}</div>
                <div className="text-xs text-muted truncate">{u.bio}</div>
              </div>
              <button onClick={() => unblockUser(uid)} className="text-sm text-accent px-3 py-1.5">移除</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
