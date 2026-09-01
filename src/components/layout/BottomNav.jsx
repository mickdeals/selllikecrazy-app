import { Home, Search, Plus, MessageSquare, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'

const tabs = [
  { path: '/',         icon: Home,           label: 'Home'     },
  { path: '/browse',   icon: Search,         label: 'Browse'   },
  { path: '/sell',     icon: Plus,           label: 'Sell',    sell: true },
  { path: '/messages', icon: MessageSquare,  label: 'Messages' },
  { path: '/profile',  icon: User,           label: 'Profile'  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {tabs.map(({ path, icon: Icon, label, sell }) => (
        <button
          key={path}
          className={`nav-item ${sell ? 'nav-sell-btn' : ''} ${pathname === path ? 'active' : ''}`}
          onClick={() => navigate(path)}
          aria-label={label}
          aria-current={pathname === path ? 'page' : undefined}
        >
          <Icon size={22} />
          {label}
        </button>
      ))}
    </nav>
  )
}
