'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import styles from './page.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Message {
  role: 'user' | 'ai'
  text: string
}

interface Lore {
  geography: string[] | null
  cultures: string[] | null
  history: string[] | null
  magic: string[] | null
  politics: string[] | null
  notes: string[] | null
}

interface World {
  id: string
  name: string
  lore: Lore
}

export default function WorldChat() {
  const { id } = useParams<{ id: string }>()
  const [world, setWorld] = useState<World | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadWorld() {
      try {
        const res = await fetch(`${API_URL}/worlds`)
        const worlds: World[] = await res.json()
        const found = worlds.find(w => w.id === id)
        if (found) {
          setWorld(found)
          setMessages([{
            role: 'ai',
            text: `Bem-vindo a ${found.name}. O grimório está pronto. O que deseja expandir hoje?`
          }])
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadWorld()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/worlds/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.response }])

      // Recarrega o mundo para atualizar o grimório
      const worldsRes = await fetch(`${API_URL}/worlds`)
      const worlds: World[] = await worldsRes.json()
      const updated = worlds.find(w => w.id === id)
      if (updated) setWorld(updated)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Erro ao conectar com o servidor.' }])
    } finally {
      setLoading(false)
    }
  }

  const loreSections = world ? [
    { label: 'Culturas', items: world.lore.cultures },
    { label: 'Geografia', items: world.lore.geography },
    { label: 'Magia', items: world.lore.magic },
    { label: 'História', items: world.lore.history },
    { label: 'Política', items: world.lore.politics },
    { label: 'Notas', items: world.lore.notes },
  ].filter(s => s.items && s.items.length > 0) : []

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoMark} />
          LOREFORGE
        </div>
        <span className={styles.worldName}>{world?.name ?? '...'}</span>
        <div className={styles.navActions}>
          <button className={styles.navBtn} onClick={() => window.location.href = `/world/${id}/coach`}>
            Writing Coach
          </button>
          <button className={styles.navBtn} onClick={() => window.location.href = '/'}>
            Meus mundos
          </button>
        </div>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.grimoire}>
          <h4 className={styles.grimoireTitle}>Grimório</h4>
          {loreSections.length === 0 ? (
            <p className={styles.grimoireEmpty}>
              O grimório está vazio. Comece uma conversa para construir seu mundo.
            </p>
          ) : (
            loreSections.map(section => (
              <div key={section.label} className={styles.loreSection}>
                <span className={styles.loreLabel}>{section.label}</span>
                {section.items!.map((item, i) => (
                  <p key={i} className={styles.loreItem}>{item}</p>
                ))}
              </div>
            ))
          )}
        </aside>

        <div className={styles.chatArea}>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : ''}`}>
                <div className={`${styles.avatar} ${msg.role === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                  {msg.role === 'user' ? 'S' : ''}
                </div>
                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className={styles.msg}>
                <div className={`${styles.avatar} ${styles.avatarAi}`} />
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputBar}>
            <input
              className={styles.input}
              placeholder="Pergunte sobre seu mundo..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button className={styles.sendBtn} onClick={sendMessage} disabled={loading}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}