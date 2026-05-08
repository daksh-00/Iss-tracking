import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, MessageSquare, Send, Trash2, X } from 'lucide-react'
import { askChatbot } from '../../services/chatService'
import { useDashboardContext } from '../../context/DashboardContext'

const CHAT_KEY = 'iss-chat-history'

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]')
    } catch {
      return []
    }
  })
  const { issSnapshot, newsArticles } = useDashboardContext()
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30)))
  }, [messages])
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  const onSend = async () => {
    if (!canSend) return
    const content = input.trim()
    setInput('')
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)
    const reply = await askChatbot(content, { issData: issSnapshot, newsData: newsArticles })
    setMessages((prev) => [...prev, { role: 'bot', content: reply }].slice(-30))
    setLoading(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-indigo-600 p-4 text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700"
        aria-label="Open chatbot"
      >
        <MessageSquare size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="fixed bottom-24 right-5 z-50 flex h-[460px] w-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot size={16} />
                AI Dashboard Assistant
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setMessages([])} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Clear chat history">
                  <Trash2 size={16} />
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close chatbot">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div ref={scrollContainerRef} className="flex-1 space-y-2 overflow-y-auto p-3">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                  {message.content}
                </div>
              ))}
              {loading && <div className="chat-bubble-bot typing-dots">Typing</div>}
            </div>
            <div className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && onSend()}
                placeholder="Ask about ISS or dashboard news..."
                aria-label="Chat input"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
              />
              <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send message" className="rounded-lg bg-indigo-600 p-2 text-white disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
