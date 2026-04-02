'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useSpring, useTransform, animate } from 'framer-motion'
import styles from './page.module.css'

// ─── MAPA SVG ────────────────────────────────────────────────────────────────

function MapLayer({ depth, mouseX, mouseY }: {
  depth: number
  mouseX: number
  mouseY: number
}) {
  const springConfig = { stiffness: 60, damping: 20, mass: 1 }
  const tx = useSpring(useTransform(() => (mouseX - 0.5) * depth * -1), springConfig)
  const ty = useSpring(useTransform(() => (mouseY - 0.5) * depth * -1), springConfig)

  return (
    <motion.div
      className={styles.heroLayer}
      style={{ x: tx, y: ty }}
    />
  )
}

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

// ─── HERO SVG MAP ─────────────────────────────────────────────────────────────

function HeroMapSvg({ layer }: { layer: number }) {
  return (
    <svg
      style={{ position: 'absolute', top: '-8%', left: '-8%', width: '116%', height: '116%', pointerEvents: 'none' }}
      viewBox="0 0 900 700"
      preserveAspectRatio="xMidYMid slice"
    >
      {layer === 0 && (
        /* Grid + círculos concêntricos */
        <g>
          <g opacity="0.06" stroke="#C9993A" strokeWidth="0.5">
            <line x1="0" y1="175" x2="900" y2="175" />
            <line x1="0" y1="350" x2="900" y2="350" />
            <line x1="0" y1="525" x2="900" y2="525" />
            <line x1="225" y1="0" x2="225" y2="700" />
            <line x1="450" y1="0" x2="450" y2="700" />
            <line x1="675" y1="0" x2="675" y2="700" />
          </g>
          <g opacity="0.04" stroke="#C9993A" strokeWidth="0.5" fill="none">
            <circle cx="450" cy="350" r="90" />
            <circle cx="450" cy="350" r="180" />
            <circle cx="450" cy="350" r="270" />
            <circle cx="450" cy="350" r="360" />
          </g>
        </g>
      )}
      {layer === 1 && (
        /* Costeira + rio + pontos */
        <g>
          <path
            d="M 160 490 C 170 472,180 452,192 434 C 204 416,218 400,232 384 C 246 368,260 355,276 341 C 292 327,305 316,320 302 C 335 288,346 276,358 261 C 370 246,380 232,393 219 C 406 206,420 196,436 189 C 452 182,468 179,484 180 C 500 181,515 186,528 195 C 541 204,551 216,558 230 C 565 244,568 260,568 276 C 568 292,564 308,557 322 C 550 336,539 347,526 355 C 513 363,498 368,483 370"
            fill="none" stroke="#C9993A" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" opacity="0.88"
          />
          <path
            d="M 483 370 C 468 372,453 371,439 367 C 425 363,412 355,401 344 C 390 333,382 319,378 304 C 374 289,374 273,378 259"
            fill="none" stroke="#4A7C74" strokeWidth="1.2"
            strokeLinecap="round" opacity="0.65"
          />
          <path
            d="M 484 180 C 480 164,474 147,466 131 C 458 115,447 100,434 88"
            fill="none" stroke="#4A7C74" strokeWidth="0.9"
            strokeLinecap="round" opacity="0.5"
          />
          <circle cx="320" cy="302" r="3" fill="#C9993A" opacity="0.7" />
          <circle cx="484" cy="180" r="2.5" fill="#C9993A" opacity="0.6" />
          <circle cx="568" cy="276" r="2.5" fill="#4A7C74" opacity="0.6" />
          <text x="500" y="164" textAnchor="middle"
            fontFamily="var(--font-display)" fontSize="8" fill="#C9993A"
            letterSpacing="2" opacity="0.7">ALDENMOOR</text>
        </g>
      )}
      {layer === 2 && (
        /* Montanhas + hachura + bússola + fragmento */
        <g>
          <g opacity="0.4" transform="translate(618, 218)">
            <path d="M 0 32 L 17 0 L 34 32 Z" fill="none" stroke="#2a3d4e" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M 24 32 L 42 4 L 60 32 Z" fill="none" stroke="#2a3d4e" strokeWidth="1" strokeLinejoin="round" />
            <path d="M 48 32 L 63 9 L 78 32 Z" fill="none" stroke="#1e3040" strokeWidth="0.8" strokeLinejoin="round" />
          </g>
          <g opacity="0.14" stroke="#1B2B3B" strokeWidth="0.6">
            <line x1="280" y1="382" x2="306" y2="408" />
            <line x1="302" y1="370" x2="334" y2="402" />
            <line x1="326" y1="362" x2="360" y2="396" />
            <line x1="350" y1="356" x2="384" y2="390" />
            <line x1="374" y1="352" x2="408" y2="386" />
          </g>
          <g opacity="0.45" transform="translate(768, 558)">
            <circle cx="0" cy="0" r="24" fill="none" stroke="#1B2B3B" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="4" fill="none" stroke="#4A7C74" strokeWidth="0.8" />
            <line x1="0" y1="-24" x2="0" y2="24" stroke="#1B2B3B" strokeWidth="0.7" />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#1B2B3B" strokeWidth="0.7" />
            <line x1="-17" y1="-17" x2="17" y2="17" stroke="#162330" strokeWidth="0.4" />
            <line x1="17" y1="-17" x2="-17" y2="17" stroke="#162330" strokeWidth="0.4" />
            <path d="M 0 -24 L 5 -10 L 0 -5 L -5 -10 Z" fill="#C9993A" />
            <text x="0" y="-30" textAnchor="middle"
              fontFamily="var(--font-display)" fontSize="9" fill="#4A7C74">N</text>
          </g>
        </g>
      )}
    </svg>
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
  const [mouseXState, setMouseXState] = useState(0.5)
  const [mouseYState, setMouseYState] = useState(0.5)

  // seção atual
  const [currentSection, setCurrentSection] = useState(0)
  const totalSections = 3

  // world input
  const [worldName, setWorldName] = useState('')

  // coordenadas fictícias
  const [coords, setCoords] = useState({ lat: '48° 32\' N', lng: '12° 08\' L' })

  // cursor
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)

  // scroll horizontal — progress 0..1
  const scrollProgress = useRef(0)
  const targetSection = useRef(0)
  const animating = useRef(false)

  // ── scroll handler ──
  const goToSection = useCallback((idx: number) => {
    if (animating.current) return
    const clamped = Math.max(0, Math.min(totalSections - 1, idx))
    if (clamped === currentSection) return
    animating.current = true
    setCurrentSection(clamped)

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
      setMouseXState(nx)
      setMouseYState(ny)

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

  // depths para cada camada
  const depths = [8, 22, 36]

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

        {/* ── SEÇÃO 1 — HERO ── */}
        <section className={styles.section}>
          {/* nome fantasma */}
          <div className={styles.ghostName}>Aldenmoor</div>

          {/* névoa */}
          <FogCanvas />

          {/* camadas de parallax */}
          {depths.map((d, i) => (
            <motion.div
              key={i}
              className={styles.heroLayer}
              style={{
                x: useSpring((mouseXState - 0.5) * d * -1, { stiffness: 55, damping: 18 }),
                y: useSpring((mouseYState - 0.5) * d * -1, { stiffness: 55, damping: 18 }),
              }}
            >
              <HeroMapSvg layer={i} />
            </motion.div>
          ))}

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