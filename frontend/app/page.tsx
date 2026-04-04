'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, animate } from 'framer-motion'
import styles from './page.module.css'
import MapBackground from './MapBackground'

// ─── FOG ─────────────────────────────────────────────────────────────────────

function FogCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    type Blob = { x: number; y: number; r: number; vx: number; vy: number; o: number }
    let blobs: Blob[] = []

    function resize() {
      canvas!.width = canvas!.parentElement?.clientWidth || window.innerWidth
      canvas!.height = canvas!.parentElement?.clientHeight || window.innerHeight
      blobs = Array.from({ length: 7 }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: 130 + Math.random() * 220,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1,
        o: 0.025 + Math.random() * 0.035,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, `rgba(13,27,42,${b.o})`)
        g.addColorStop(1, 'rgba(13,27,42,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        b.x += b.vx; b.y += b.vy
        if (b.x < -b.r) b.x = canvas!.width + b.r
        if (b.x > canvas!.width + b.r) b.x = -b.r
        if (b.y < -b.r) b.y = canvas!.height + b.r
        if (b.y > canvas!.height + b.r) b.y = -b.r
      })
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.fogCanvas} />
}

// ─── ÍCONE DE CANTO ──────────────────────────────────────────────────────────

function CornerMark({ cls }: { cls: string }) {
  return (
    <div className={`${styles.corner} ${cls}`}>
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path d="M1 9 L1 1 L9 1" stroke="#1B2B3B" strokeWidth="0.8" />
      </svg>
    </div>
  )
}

// ─── DEMO MESSAGES ────────────────────────────────────────────────────────────

