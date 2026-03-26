'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plane, Calendar, Search, Activity } from 'lucide-react'

export default function Nav() {
  const pathname = usePathname()
  const [time, setTime] = useState('')
  const [gatewayStatus, setGatewayStatus] = useState<'unknown' | 'up' | 'down'>('unknown')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const t = setInterval(updateTime, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const checkGateway = async () => {
      try {
        const res = await fetch('/api/gateway/health')
        setGatewayStatus(res.ok ? 'up' : 'down')
      } catch {
        setGatewayStatus('down')
      }
    }
    checkGateway()
    const t = setInterval(checkGateway, 30000)
    return () => clearInterval(t)
  }, [])

  const links = [
    { href: '/', label: 'Home', icon: Activity },
    { href: '/feed', label: 'Feed', icon: Activity },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/search', label: 'Search', icon: Search },
  ]

  return (
    <nav style={{ background: '#0A0A0F', borderBottom: '1px solid #2A2A3E' }} className="sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-white font-bold">
            <Plane size={20} style={{ color: '#60A5FA' }} />
            <span style={{ color: '#60A5FA' }}>Nova</span>
            <span className="text-slate-400 font-normal text-sm">Mission Control</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === href
                    ? 'text-white bg-[#2A2A3E]'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A1A2E]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                gatewayStatus === 'up' ? 'bg-[#34D399]' :
                gatewayStatus === 'down' ? 'bg-[#F87171]' :
                'bg-slate-500'
              }`}
              style={gatewayStatus === 'up' ? { boxShadow: '0 0 6px #34D399' } : {}}
            />
            <span className="text-xs text-slate-500">Gateway</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{time}</span>
        </div>
      </div>
    </nav>
  )
}
