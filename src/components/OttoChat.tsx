'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'otto'
  text: string
}

export default function OttoChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const msg = input.trim()
    if (!msg || sending) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setSending(true)
    try {
      const res = await fetch('/api/ops/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      const reply = data.reply || data.message || data.response || JSON.stringify(data)
      setMessages(prev => [...prev, { role: 'otto', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'otto', text: 'Error reaching Otto. Try again.' }])
    }
    setSending(false)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        style={{ background: '#60A5FA' }}
      >
        {open ? <X size={22} color="#0A0A0F" /> : <MessageCircle size={22} color="#0A0A0F" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: '#12121A', border: '1px solid #2A2A3E', height: '420px' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #2A2A3E' }}>
            <span className="text-white font-semibold text-sm">Otto</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-slate-500 text-xs text-center mt-8">Ask Otto anything about the operation...</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: m.role === 'user' ? '#60A5FA' : '#2A2A3E',
                    color: m.role === 'user' ? '#0A0A0F' : '#E2E8F0',
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg text-sm text-slate-400" style={{ background: '#2A2A3E' }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2" style={{ borderTop: '1px solid #2A2A3E' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Otto..."
              className="flex-1 bg-transparent text-white text-sm px-3 py-2 rounded-lg outline-none"
              style={{ border: '1px solid #2A2A3E' }}
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{ background: '#60A5FA', opacity: sending || !input.trim() ? 0.5 : 1 }}
            >
              <Send size={14} color="#0A0A0F" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
