"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Message { role: "user" | "ai"; text: string; }
interface Lore {
  geography: string[] | null; cultures: string[] | null;
  history: string[] | null;  magic: string[] | null;
  politics: string[] | null; notes: string[] | null;
}
interface World { id: string; name: string; lore: Lore; }

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M14 8L2 2l3 6-3 6 12-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export default function WorldChat() {
  const { id } = useParams<{ id: string }>();
  const [world, setWorld]     = useState<World | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res    = await fetch(`${API_URL}/worlds`);
        const worlds: World[] = await res.json();
        const found  = worlds.find((w) => w.id === id);
        if (found) {
          setWorld(found);
          setMessages([{ role: "ai", text: `Bem-vindo a ${found.name}. O que deseja explorar primeiro?` }]);
        }
      } catch (err) { console.error(err); }
    }
    load();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function send() {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    setMessages((p) => [...p, { role: "user", text }]);
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/worlds/${id}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { role: "ai", text: data.response }]);
      const wr   = await fetch(`${API_URL}/worlds`);
      const ws: World[] = await wr.json();
      const upd  = ws.find((w) => w.id === id);
      if (upd) setWorld(upd);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "Erro ao conectar com o servidor." }]);
    } finally { setLoading(false); }
  }

  const loreSections = world ? [
    { label: "Culturas",  items: world.lore.cultures  },
    { label: "Geografia", items: world.lore.geography },
    { label: "Magia",     items: world.lore.magic     },
    { label: "História",  items: world.lore.history   },
    { label: "Política",  items: world.lore.politics  },
    { label: "Notas",     items: world.lore.notes     },
  ].filter((s) => s.items && s.items.length > 0) : [];

  return (
    <div className={styles.root}>

      {/* NAV */}
      <nav className={styles.nav}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoMark} />
          LOREFORGE
        </a>
        {world && <span className={styles.worldPill}>{world.name}</span>}
        <div className={styles.navRight}>
          <button className={styles.navBtn} onClick={() => (window.location.href = `/worlds/${id}/coach`)}>
            Writing Coach
          </button>
          <button className={styles.navBtn} onClick={() => (window.location.href = "/")}>
            ← Mundos
          </button>
        </div>
      </nav>

      {/* LAYOUT */}
      <div className={styles.layout}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Grimório</p>
          {loreSections.length === 0 ? (
            <p className={styles.sidebarEmpty}>
              O grimório está vazio. Converse para que o lore do mundo seja registrado aqui.
            </p>
          ) : loreSections.map((s) => (
            <div key={s.label} className={styles.loreGroup}>
              <span className={styles.loreLabel}>{s.label}</span>
              {s.items!.map((item, i) => (
                <p key={i} className={styles.loreItem}>{item}</p>
              ))}
            </div>
          ))}
        </aside>

        {/* CHAT */}
        <main className={styles.chat}>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.row} ${msg.role === "user" ? styles.rowUser : styles.rowAi}`}>
                {msg.role === "ai" && (
                  <div className={styles.avatarAi}>
                    <span className={styles.logoMark} />
                  </div>
                )}
                <div className={`${styles.bubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className={styles.avatarUser}>S</div>
                )}
              </div>
            ))}

            {loading && (
              <div className={`${styles.row} ${styles.rowAi}`}>
                <div className={styles.avatarAi}><span className={styles.logoMark} /></div>
                <div className={styles.typingBubble}>
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className={styles.inputWrap}>
            <div className={styles.inputBox}>
              <textarea
                ref={inputRef}
                className={styles.textarea}
                placeholder="Expanda seu universo…"
                value={input}
                rows={1}
                disabled={loading}
                onChange={(e) => { setInput(e.target.value); resize(e.target); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <button
                className={styles.sendBtn}
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Enviar"
              >
                <SendIcon />
              </button>
            </div>
            <p className={styles.hint}>Enter para enviar · Shift+Enter para nova linha</p>
          </div>
        </main>
      </div>
    </div>
  );
}