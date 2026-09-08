'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Camera,
  LayoutDashboard,
  Images,
  PlusCircle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Settings,
} from 'lucide-react'

const SESSION_KEY = 'shiko_admin_auth'

function checkAuth(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

function logout(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

interface AdminShellProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/admin/dashboard',     label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/galleries',     label: 'Galleries',   icon: Images },
  { href: '/admin/galleries/new', label: 'New Gallery', icon: PlusCircle },
  { href: '/admin/settings',      label: 'Settings',    icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === '/admin/galleries/new') return pathname === href
  if (href === '/admin/galleries')     return pathname.startsWith('/admin/galleries') && pathname !== '/admin/galleries/new'
  return pathname === href
}

export default function AdminShell({ children }: AdminShellProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready,       setReady]   = useState(false)
  const [sidebarOpen, setSidebar] = useState(false)

  useEffect(() => {
    if (!checkAuth()) {
      router.replace('/admin')
    } else {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="w-6 h-6 border border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex bg-warm-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 md:hidden" onClick={() => setSidebar(false)} />
      )}

      <aside className={[
        'fixed md:static inset-y-0 left-0 z-50 md:z-auto w-56 bg-warm-50 border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        <div className="px-5 py-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Camera size={15} strokeWidth={1.5} className="text-muted" />
              <span className="font-[family-name:var(--font-cormorant)] text-base tracking-[0.12em] uppercase">SHIKO</span>
            </div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted mt-0.5 pl-[23px]">Admin</p>
          </div>
          <button onClick={() => setSidebar(false)} className="md:hidden text-muted hover:text-foreground" aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebar(false)}
              className={[
                'flex items-center gap-3 px-5 py-2.5 text-xs tracking-[0.1em] uppercase transition-colors',
                isActive(pathname, href)
                  ? 'text-foreground bg-warm-100 border-r-2 border-foreground'
                  : 'text-muted hover:text-foreground hover:bg-warm-100',
              ].join(' ')}>
              <Icon size={13} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-border flex flex-col gap-2.5">
          <Link href="/" target="_blank" className="flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase text-muted hover:text-foreground transition-colors">
            <ExternalLink size={12} />
            View Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase text-muted hover:text-foreground transition-colors cursor-pointer">
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="md:hidden flex items-center justify-between px-5 py-3 border-b border-border bg-warm-50 sticky top-0 z-30">
          <button onClick={() => setSidebar(true)} className="text-muted hover:text-foreground p-1" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <span className="font-[family-name:var(--font-cormorant)] text-base tracking-[0.12em] uppercase">SHIKO Admin</span>
          <div className="w-8" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
