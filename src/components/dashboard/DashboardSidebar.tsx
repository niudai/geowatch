'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import BrandIcon from '@/components/BrandIcon'

const navItems = [
  {
    label: 'Apps',
    href: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    isActive: (pathname: string) =>
      pathname === '/dashboard' ||
      (pathname.startsWith('/dashboard/') && !pathname.startsWith('/dashboard/billing')),
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    isActive: (pathname: string) => pathname.startsWith('/dashboard/billing'),
  },
]

export default function DashboardSidebar({
  session,
  onClose,
}: {
  session: Session
  onClose?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] border-r border-zinc-800">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <BrandIcon size={28} />
        <span className="text-base font-semibold text-white tracking-tight">GeoWatch</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-1">
        {navItems.map((item) => {
          const active = item.isActive(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5 ${
                active
                  ? 'text-white bg-zinc-800 border-l-2 border-cyan-500 pl-[10px]'
                  : 'text-white/50 hover:text-white/80 hover:bg-zinc-800/60'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-800 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          {session.user?.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={session.user.image}
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white/60">
              {session.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white/80 truncate">{session.user?.name || 'User'}</p>
            <p className="text-xs text-white/35 truncate">{session.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-zinc-800/60 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}
