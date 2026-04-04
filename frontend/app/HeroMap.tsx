'use client'

import { useEffect, useRef } from 'react'

// ─── Contornos das massas de terra ────────────────────────────────────────────
// th = momento (0-1) em que o traçado começa dentro da animação de 5s
const LANDS = [
  // Continente Ocidental — grande, orgânico
  {
    d: `M 142 168 C 114 184, 86 210, 74 246 C 62 282, 68 322, 88 354
        C 108 386, 140 408, 176 418 C 212 428, 252 424, 284 408
        C 316 392, 338 364, 344 330 C 350 296, 341 258, 321 232
        C 301 206, 270 190, 237 184 C 216 179, 194 174, 174 170 Z`,
    th: 0.00, color: '#C9993A', w: 1.3, fill: 'rgba(201,153,58,0.055)',
  },
  // Golfo recortado no continente ocidental
  {
    d: `M 260 190 C 275 205, 283 226, 278 246 C 273 266, 258 280, 240 283`,
    th: 0.06, color: '#C9993A', w: 0.75, fill: 'none',
  },
  // Península sul do continente ocidental
  {
    d: `M 192 412 C 184 438, 178 466, 184 490 C 190 514, 208 532, 230 540
        C 252 548, 276 544, 292 530 C 308 516, 314 495, 308 472
        C 302 449, 286 432, 266 424 C 248 417, 224 413, 208 412 Z`,
    th: 0.10, color: '#C9993A', w: 1.0, fill: 'rgba(201,153,58,0.045)',
  },

  // Arquipélago do norte
  {
    d: `M 488 78 C 470 88, 457 106, 459 126 C 461 146, 476 160, 495 162
        C 514 164, 530 151, 532 133 C 534 115, 521 98, 505 90 Z`,
    th: 0.16, color: '#C9993A', w: 0.9, fill: 'rgba(201,153,58,0.045)',
  },
  {
    d: `M 558 52 C 545 62, 537 76, 540 91 C 543 106, 556 115, 570 114
        C 584 113, 594 101, 591 87 C 588 73, 575 62, 562 57 Z`,
    th: 0.20, color: '#C9993A', w: 0.8, fill: 'rgba(201,153,58,0.04)',
  },
  {
    d: `M 620 95 C 612 103, 607 115, 610 127 C 613 139, 623 146, 634 144
        C 645 142, 652 131, 649 120 C 646 109, 635 100, 625 97 Z`,
    th: 0.22, color: '#4A7C74', w: 0.7, fill: 'rgba(74,124,116,0.04)',
  },

  // Ilha central isolada
  {
    d: `M 690 305 C 677 316, 670 332, 674 348 C 678 364, 692 373, 707 371
        C 722 369, 732 355, 729 340 C 726 325, 712 313, 699 309 Z`,
    th: 0.26, color: '#4A7C74', w: 0.8, fill: 'rgba(74,124,116,0.05)',
  },

  // Continente Oriental — principal
  {
    d: `M 878 144 C 848 157, 820 180, 808 212 C 796 244, 800 280, 818 308
        C 836 336, 866 354, 900 360 C 934 366, 970 354, 990 330
        C 1010 306, 1012 272, 998 246 C 984 220, 957 204, 928 198
        C 912 194, 894 147, 878 144 Z`,
    th: 0.30, color: '#C9993A', w: 1.2, fill: 'rgba(201,153,58,0.055)',
  },
  // Extensão norte do continente oriental
  {
    d: `M 926 148 C 917 126, 912 102, 918 80 C 924 58, 942 44, 962 44
        C 982 44, 998 58, 1000 78 C 1002 98, 990 118, 974 130
        C 956 143, 938 147, 926 148 Z`,
    th: 0.36, color: '#C9993A', w: 0.9, fill: 'rgba(201,153,58,0.045)',
  },
  // Recorte costeiro leste
  {
    d: `M 998 246 C 1012 238, 1028 234, 1043 238 C 1058 242, 1068 254, 1066 268`,
    th: 0.40, color: '#C9993A', w: 0.7, fill: 'none',
  },

  // Ilha a sudeste
  {
    d: `M 1068 420 C 1050 432, 1040 452, 1044 472 C 1048 492, 1066 506, 1086 506
        C 1106 506, 1122 492, 1122 472 C 1122 452, 1108 435, 1090 427 Z`,
    th: 0.44, color: '#C9993A', w: 0.9, fill: 'rgba(201,153,58,0.045)',
  },

  // Cluster de ilhas extremo leste
  {
    d: `M 1164 192 C 1150 202, 1142 218, 1146 234 C 1150 250, 1165 260, 1180 257
        C 1195 254, 1204 239, 1200 224 C 1196 209, 1181 198, 1168 194 Z`,
    th: 0.38, color: '#4A7C74', w: 0.8, fill: 'rgba(74,124,116,0.05)',
  },
  {
    d: `M 1220 262 C 1208 272, 1202 288, 1206 303 C 1210 318, 1224 326, 1238 323
        C 1252 320, 1260 305, 1256 291 C 1252 277, 1238 266, 1225 263 Z`,
    th: 0.41, color: '#4A7C74', w: 0.75, fill: 'rgba(74,124,116,0.04)',
  },
  {
    d: `M 1278 190 C 1269 198, 1264 210, 1267 222 C 1270 234, 1281 241, 1292 239
        C 1303 237, 1310 226, 1307 214 C 1304 202, 1292 193, 1282 191 Z`,
    th: 0.43, color: '#4A7C74', w: 0.7, fill: 'rgba(74,124,116,0.04)',
  },
] as const

