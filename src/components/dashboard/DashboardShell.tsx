'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardSidebar from './DashboardSidebar'
import BrandIcon from '@/components/BrandIcon'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Don't render anything while checking auth
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050508] text-white/60">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#050508]">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col z-30">
        <DashboardSidebar session={session!} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-60 h-full">
            <DashboardSidebar session={session!} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 bg-[#0a0a0f] border-b border-zinc-800 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-zinc-800 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <BrandIcon size={22} />
        <span className="text-sm font-semibold text-white">GeoWatch</span>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-60">
        {/* Spacer for mobile top bar */}
        <div className="h-[52px] lg:hidden" />
        {children}
      </div>
    </div>
  )
}
