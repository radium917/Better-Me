import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { templateOf, MOODS } from '../lib/selectors'
import { computeStats, progressLabels } from '../lib/date'
import { RANDOM_PROMPTS } from '../lib/seed'
import type { DayMood } from '../types'
import { TopBar } from '../components/TopBar'
import { IcCamera, IcCheck, IcImage } from '../components/icons'

const MAX_IMAGE_EDGE = 1600

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('图片读取失败，请重试'))
    reader.onload = () => {
      const source = new Image()
      source.onerror = () => reject(new Error('图片格式暂不支持'))
      source.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(source.width, source.height))
        const width = Math.max(1, Math.round(source.width * scale))
        const height = Math.max(1, Math.round(source.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('图片处理失败，请重试'))
          return
        }
        context.fillStyle = '#f7f5ef'
        context.fillRect(0, 0, width, height)
        context.drawImage(source, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      source.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function Publish() {
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const fromNew = sp.get('from') === 'new'
  const activeGoals = useStore((s) => s.activeGoals())
  const checkIns = useStore((s) => s.checkIns)
  const publish = useStore((s) => s.publishCheckIn)

  const [goalId, setGoalId] = useState(sp.get('goal') || activeGoals[0]?.id || '')
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const [mood, setMood] = useState<DayMood | undefined>()
  const [imageError, setImageError] = useState('')
  const [processingImage, setProcessingImage] = useState(false)
  const albumInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)

  const prompt = useMemo(() => RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)], [])
  const goal = activeGoals.find((g) => g.id === goalId)
  const stats = goal ? computeStats(goal, checkIns) : undefined

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImageError('')
    setProcessingImage(true)
    try {
      const compressed = await compressImage(file)
      if (compressed.length > 4_000_000) {
        throw new Error('图片仍然过大，请选择尺寸更小的图片')
      }
      setImage(compressed)
    } catch (error) {
      setImageError(error instanceof Error ? error.message : '图片处理失败，请重试')
    } finally {
      setProcessingImage(false)
    }
  }

  if (activeGoals.length === 0) {
    return (
      <div>
        <TopBar title="发布打卡" onBack={() => nav('/community')} />
        <div className="p-8 text-center text-muted">
          <p>你还没有进行中的目标。</p>
          <button className="btn-primary mt-4" onClick={() => nav('/onboarding')}>去创建一个目标</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar title="发布打卡" onBack={() => (fromNew ? nav('/me', { replace: true }) : nav(-1))} />
      <div className="px-3.5 py-3 space-y-4">
        {/* 选择目标 */}
        <div>
          <label className="label">选择要打卡的目标</label>
          <div className="mt-2 space-y-1.5">
            {activeGoals.map((g) => {
              const t = templateOf(g.templateId)
              const active = g.id === goalId
              return (
                <button
                  key={g.id}
                  onClick={() => setGoalId(g.id)}
                  className={`w-full min-h-11 flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all duration-200 ${active ? 'border-accent bg-accent/8' : 'border-ink-700/60 active:border-accent/40'}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/12 to-ink-800 flex items-center justify-center text-lg shrink-0">{t?.emoji}</span>
                  <span className="text-left text-[13px] text-paper truncate flex-1 min-w-0">{g.title}</span>
                  <span className="text-[10.5px] text-muted shrink-0">{t?.name}</span>
                  {active && <IcCheck size={16} className="text-accent shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* 正文 */}
        <div>
          <label className="label">{prompt}</label>
          <textarea
            className="input mt-1.5 min-h-[88px] py-2.5 resize-none text-sm leading-relaxed"
            placeholder="记录一下今天，哪怕只有一句也好。"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="text-right text-[10px] text-faint mt-0.5">{text.length}/500</div>
        </div>

        {/* 图片 */}
        <div>
          <div className="flex items-center justify-between">
            <label className="label">配图</label>
            <span className="text-[10.5px] text-faint">可选</span>
          </div>
          <div className="mt-1.5">
            <input
              ref={albumInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImage}
            />
            {image ? (
              <div className="relative overflow-hidden rounded-2xl border border-ink-700/50 bg-ink-800 shadow-soft">
                <img src={image} alt="待发布的配图" className="block w-full aspect-[16/10] object-cover" />
                <button
                  onClick={() => setImage(undefined)}
                  className="absolute top-2.5 right-2.5 rounded-full bg-ink-900/85 backdrop-blur px-3 py-1.5 text-xs font-medium text-paper shadow-soft active:scale-95 transition-transform"
                >
                  移除
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-ink-700/70 bg-ink-850/55 p-2.5">
                <button
                  onClick={() => albumInput.current?.click()}
                  disabled={processingImage}
                  className="group min-w-0 flex-1 flex items-center gap-2.5 text-left disabled:opacity-50"
                >
                  <span className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 transition-colors group-active:bg-accent/20">
                    <IcImage size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-paper">
                      {processingImage ? '正在处理照片…' : '从相册选择'}
                    </span>
                    <span className="block mt-0.5 text-[10.5px] text-faint">记录今天的真实瞬间</span>
                  </span>
                </button>
                <span className="w-px h-8 bg-ink-700/50 shrink-0" />
                <button
                  onClick={() => cameraInput.current?.click()}
                  disabled={processingImage}
                  className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-glow active:scale-95 transition-transform disabled:opacity-50"
                  title="拍照"
                  aria-label="拍照"
                >
                  <IcCamera size={17} />
                </button>
              </div>
            )}
            {imageError && <p className="mt-2 text-xs text-danger">{imageError}</p>}
          </div>
        </div>

        {/* 今天的心情 */}
        <div>
          <label className="label">今天的心情（可选）</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMood(mood === m.key ? undefined : m.key)}
                className={`chip px-2.5 ${mood === m.key ? 'bg-accent text-white border-accent' : 'bg-ink-800/70 text-muted'}`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 进度信息 */}
        {stats && goal && (
          <div className="card p-3">
            <div className="label mb-2">本次打卡后的进度</div>
            <div className="flex flex-wrap gap-1.5">
              {progressLabels(goal, stats).map((p) => (
                <span key={p} className="chip px-2.5 bg-ink-800/70 text-paper">{p}</span>
              ))}
              <span className="chip px-2.5 bg-ink-800/70 text-muted">最近30天 {Math.round(stats.last30Rate * 100)}%</span>
            </div>
          </div>
        )}

        <button
          className="btn-primary w-full disabled:opacity-40"
          disabled={(!text.trim() && !image) || !goalId || processingImage}
          onClick={() => {
            const r = publish(goalId, text, image, mood)
            // 发布后直接进入「同行」，并把刚发布的内容置顶
            nav(`/community?pin=${r.checkIn.id}`, { replace: true })
          }}
        >
          发布打卡
        </button>
      </div>
    </div>
  )
}
