import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { TopBar } from '../components/TopBar'

const REASONS = ['广告营销', '色情低俗', '人身攻击', '违法违规', '虚假打卡或刷积分', '其他']

export function Report() {
  const { id } = useParams()
  const nav = useNavigate()
  const reportContent = useStore((s) => s.reportContent)
  const checkIn = useStore((s) => s.checkIns.find((c) => c.id === id))
  const blockUser = useStore((s) => s.blockUser)
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div>
        <TopBar hideBack title="举报已提交" />
        <div className="p-8 text-center">
          <div className="text-5xl">✅</div>
          <p className="mt-4 text-paper">我们已收到举报</p>
          <p className="mt-1 text-sm text-muted">感谢你帮助维护社区氛围，我们会尽快处理。</p>
          <div className="mt-6 space-y-3">
            {checkIn && (
              <button onClick={() => { blockUser(checkIn.userId); nav('/community', { replace: true }) }} className="btn-ghost w-full text-danger">同时拉黑该用户</button>
            )}
            <button onClick={() => nav('/community', { replace: true })} className="btn-primary w-full">完成</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="举报内容" />
      <div className="p-5 space-y-4">
        <div className="label">请选择举报原因</div>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm ${reason === r ? 'border-accent text-accent bg-accent/10' : 'border-ink-700 text-paper'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div>
          <label className="label">补充说明（可选）</label>
          <textarea className="input mt-1.5 min-h-[80px] resize-none" value={detail} maxLength={120} onChange={(e) => setDetail(e.target.value)} placeholder="描述具体情况" />
        </div>
        <button
          className="btn-primary w-full disabled:opacity-40"
          disabled={!reason}
          onClick={() => {
            if (id) reportContent(id, reason)
            setDone(true)
          }}
        >
          提交举报
        </button>
      </div>
    </div>
  )
}
