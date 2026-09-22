import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { TopBar } from '../components/TopBar'

export function Auth() {
  const nav = useNavigate()
  const location = useLocation()
  const login = useStore((s) => s.login)
  const onboarded = useStore((s) => s.onboarded)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [sent, setSent] = useState(false)
  const backTo = (location.state as { from?: string } | null)?.from || '/community'

  const canSubmit = sent && /^1\d{10}$/.test(phone) && code.length >= 4 && nickname.trim()

  return (
    <div>
      <TopBar title="注册 / 登录" onBack={() => nav(backTo, { replace: true })} />
      <div className="p-5 space-y-5">
        <p className="text-muted text-sm leading-relaxed">
          用手机号创建你的坚持档案。这里的内容独立于你已有的社交账号，无需重新塑造人设。
        </p>

        <div className="space-y-3">
          <div>
            <label className="label">手机号</label>
            <input
              className="input mt-1.5"
                type="tel"
              inputMode="numeric"
                autoComplete="tel"
              placeholder="请输入手机号"
              value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))
                  setCode('')
                  setSent(false)
                }}
            />
          </div>

          <div>
            <label className="label">验证码</label>
            <div className="mt-1.5 flex gap-2">
              <input
                className="input"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="演示环境任意 4 位"
                value={code}
                disabled={!sent}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <button
                className="btn-ghost whitespace-nowrap text-sm px-3"
                disabled={!/^1\d{10}$/.test(phone)}
                onClick={() => setSent(true)}
              >
                {sent ? '重新发送' : '获取验证码'}
              </button>
            </div>
          </div>

          <div>
            <label className="label">昵称（不可为空）</label>
            <input
              className="input mt-1.5"
              placeholder="给自己起个名字"
              value={nickname}
              maxLength={16}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn-primary w-full disabled:opacity-40"
          disabled={!canSubmit}
          onClick={() => {
            login(phone, nickname.trim())
            nav(onboarded ? backTo : '/onboarding', { replace: true })
          }}
        >
          创建档案并继续
        </button>

      </div>
    </div>
  )
}