// ─── Rota pontilhada do "tesouro" ─────────────────────────────────────────────
// Parte do X (continente ocidental) até o continente oriental
const ROUTE = `M 200 295 C 295 268, 410 252, 520 268 C 630 284, 690 318, 770 308 C 820 300, 858 280, 910 272`

// ─── Símbolos de montanha (triângulos) ────────────────────────────────────────
const MOUNTAINS = [
  // Ocidental
  { x: 165, y: 260, s: 11 }, { x: 184, y: 248, s: 13 }, { x: 203, y: 260, s: 10 },
  { x: 220, y: 252, s: 12 }, { x: 175, y: 320, s: 10 }, { x: 193, y: 310, s: 11 },
  // Oriental
  { x: 870, y: 240, s: 11 }, { x: 888, y: 228, s: 13 }, { x: 906, y: 240, s: 10 },
  { x: 924, y: 232, s: 12 },
]

// ─── Pontos de localização ────────────────────────────────────────────────────
const PINS = [
  { x: 198,  y: 295, th: 0.52 },   // X mark
  { x: 692,  y: 338, th: 0.58 },   // ilha central
  { x: 908,  y: 330, th: 0.62 },   // continente oriental
]

export default function HeroMap() {
  const pathRefs  = useRef<(SVGPathElement | null)[]>([])
  const routeRef  = useRef<SVGPathElement | null>(null)
  const lengths   = useRef<number[]>([])
  const routeLen  = useRef(0)
  const initiated = useRef(false)

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    // Inicializa comprimentos
    LANDS.forEach((_, i) => {
      const el = pathRefs.current[i]
      if (!el) return
      const len = el.getTotalLength()
      lengths.current[i] = len
      el.style.strokeDasharray  = String(len)
      el.style.strokeDashoffset = String(len)
    })
    if (routeRef.current) {
      const len = routeRef.current.getTotalLength()
      routeLen.current = len
      routeRef.current.style.strokeDasharray  = String(len)
      routeRef.current.style.strokeDashoffset = String(len)
    }

    // RAF: desenha ao longo de 5s
    const DURATION = 5000
    const start = performance.now()
    let rafId: number

    function tick(now: number) {
      const p = Math.min((now - start) / DURATION, 1)

      LANDS.forEach((land, i) => {
        const el  = pathRefs.current[i]
        const len = lengths.current[i]
        if (!el || !len) return
        const local = Math.max(0, Math.min(1, (p - land.th) / 0.16))
        el.style.strokeDashoffset = String(len * (1 - local))
      })

      // Rota começa a se traçar na segunda metade
      if (routeRef.current && routeLen.current) {
        const local = Math.max(0, Math.min(1, (p - 0.50) / 0.30))
        routeRef.current.style.strokeDashoffset = String(routeLen.current * (1 - local))
      }

      if (p < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // opacidade baseada no progress da animação — usado nas decorações estáticas
  const mtn = (delayRatio: number) => ({
    opacity: 0,
    style: { animation: `heroMapFadeIn 0.6s ease forwards ${delayRatio * 5}s` },
  })

  return (
    <>
      <style>{`
        @keyframes heroMapFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heroMapPing {
          0%   { r: 6;  opacity: 0.6; }
          70%  { r: 14; opacity: 0;   }
          100% { r: 14; opacity: 0;   }
        }
      `}</style>

      <svg
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grade de fundo levíssima */}
        <g opacity="0.03" stroke="#C9993A" strokeWidth="0.5">
          {[116, 233, 350, 466, 583].map(y =>
            <line key={y} x1="0" y1={y} x2="1440" y2={y} />)}
          {Array.from({ length: 13 }, (_, i) => i * 120).map(x =>
            <line key={x} x1={x} y1="0" x2={x} y2="700" />)}
        </g>

        {/* Borda de pergaminho */}
        <rect x="24" y="24" width="1392" height="652"
          fill="none" stroke="#C9993A" strokeWidth="0.5" opacity="0.12"
          strokeDasharray="6 4" />
        <rect x="32" y="32" width="1376" height="636"
          fill="none" stroke="#C9993A" strokeWidth="0.3" opacity="0.07" />

        {/* ── Massas de terra ── */}
        {LANDS.map((land, i) => (
          <path
            key={i}
            ref={el => { pathRefs.current[i] = el }}
            d={land.d}
            fill={land.fill}
            stroke={land.color}
            strokeWidth={land.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={land.color === '#C9993A' ? 0.7 : 0.5}
          />
        ))}

        {/* ── Montanhas — continente ocidental ── */}
        {MOUNTAINS.map((m, i) => (
          <path
            key={i}
            d={`M ${m.x - m.s} ${m.y} L ${m.x} ${m.y - m.s * 1.5} L ${m.x + m.s} ${m.y}`}
            fill="none"
            stroke="#1B2B3B"
            strokeWidth="0.8"
            strokeLinejoin="round"
            style={{
              opacity: 0,
              animation: `heroMapFadeIn 0.5s ease forwards ${(0.28 + i * 0.04) * 5}s`,
            }}
          />
        ))}

        {/* ── Rota pontilhada ── */}
        <path
          ref={routeRef}
          d={ROUTE}
          fill="none"
          stroke="#C9993A"
          strokeWidth="1.2"
          strokeDasharray="5 7"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* ── Marcador X ── */}
        <g style={{
          opacity: 0,
          animation: `heroMapFadeIn 0.5s ease forwards ${0.50 * 5}s`,
        }}>
          <line x1={PINS[0].x - 8} y1={PINS[0].y - 8}
                x2={PINS[0].x + 8} y2={PINS[0].y + 8}
            stroke="#C9993A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={PINS[0].x + 8} y1={PINS[0].y - 8}
                x2={PINS[0].x - 8} y2={PINS[0].y + 8}
            stroke="#C9993A" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx={PINS[0].x} cy={PINS[0].y} r="12"
            fill="none" stroke="#C9993A" strokeWidth="0.5" opacity="0.35" />
        </g>

        {/* ── Pinos de localização (ilhas) ── */}
        {PINS.slice(1).map((p, i) => (
          <g key={i} style={{
            opacity: 0,
            animation: `heroMapFadeIn 0.5s ease forwards ${p.th * 5}s`,
          }}>
            <circle cx={p.x} cy={p.y} r="3" fill="#C9993A" opacity="0.7" />
            <circle cx={p.x} cy={p.y} r="8"
              fill="none" stroke="#C9993A" strokeWidth="0.5" opacity="0.3" />
          </g>
        ))}

        {/* ── Rosa dos ventos — canto inferior direito ── */}
        <g style={{
          opacity: 0,
          animation: `heroMapFadeIn 1s ease forwards ${0.68 * 5}s`,
        }} transform="translate(1340, 580)">
          {/* anéis */}
          <circle cx="0" cy="0" r="38" fill="none" stroke="#1B2B3B" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="32" fill="none" stroke="#C9993A" strokeWidth="0.3" opacity="0.4" />
          <circle cx="0" cy="0" r="6"  fill="none" stroke="#4A7C74" strokeWidth="0.9" />
          {/* linhas divisórias */}
          {[0, 45, 90, 135].map(a => (
            <line key={a}
              x1={Math.cos(a * Math.PI / 180) * -38}
              y1={Math.sin(a * Math.PI / 180) * -38}
              x2={Math.cos(a * Math.PI / 180) *  38}
              y2={Math.sin(a * Math.PI / 180) *  38}
              stroke="#1B2B3B" strokeWidth="0.6"
            />
          ))}
          {/* seta norte âmbar */}
          <path d={`M 0 -38 L 7 -14 L 0 -5 L -7 -14 Z`}
            fill="#C9993A" opacity="0.9" />
          {/* seta sul escura */}
          <path d={`M 0 38 L 5 14 L 0 5 L -5 14 Z`}
            fill="#1B2B3B" opacity="0.7" />
          {/* letras cardeais */}
          <text textAnchor="middle" y={-44}
            fontFamily="var(--font-display)" fontSize="9"
            fill="#4A7C74" letterSpacing="1">N</text>
          <text textAnchor="middle" y={52}
            fontFamily="var(--font-display)" fontSize="9"
            fill="#3A5060" letterSpacing="1">S</text>
          <text textAnchor="middle" x={47} y={4}
            fontFamily="var(--font-display)" fontSize="9"
            fill="#3A5060" letterSpacing="1">L</text>
          <text textAnchor="middle" x={-47} y={4}
            fontFamily="var(--font-display)" fontSize="9"
            fill="#3A5060" letterSpacing="1">O</text>
        </g>

        {/* ── Título cartográfico ── */}
        <text
          x="720" y="56"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize="9"
          fill="#C9993A"
          letterSpacing="4"
          style={{
            opacity: 0,
            animation: `heroMapFadeIn 1.2s ease forwards ${0.05 * 5}s`,
          }}
        >
   
        </text>

        {/* ── Coordenadas de canto ── */}
        {[
          { x: 48,   y: 50,  anchor: 'start',  text: '90° N  ·  180° O' },
          { x: 1392, y: 50,  anchor: 'end',    text: '90° N  ·  180° L' },
          { x: 48,   y: 668, anchor: 'start',  text: '90° S  ·  180° O' },
          { x: 1392, y: 668, anchor: 'end',    text: '90° S  ·  180° L' },
        ].map((c, i) => (
          <text key={i}
            x={c.x} y={c.y}
            textAnchor={c.anchor as 'start' | 'end'}
            fontFamily="var(--font-display)"
            fontSize="7"
            fill="#C9993A"
            letterSpacing="1.5"
            style={{
              opacity: 0,
              animation: `heroMapFadeIn 0.8s ease forwards ${(0.08 + i * 0.04) * 5}s`,
            }}
          >
            {c.text}
          </text>
        ))}

      </svg>
    </>
  )
}