import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './lib/store'
import { BottomNav } from './components/BottomNav'
import { Splash } from './pages/Splash'
import { Auth } from './pages/Auth'
import { OnboardingSelect } from './pages/OnboardingSelect'
import { GoalSetup } from './pages/GoalSetup'
import { Community } from './pages/Community'
import { CommunityGoal } from './pages/CommunityGoal'
import { CheckInDetail } from './pages/CheckInDetail'
import { Publish } from './pages/Publish'
import { Me } from './pages/Me'
import { GoalDetail } from './pages/GoalDetail'
import { PointsBadges } from './pages/PointsBadges'
import { Notifications } from './pages/Notifications'
import { ProfileEdit } from './pages/ProfileEdit'
import { Settings } from './pages/Settings'
import { Report } from './pages/Report'
import { Blocklist } from './pages/Blocklist'

function Shell({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const tabRoutes = ['/community', '/me']
  const showNav = tabRoutes.some((r) => loc.pathname === r) || loc.pathname === '/publish'
  return (
    <div className="min-h-screen w-full bg-ink-950 flex items-center justify-center sm:py-6">
      <div className="relative w-full h-screen sm:w-auto sm:h-[92vh] sm:max-h-[844px] sm:aspect-[390/844] sm:rounded-[2.8rem] sm:border-2 sm:border-ink-700 bg-ink-900 sm:shadow-2xl overflow-hidden flex flex-col">
        <div id="app-scroll" className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
        {showNav && <BottomNav />}
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const authed = useStore((s) => s.authed)
  if (!authed) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function RequireOnboarded({ children }: { children: React.ReactNode }) {
  const authed = useStore((s) => s.authed)
  const onboarded = useStore((s) => s.onboarded)
  if (!authed) return <Navigate to="/auth" replace />
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function AuthEntry() {
  const authed = useStore((s) => s.authed)
  const onboarded = useStore((s) => s.onboarded)
  if (authed) return <Navigate to={onboarded ? '/community' : '/onboarding'} replace />
  return <Auth />
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<AuthEntry />} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingSelect /></RequireAuth>} />
        <Route path="/goal-setup/:templateId" element={<RequireAuth><GoalSetup /></RequireAuth>} />

        <Route path="/community" element={<RequireOnboarded><Community /></RequireOnboarded>} />
        <Route path="/community/:templateId" element={<RequireOnboarded><CommunityGoal /></RequireOnboarded>} />
        <Route path="/checkin/:id" element={<RequireOnboarded><CheckInDetail /></RequireOnboarded>} />
        <Route path="/publish" element={<RequireOnboarded><Publish /></RequireOnboarded>} />

        <Route path="/me" element={<RequireOnboarded><Me /></RequireOnboarded>} />
        <Route path="/goal/:id" element={<RequireOnboarded><GoalDetail /></RequireOnboarded>} />
        <Route path="/points" element={<RequireOnboarded><PointsBadges /></RequireOnboarded>} />
        <Route path="/notifications" element={<RequireOnboarded><Notifications /></RequireOnboarded>} />
        <Route path="/profile-edit" element={<RequireOnboarded><ProfileEdit /></RequireOnboarded>} />
        <Route path="/settings" element={<RequireOnboarded><Settings /></RequireOnboarded>} />
        <Route path="/report/:id" element={<RequireOnboarded><Report /></RequireOnboarded>} />
        <Route path="/blocklist" element={<RequireOnboarded><Blocklist /></RequireOnboarded>} />

        <Route path="*" element={<Navigate to="/community" replace />} />
      </Routes>
    </Shell>
  )
}
