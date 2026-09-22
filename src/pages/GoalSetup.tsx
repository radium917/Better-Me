import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { templateOf } from '../lib/selectors'
import { todayStr } from '../lib/date'
import { TopBar } from '../components/TopBar'

export function GoalSetup() {
  const { templateId } = useParams()
  const nav = useNavigate()
  const tpl = templateOf(templateId)
  const createGoal = useStore((s) => s.createGoal)
  const finishOnboarding = useStore((s) => s.finishOnboarding)
  const onboarded = useStore((s) => s.onboarded)

  const [title, setTitle] = useState(tpl ? `每天${tpl.name}` : '')
  const [note, setNote] = useState('')
  const [freqType, setFreqType] = useState<'daily' | 'weekly'>('daily')
  const [timesPerWeek, setTimesPerWeek] = useState(4)
  const [startDate, setStartDate] = useState(todayStr())
  const [error, setError] = useState('')

  const suggestions = useMemo(() => {
    if (!tpl) return []
    const base: Record<string, string[]> = {
      t_read: ['每天读书 30 分钟', '睡前阅读 20 分钟', '每周读完 1 本书'],
      t_run: ['每周跑步 4 次', '每次跑 3 公里', '晨跑 20 分钟'],
      t_sleep: ['23:00 前入睡', '每天早睡半小时'],
      t_wake: ['每天 6:30 起床', '早起读书'],
      t_words: ['每天背 20 个单词', '每天复习旧词'],
      t_fit: ['每周健身 3 次', '每天核心训练 10 分钟'],
      t_write: ['每天写 300 字', '每周写 1 篇随笔'],
      t_exam: ['每天学习 2 小时', '每天刷 1 套真题'],
    }
    return base[tpl.id] || []
  }, [tpl])

  if (!tpl) {
    return (
      <div>
        <TopBar title="目标设置" />
        <div className="p-6 text-muted">未找到目标模板。</div>
      </div>
    )
  }

  const submit = () => {
    const res = createGoal({
      templateId: tpl.id,
      title,
      note,
      frequency: freqType === 'daily' ? { type: 'daily' } : { type: 'weekly', timesPerWeek },
      startDate,
    })
    if (typeof res === 'object' && 'error' in res) {
      setError(res.error)
      return
    }
    if (!onboarded) {
      finishOnboarding()
      nav('/me', { replace: true })
      return
    }
    // 已有档案时，新建目标后仍可直接完成第一次打卡。
    nav(`/publish?goal=${res}&from=new`, { replace: true })
  }

  return (
    <div>
      <TopBar title={`设置「${tpl.name}」目标`} subtitle="设定属于你自己的节奏" />
      <div className="p-5 space-y-5">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/12 to-ink-800 flex items-center justify-center text-2xl shrink-0">{tpl.emoji}</div>
          <div>
            <div className="font-semibold text-paper tracking-tightish">{tpl.name}</div>
            <div className="text-xs text-muted mt-0.5">{tpl.memberCount.toLocaleString()} 人同行</div>
          </div>
        </div>

        <div>
          <label className="label">个人目标名称</label>
          <input className="input mt-2" value={title} maxLength={24} onChange={(e) => setTitle(e.target.value)} placeholder="例如：每天读书 30 分钟" />
          {suggestions.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setTitle(s)} className="chip bg-ink-800/70 text-muted active:text-accent">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">目标说明（可选）</label>
          <input className="input mt-2" value={note} maxLength={40} onChange={(e) => setNote(e.target.value)} placeholder="给自己一句提醒" />
        </div>

        <div>
          <label className="label">执行频率</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setFreqType('daily')}
              className={`rounded-2xl border px-4 py-3 text-sm transition-all duration-200 ${freqType === 'daily' ? 'border-accent text-accent bg-accent/8' : 'border-ink-700/60 text-muted'}`}
            >
              每天一次
            </button>
            <button
              onClick={() => setFreqType('weekly')}
              className={`rounded-2xl border px-4 py-3 text-sm transition-all duration-200 ${freqType === 'weekly' ? 'border-accent text-accent bg-accent/8' : 'border-ink-700/60 text-muted'}`}
            >
              每周指定次数
            </button>
          </div>
          {freqType === 'weekly' && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-muted">每周</span>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTimesPerWeek(n)}
                    className={`w-9 h-9 rounded-xl text-sm transition-all duration-200 ${timesPerWeek === n ? 'bg-accent text-white' : 'bg-ink-800 text-muted'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted">次</span>
            </div>
          )}
        </div>

        <div>
          <label className="label">开始日期</label>
          <input type="date" className="input mt-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        {error && <div className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</div>}

        <button className="btn-primary w-full" onClick={submit}>
          {onboarded ? '创建目标' : '创建并进入我的'}
        </button>
      </div>
    </div>
  )
}
