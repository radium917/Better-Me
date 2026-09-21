import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { TopBar } from '../components/TopBar'
import { Avatar } from '../components/CheckInCard'

const AVATARS = ['🙂', '🦉', '🦌', '🐨', '🐙', '🐓', '🦊', '🐱', '🐼', '🌱', '⭐️', '🌙']

export function ProfileEdit() {
  const nav = useNavigate()
  const user = useStore((s) => s.user)
  const updateProfile = useStore((s) => s.updateProfile)
  const [nickname, setNickname] = useState(user.nickname)
  const [avatar, setAvatar] = useState(user.avatar)
  const [bio, setBio] = useState(user.bio)

  return (
    <div>
      <TopBar
        title="编辑资料"
        right={
          <button
            className="text-sm text-accent px-2 disabled:opacity-40"
            disabled={!nickname.trim()}
            onClick={() => {
              updateProfile({ nickname: nickname.trim(), avatar, bio: bio.trim() })
              nav(-1)
            }}
          >
            保存
          </button>
        }
      />
      <div className="p-5 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar emoji={avatar} size={76} />
          <div className="grid grid-cols-6 gap-2.5">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`w-11 h-11 rounded-full text-2xl flex items-center justify-center bg-ink-800 transition-all duration-200 ${avatar === a ? 'ring-2 ring-accent scale-105' : 'active:scale-95'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">昵称（不可为空）</label>
          <input className="input mt-2" value={nickname} maxLength={16} onChange={(e) => setNickname(e.target.value)} />
        </div>

        <div>
          <label className="label">个人简介</label>
          <textarea className="input mt-2 min-h-[80px] resize-none" value={bio} maxLength={60} onChange={(e) => setBio(e.target.value)} placeholder="介绍一下你自己" />
        </div>
      </div>
    </div>
  )
}
