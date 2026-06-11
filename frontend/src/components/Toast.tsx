import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react"

interface ToastMessage {
  id: number
  text: string
  type: "success" | "error" | "info"
}

interface ToastContextType {
  toast: (text: string, type?: ToastMessage["type"]) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((text: string, type: ToastMessage["type"] = "info") => {
    const id = nextId++
    setMessages((prev) => [...prev, { id, text, type }])
  }, [])

  const remove = (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {messages.map((m) => (
          <ToastItem key={m.id} message={m} onDone={() => remove(m.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ message, onDone }: { message: ToastMessage; onDone: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [onDone])

  const colors = {
    success: "border-semantic-success/20 bg-semantic-success/5 text-semantic-success",
    error: "border-semantic-error/20 bg-semantic-error/5 text-semantic-error",
    info: "border-brand-400/20 bg-brand-400/5 text-brand-400",
  }

  const icons = {
    success: "✓",
    error: "✗",
    info: "i",
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        colors[message.type]
      } ${visible ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-[10px] font-bold">
        {icons[message.type]}
      </span>
      <span>{message.text}</span>
      <button onClick={onDone} className="ml-2 text-current/40 hover:text-current/80 transition-colors">
        ✕
      </button>
    </div>
  )
}
