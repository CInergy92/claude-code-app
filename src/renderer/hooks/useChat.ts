import { useState, useCallback, useEffect } from 'react'
import type { ChatMessage, AvatarEmotion } from '../../shared/types'

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  currentEmotion: AvatarEmotion
  sendMessage: (text: string, apiKey: string) => Promise<void>
  clearHistory: () => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>('neutral')

  useEffect(() => {
    window.electronAPI.loadChatHistory().then((history) => {
      if (history.length > 0) {
        setMessages(history)
        const lastAssistant = [...history].reverse().find((m) => m.role === 'assistant')
        if (lastAssistant?.emotion) {
          setCurrentEmotion(lastAssistant.emotion)
        }
      }
    })
  }, [])

  const sendMessage = useCallback(async (text: string, apiKey: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now()
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const allMessages = [...messages, userMessage]
      const contextMessages = allMessages.slice(-20)

      const result = await window.electronAPI.sendChatMessage({
        messages: contextMessages,
        apiKey
      })

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: result.response,
        emotion: result.emotion,
        timestamp: Date.now()
      }

      setMessages((prev) => {
        const updated = [...prev, assistantMessage]
        window.electronAPI.saveChatHistory(updated)
        return updated
      })
      setCurrentEmotion(result.emotion)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearHistory = useCallback(() => {
    setMessages([])
    setCurrentEmotion('neutral')
    setError(null)
    window.electronAPI.clearChatHistory()
  }, [])

  return { messages, isLoading, error, currentEmotion, sendMessage, clearHistory }
}
