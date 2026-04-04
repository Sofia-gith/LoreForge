'use client'

import { useEffect, useRef } from 'react'

interface Props {
  progress: number
}

export default function MapBackground({ progress }: Props) {
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const lengths  = useRef<number[]>([])
  const initiated = useRef(false)

  const DRAW_PATHS = [
    // HEMISFÉRIO ESQUERDO — Américas
    { d: `M 148 168 C 138 178,128 192,122 208 C 116 224,114 242,116 260 C 118 278,124 295,133 310 C 142 325,154 337,168 346 C 182 355,198 360,214 361 C 230 362,246 358,260 350 C 274 342,286 330,294 315 C 302 300,306 283,305 266 C 304 249,299 232,290 218 C 281 204,269 192,255 184 C 241 176,225 172,209 171 C 193 170,177 170,164 174`, th: 0.0, color: '#C9993A', w: 1.2 },
    { d: `M 214 361 C 218 374,219 388,216 401 C 213 414,207 426,198 435`, th: 0.02, color: '#C9993A', w: 0.9 },
    { d: `M 198 435 C 190 444,184 455,181 467 C 178 479,179 491,183 502`, th: 0.04, color: '#C9993A', w: 0.9 },
    { d: `M 183 502 C 186 514,192 526,200 536 C 212 550,228 560,246 566 C 264 572,283 574,301 571 C 319 568,336 560,350 548 C 364 536,374 520,379 502 C 384 484,383 465,377 447 C 371 429,360 413,346 400 C 332 387,315 378,297 374 C 279 370,260 371,243 377 C 226 383,210 394,198 408`, th: 0.06, color: '#C9993A', w: 1.2 },
    { d: `M 350 548 C 355 562,357 577,355 592 C 353 607,347 620,338 630`, th: 0.09, color: '#C9993A', w: 0.8 },
    { d: `M 230 290 C 242 278,256 268,272 262 C 288 256,305 254,321 256`, th: 0.08, color: '#4A7C74', w: 0.7 },
    { d: `M 260 360 C 268 372,274 385,277 399 C 280 413,280 427,276 440`, th: 0.1, color: '#4A7C74', w: 0.6 },
    // HEMISFÉRIO DIREITO — Europa/África/Ásia
    { d: `M 780 150 C 790 158,798 168,804 180 C 810 192,813 205,813 218 C 813 231,810 244,803 255 C 796 266,786 274,775 279 C 764 284,752 285,741 282 C 730 279,720 272,713 262 C 706 252,702 240,702 228 C 702 216,706 204,714 194 C 722 184,733 177,746 173 C 759 169,773 168,784 172`, th: 0.30, color: '#C9993A', w: 1.1 },
    { d: `M 741 282 C 738 295,738 308,741 321 C 744 334,751 345,760 353`, th: 0.32, color: '#C9993A', w: 0.8 },
    { d: `M 760 353 C 772 360,786 364,800 364 C 814 364,828 360,840 352 C 852 344,862 332,868 318 C 874 304,875 288,871 273 C 867 258,859 244,847 234 C 835 224,820 218,805 217`, th: 0.34, color: '#C9993A', w: 1.2 },
    { d: `M 871 273 C 878 285,882 298,882 312 C 882 326,878 340,870 351 C 862 362,851 370,838 374 C 825 378,811 377,799 372`, th: 0.36, color: '#C9993A', w: 1.0 },
    { d: `M 799 372 C 793 383,790 395,790 408 C 790 421,793 434,799 445`, th: 0.38, color: '#C9993A', w: 0.8 },
    { d: `M 813 218 C 826 212,840 208,854 207 C 868 206,882 208,895 214 C 908 220,919 230,926 242 C 933 254,936 268,934 282 C 932 296,925 309,915 318`, th: 0.40, color: '#C9993A', w: 1.1 },
    { d: `M 870 320 C 876 332,879 345,878 358 C 877 371,872 383,863 391 C 854 399,843 403,831 402`, th: 0.42, color: '#C9993A', w: 0.9 },
    { d: `M 800 250 C 806 262,810 275,811 289 C 812 303,810 317,804 329`, th: 0.44, color: '#4A7C74', w: 0.7 },
    { d: `M 870 240 C 878 252,884 265,887 279 C 890 293,889 307,884 320`, th: 0.45, color: '#4A7C74', w: 0.6 },
    // OCEANIA
    { d: `M 920 350 C 930 342,942 337,954 336 C 966 335,978 338,988 345 C 998 352,1005 362,1007 374 C 1009 386,1006 398,999 407 C 992 416,982 421,971 422 C 960 423,949 420,940 413 C 931 406,925 395,922 383 C 919 371,920 359,924 349`, th: 0.56, color: '#C9993A', w: 1.0 },
    { d: `M 940 460 C 948 454,958 450,968 450 C 978 450,987 454,993 461`, th: 0.58, color: '#4A7C74', w: 0.8 },
  ]

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    // 1. Inicializa comprimentos e esconde todos os paths
    DRAW_PATHS.forEach((_, i) => {
      const el = pathRefs.current[i]
      if (!el) return
      const len = el.getTotalLength()
      lengths.current[i] = len
      el.style.strokeDasharray  = String(len)
      el.style.strokeDashoffset = String(len)
    })

    // 2. Auto-desenha os paths ao longo de ~4.5s com RAF
    const DRAW_DURATION = 4500
    const startTime = performance.now()
    let rafId: number

    function tick(now: number) {
      const p = Math.min((now - startTime) / DRAW_DURATION, 1)

      DRAW_PATHS.forEach((path, i) => {
        const el  = pathRefs.current[i]
        const len = lengths.current[i]
        if (!el || !len) return
        // cada path começa a se traçar no seu próprio threshold
        const local = Math.max(0, Math.min(1, (p - path.th) / 0.18))
        el.style.strokeDashoffset = String(len * (1 - local))
      })

      if (p < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const op = (th: number) => Math.max(0, Math.min(1, (progress - th) / 0.12))

  // helper de meridianos/paralelos para um hemisfério
  const gridLines = (cx: number) => {
    const parallels = [-4,-3,-2,-1,0,1,2,3,4].map((n,i) => {
      const cy = 350 + n*55
      const r  = Math.sqrt(Math.max(0, 245*245-(n*55)*(n*55)))
      if (r < 10) return null
      return <line key={'p'+i} x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#C9993A" strokeWidth="0.35" opacity="0.35"/>
    })
    const meridians = [-3,-2,-1,0,1,2,3].map((n,i) => {
      const rx = Math.abs(n)*78
      if (rx < 5) return <line key={'m'+i} x1={cx} y1={105} x2={cx} y2={595} stroke="#C9993A" strokeWidth="0.35" opacity="0.35"/>
      return <ellipse key={'m'+i} cx={cx} cy={350} rx={rx} ry={245} fill="none" stroke="#C9993A" strokeWidth="0.35" opacity="0.35"/>
    })
    return [...parallels, ...meridians]
  }

  const compass = (size: number) => (
    <>
      <circle cx="0" cy="0" r={size}    fill="none" stroke="#1B2B3B" strokeWidth="0.8"/>
      <circle cx="0" cy="0" r={size*.85} fill="none" stroke="#C9993A" strokeWidth="0.3" opacity="0.4"/>
      <circle cx="0" cy="0" r={size*.14} fill="none" stroke="#4A7C74" strokeWidth="0.8"/>
      {[0,45,90,135].map(a=>(
        <line key={a}
          x1={Math.cos(a*Math.PI/180)*-size} y1={Math.sin(a*Math.PI/180)*-size}
          x2={Math.cos(a*Math.PI/180)*size}  y2={Math.sin(a*Math.PI/180)*size}
          stroke="#1B2B3B" strokeWidth="0.6"
        />
      ))}
      <path d={`M 0 ${-size} L ${size*.2} ${-size*.38} L 0 ${-size*.14} L ${-size*.2} ${-size*.38} Z`} fill="#C9993A" opacity="0.9"/>
      <path d={`M 0 ${size}  L ${size*.14} ${size*.38} L 0 ${size*.14} L ${-size*.14} ${size*.38} Z`} fill="#1B2B3B" opacity="0.7"/>
      <text textAnchor="middle" y={-size-6} fontFamily="var(--font-display)" fontSize={size*.28} fill="#4A7C74" letterSpacing="1">N</text>
    </>
  )

  const miniGlobe = (r: number) => (
    <>
      <circle cx="0" cy="0" r={r}      fill="none" stroke="#C9993A" strokeWidth="0.6"/>
      <circle cx="0" cy="0" r={r*.82}  fill="none" stroke="#1B2B3B" strokeWidth="0.4"/>
      {[-2,-1,0,1,2].map((n,i)=>{
        const rr = Math.sqrt(Math.max(0, r*r-(n*r/2.5)*(n*r/2.5)))
        return <line key={i} x1={-rr} y1={n*r/2.5} x2={rr} y2={n*r/2.5} stroke="#C9993A" strokeWidth="0.3" opacity="0.35"/>
      })}
      {[-2,-1,0,1,2].map((n,i)=>(
        <ellipse key={i} cx={0} cy={0} rx={Math.abs(n)*r/2.2} ry={r} fill="none" stroke="#C9993A" strokeWidth="0.3" opacity="0.35"/>
      ))}
    </>
  )

  return (
    <svg
      style={{ position:'absolute', top:0, left:0, width:'300vw', height:'100%', pointerEvents:'none', zIndex:0 }}
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grade global */}
      <g opacity="0.04" stroke="#C9993A" strokeWidth="0.4">
        {[116,233,350,466,583].map(y=><line key={y} x1="0" y1={y} x2="1440" y2={y}/>)}
        {Array.from({length:13},(_,i)=>i*120).map(x=><line key={x} x1={x} y1="0" x2={x} y2="700"/>)}
      </g>

      {/* ── HEMISFÉRIO ESQUERDO ─────────────────────── */}
      <g opacity={op(0.0)} style={{transition:'opacity 0.8s ease'}}>
        <circle cx="330" cy="350" r="255" fill="none" stroke="#C9993A" strokeWidth="0.3"/>
        <circle cx="330" cy="350" r="245" fill="none" stroke="#C9993A" strokeWidth="0.8"/>
        <circle cx="330" cy="350" r="235" fill="none" stroke="#1B2B3B" strokeWidth="0.5"/>
      </g>
      <g opacity={op(0.01) * 0.35} style={{transition:'opacity 1s ease'}}>
        {gridLines(330)}
      </g>
      <text x="330" y="82" textAnchor="middle" fontFamily="var(--font-display)" fontSize="9" fill="#C9993A" letterSpacing="3"
        opacity={op(0.04)*0.55} style={{transition:'opacity 0.8s ease'}}>HEMISPHÆRIVM OCCIDENTALE</text>

      {/* Costas desenhadas hemisfério esquerdo */}
      {DRAW_PATHS.slice(0,7).map((p,i)=>(
        <path key={i} ref={el=>{pathRefs.current[i]=el}} d={p.d}
          fill="none" stroke={p.color} strokeWidth={p.w}
          strokeLinecap="round" strokeLinejoin="round"
          opacity={p.color==='#C9993A'?0.75:0.5}
          />
      ))}

      {/* Montanhas Rockies */}
      {[[155,240],[167,226],[179,240],[191,228],[203,240]].map(([x,y],i)=>(
        <path key={i} d={`M${x-7} ${y} L${x} ${y-12} L${x+7} ${y}`}
          fill="none" stroke="#1B2B3B" strokeWidth="0.7" strokeLinejoin="round"
          opacity={op(0.04)*0.55} style={{transition:'opacity 0.6s ease'}}/>
      ))}
      {/* Montanhas Andes */}
      {[[222,430],[234,418],[246,430],[258,416],[270,430],[282,420],[294,430]].map(([x,y],i)=>(
        <path key={i} d={`M${x-7} ${y} L${x} ${y-13} L${x+7} ${y}`}
          fill="none" stroke="#1B2B3B" strokeWidth="0.8" strokeLinejoin="round"
          opacity={op(0.07)*0.6} style={{transition:'opacity 0.6s ease'}}/>
      ))}

      {/* Pontos de localização — hemisfério esquerdo */}
      {[{x:209,y:250,t:0.05},{x:237,y:450,t:0.08},{x:290,y:510,t:0.1}].map((d,i)=>(
        <g key={i} opacity={op(d.t)} style={{transition:'opacity 0.6s ease'}}>
          <circle cx={d.x} cy={d.y} r="2.5" fill="#C9993A" opacity="0.7"/>
          <circle cx={d.x} cy={d.y} r="6" fill="none" stroke="#C9993A" strokeWidth="0.4" opacity="0.3"/>
        </g>
      ))}

      {/* Bússola grande — hemisfério esquerdo */}
      <g opacity={op(0.05)} style={{transition:'opacity 1s ease'}} transform="translate(95,565)">
        {compass(36)}
        <text textAnchor="middle" y="46" fontFamily="var(--font-display)" fontSize="9" fill="#3A5060" letterSpacing="1">S</text>
        <text textAnchor="middle" x="46" y="4"  fontFamily="var(--font-display)" fontSize="9" fill="#3A5060" letterSpacing="1">E</text>
        <text textAnchor="middle" x="-46" y="4" fontFamily="var(--font-display)" fontSize="9" fill="#3A5060" letterSpacing="1">O</text>
      </g>

      {/* Rotas irradiando do hemisfério esquerdo */}
      {[{x2:95,y2:565,t:0.1},{x2:180,y2:130,t:0.1},{x2:560,y2:270,t:0.12},{x2:565,y2:440,t:0.12}].map((l,i)=>(
        <line key={i} x1="330" y1="350" x2={l.x2} y2={l.y2}
          stroke="#C9993A" strokeWidth="0.35" strokeDasharray="4 6"
          opacity={op(l.t)*0.22} style={{transition:'opacity 0.8s ease'}}/>
      ))}

      {/* ── CENTRAL (seção 2) ────────────────────────── */}
      <text x="720" y="58" textAnchor="middle" fontFamily="var(--font-display)"
        fontSize="11" fill="#C9993A" letterSpacing="5"
        opacity={op(0.18)*0.3} style={{transition:'opacity 1s ease'}}>TYPVS DE INTEGRO</text>

      <g opacity={op(0.20)} style={{transition:'opacity 1s ease'}} transform="translate(720,145)">
        {miniGlobe(54)}
      </g>
      <g opacity={op(0.22)} style={{transition:'opacity 1s ease'}} transform="translate(720,572)">
        {miniGlobe(48)}
      </g>
      <g opacity={op(0.22)} style={{transition:'opacity 1s ease'}} transform="translate(720,350)">
        {compass(20)}
      </g>

      {/* ── HEMISFÉRIO DIREITO ──────────────────────── */}
      <g opacity={op(0.28)} style={{transition:'opacity 0.8s ease'}}>
        <circle cx="1110" cy="350" r="255" fill="none" stroke="#C9993A" strokeWidth="0.3"/>
        <circle cx="1110" cy="350" r="245" fill="none" stroke="#C9993A" strokeWidth="0.8"/>
        <circle cx="1110" cy="350" r="235" fill="none" stroke="#1B2B3B" strokeWidth="0.5"/>
      </g>
      <g opacity={op(0.29)*0.35} style={{transition:'opacity 1s ease'}}>
        {gridLines(1110)}
      </g>
      <text x="1110" y="82" textAnchor="middle" fontFamily="var(--font-display)" fontSize="9" fill="#C9993A" letterSpacing="3"
        opacity={op(0.29)*0.55} style={{transition:'opacity 0.8s ease'}}>HEMISPHÆRIVM ORIENTALE</text>

      {/* Costas desenhadas hemisfério direito */}
      {DRAW_PATHS.slice(7).map((p,i)=>{
        const gi = i+7
        return (
          <path key={gi} ref={el=>{pathRefs.current[gi]=el}} d={p.d}
            fill="none" stroke={p.color} strokeWidth={p.w}
            strokeLinecap="round" strokeLinejoin="round"
            opacity={p.color==='#C9993A'?0.75:0.5}
            />
        )
      })}

      {/* Montanhas hemisfério direito */}
      {[[808,310],[820,296],[832,310],[844,298],[856,310]].map(([x,y],i)=>(
        <path key={i} d={`M${x-7} ${y} L${x} ${y-12} L${x+7} ${y}`}
          fill="none" stroke="#1B2B3B" strokeWidth="0.7" strokeLinejoin="round"
          opacity={op(0.36)*0.55} style={{transition:'opacity 0.6s ease'}}/>
      ))}
      {[[858,390],[870,376],[882,390]].map(([x,y],i)=>(
        <path key={i} d={`M${x-7} ${y} L${x} ${y-13} L${x+7} ${y}`}
          fill="none" stroke="#1B2B3B" strokeWidth="0.7" strokeLinejoin="round"
          opacity={op(0.42)*0.55} style={{transition:'opacity 0.6s ease'}}/>
      ))}

      {/* Pontos de localização — hemisfério direito */}
      {[{x:780,y:230,t:0.35},{x:831,y:380,t:0.40},{x:875,y:330,t:0.44},{x:955,y:360,t:0.56}].map((d,i)=>(
        <g key={i} opacity={op(d.t)} style={{transition:'opacity 0.6s ease'}}>
          <circle cx={d.x} cy={d.y} r="2.5" fill="#C9993A" opacity="0.7"/>
          <circle cx={d.x} cy={d.y} r="6" fill="none" stroke="#C9993A" strokeWidth="0.4" opacity="0.3"/>
        </g>
      ))}

      {/* Bússola — hemisfério direito */}
      <g opacity={op(0.58)} style={{transition:'opacity 1s ease'}} transform="translate(1342,148)">
        {compass(30)}
      </g>

      {/* Rotas hemisfério direito */}
      {[{x2:1342,y2:148,t:0.45},{x2:900,y2:200,t:0.45},{x2:880,y2:470,t:0.46},{x2:1300,y2:500,t:0.46}].map((l,i)=>(
        <line key={i} x1="1110" y1="350" x2={l.x2} y2={l.y2}
          stroke="#C9993A" strokeWidth="0.35" strokeDasharray="4 6"
          opacity={op(l.t)*0.22} style={{transition:'opacity 0.8s ease'}}/>
      ))}

    </svg>
  )
}