const DEMO_MSGS = [
  { role: 'user', text: 'Crie um sistema de magia para meu mundo.' },
  {
    role: 'ai',
    text: 'Os Cristais de Aether absorvem energia residual do plano espiritual.\n\n• Carmesim — manipulação térmica\n• Cerúleo — controle atmosférico\n• Âmbar — cura e restauração\n• Obsidiana — distorção temporal (raro)',
  },
  { role: 'user', text: 'Quem controla o acesso aos cristais de Obsidiana?' },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // mouse normalizado 0-1
  const mouseX = useRef(0.5)
  const mouseY = useRef(0.5)

  // seção atual
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const totalSections = 3

  // world input
  const [worldName, setWorldName] = useState('')

  // coordenadas fictícias
  const [coords, setCoords] = useState({ lat: '48° 32\' N', lng: '12° 08\' L' })

  // cursor
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const targetSection = useRef(0)
  const animating = useRef(false)

  // ── scroll handler ──
  const goToSection = useCallback((idx: number) => {
    if (animating.current) return
    const clamped = Math.max(0, Math.min(totalSections - 1, idx))
    if (clamped === currentSection) return
    animating.current = true
    setCurrentSection(clamped)
    setScrollProgress(clamped / (totalSections - 1))

    const track = trackRef.current
    if (!track) return
    const targetX = -clamped * window.innerWidth
    animate(
      track,
      { x: targetX },
      {
        type: 'spring',
        stiffness: 50,
        damping: 18,
        mass: 1.2,
        onComplete: () => { animating.current = false },
      }
    )
  }, [currentSection, totalSections])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const delta = e.deltaY || e.deltaX
      if (delta > 30) goToSection(currentSection + 1)
      else if (delta < -30) goToSection(currentSection - 1)
    }

    // touch swipe
    let touchStartX = 0
    function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0].clientX }
    function onTouchEnd(e: TouchEvent) {
      const diff = touchStartX - e.changedTouches[0].clientX
      if (diff > 50) goToSection(currentSection + 1)
      else if (diff < -50) goToSection(currentSection - 1)
    }

    root.addEventListener('wheel', onWheel, { passive: false })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchend', onTouchEnd)
    }
  }, [currentSection, goToSection])

  // ── cursor & mouse parallax ──
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const x = e.clientX
      const y = e.clientY

      if (cursorRef.current) {
        cursorRef.current.style.left = x + 'px'
        cursorRef.current.style.top = y + 'px'
      }
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = x + 'px'
        cursorRingRef.current.style.top = y + 'px'
      }

      const nx = x / window.innerWidth
      const ny = y / window.innerHeight
      mouseX.current = nx
      mouseY.current = ny

      // coordenadas fictícias
      const lat = (48 + (ny - 0.5) * 4).toFixed(2)
      const lng = (12 + (nx - 0.5) * 6).toFixed(2)
      setCoords({
        lat: `${Math.abs(+lat)}° ${Math.round((+lat % 1) * 60).toString().padStart(2, '0')}' ${+lat >= 0 ? 'N' : 'S'}`,
        lng: `${Math.abs(+lng)}° ${Math.round((+lng % 1) * 60).toString().padStart(2, '0')}' ${+lng >= 0 ? 'L' : 'O'}`,
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  function handleCreate() {
    if (!worldName.trim()) return
    router.push(`/worlds/new?name=${encodeURIComponent(worldName.trim())}`)
  }

  return (
    <div ref={rootRef} className={styles.root}>

      {/* Cursor */}
      <div ref={cursorRef} className={styles.cursor} />
      <div ref={cursorRingRef} className={styles.cursorRing} />

      {/* Progress bar */}
      <motion.div
        className={styles.progress}
        style={{ width: `${((currentSection) / (totalSections - 1)) * 100}%` }}
        animate={{ width: `${(currentSection / (totalSections - 1)) * 100}%` }}
        transition={{ type: 'spring', stiffness: 60, damping: 20 }}
      />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoMark} />
          LOREFORGE
        </div>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => goToSection(1)}>Produto</button>
          <button className={styles.navLink}>Recursos</button>
          <button className={styles.navLink}>Comunidade</button>
        </div>
        <button className={styles.navCta} onClick={() => goToSection(2)}>
          Começar agora
        </button>
      </nav>

      {/* Paginação lateral */}
      <div className={styles.pagination}>
        {Array.from({ length: totalSections }).map((_, i) => (
          <div
            key={i}
            className={`${styles.paginationDot} ${i === currentSection ? styles.paginationDotActive : ''}`}
          />
        ))}
      </div>

      {/* Track horizontal */}
      <motion.div ref={trackRef} className={styles.track}>

        {/* ── MAPA DE FUNDO — se desenha com o scroll ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '300vw', height: '100%', pointerEvents: 'none' }}>
          <MapBackground progress={scrollProgress} />
        </div>

        {/* ── SEÇÃO 1 — HERO ── */}
        <section className={styles.section}>
          {/* névoa sutil */}
          <FogCanvas />

          {/* cantos */}
          <CornerMark cls={styles.cornerTL} />
          <CornerMark cls={styles.cornerTR} />
          <CornerMark cls={styles.cornerBL} />
          <CornerMark cls={styles.cornerBR} />

          {/* coordenadas */}
          <div className={styles.coords}>
            <div>{coords.lat}</div>
            <div>{coords.lng}</div>
          </div>

          {/* copy central */}
          <motion.div
            className={styles.heroCopy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <span className={styles.eyebrow}>Worldbuilding · Lore · Canon</span>
            <h1 className={styles.heroHeadline}>
              Todo grande universo começa<br />
              com uma pergunta que<br />
              <em>ninguém soube responder.</em>
            </h1>
            <p className={styles.heroSub}>
              Construa o mundo que vive na sua cabeça.
            </p>
          </motion.div>

          {/* hint de scroll lateral */}
          <motion.div
            className={styles.scrollHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
          >
            <span className={styles.scrollHintLabel}>Explorar</span>
            <span className={styles.scrollHintLine} />
          </motion.div>
        </section>

        {/* ── SEÇÃO 2 — PRODUTO ── */}
        <section className={styles.section}>
          <div className={styles.sectionProduct}>
            <motion.div
              className={styles.productText}
              initial={{ opacity: 0, x: -30 }}
              animate={currentSection === 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              <span className={styles.sectionEyebrow}>O worldbuilder</span>
              <h2 className={styles.sectionHeadline}>
                Seu grimório<br />
                <em>vive e respira.</em>
              </h2>
              <p className={styles.sectionBody}>
                Do sistema de magia à geopolítica dos reinos — a LoreForge mantém
                a consistência do seu universo enquanto você expande cada detalhe.
              </p>
              <div className={styles.ctaGroup}>
                <button className={styles.ctaPrimary} onClick={() => goToSection(2)}>
                  Criar meu mundo
                </button>
                <button className={styles.ctaSecondary}>
                  Ver demonstração
                </button>
              </div>
            </motion.div>

            {/* Mockup do chat */}
            <motion.div
              className={styles.chatMockup}
              initial={{ opacity: 0, x: 40 }}
              animate={currentSection === 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              <div className={styles.mockupBar}>
                <span className={`${styles.mockupDot} ${styles.dotBase}`} />
                <span className={`${styles.mockupDot} ${styles.dotSurface}`} />
                <span className={`${styles.mockupDot} ${styles.dotOcean}`} />
                <span className={styles.mockupTitle}>loreforge — sessão ativa</span>
                <span className={styles.mockupWorld}>Eldoria</span>
              </div>
              <div className={styles.mockupMessages}>
                {DEMO_MSGS.map((msg, i) => (
                  <div key={i} className={`${styles.mockupMsg} ${msg.role === 'user' ? styles.mockupMsgUser : ''}`}>
                    <div className={`${styles.mockupAvatar} ${msg.role === 'user' ? styles.mockupAvatarUser : styles.mockupAvatarAi}`}>
                      {msg.role === 'user' ? 'S' : ''}
                    </div>
                    <div className={`${styles.mockupBubble} ${msg.role === 'user' ? styles.mockupBubbleUser : styles.mockupBubbleAi}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div className={styles.mockupMsg}>
                  <div className={`${styles.mockupAvatar} ${styles.mockupAvatarAi}`} />
                  <div className={styles.mockupTyping}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SEÇÃO 3 — CTA FINAL ── */}
        <section className={styles.section}>
          <div className={styles.sectionCta}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={currentSection === 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.sectionEyebrow}>Comece agora</span>
              <h2 className={styles.ctaHeadline}>
                Como se chama<br />
                o <em>seu</em> mundo?
              </h2>
              <p className={styles.ctaSub}>
                Um nome é o primeiro ato de criação. Todo o resto começa aqui.
              </p>
              <input
                className={styles.worldInput}
                type="text"
                placeholder="Digite um nome..."
                value={worldName}
                onChange={e => setWorldName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
              />
              <br />
              <button className={styles.worldSubmit} onClick={handleCreate}>
                Começar a construir →
              </button>
            </motion.div>
          </div>

          {/* mapa fantasma de fundo na seção 3 também */}
          <div className={styles.ghostName} style={{ opacity: 0.03, fontSize: 'clamp(80px, 14vw, 180px)' }}>
            {worldName || 'Seu mundo'}
          </div>
        </section>

      </motion.div>
    </div>
  )
}