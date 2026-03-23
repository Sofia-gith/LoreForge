'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const QUICK_TAGS = ['Fantasia medieval', 'Ficção científica', 'Steampunk', 'Mitológico']

const DEMO_MESSAGES = [
  {
    role: 'user',
    text: 'Crie um sistema de magia baseado em cristais para meu mundo de fantasia.',
  },
  {
    role: 'ai',
    text: (
      <>
        <strong>Sistema Cristalino de Aetherveil</strong>
        <br /><br />
        Os cristais de Aether absorvem energia residual do mundo espiritual. Cada cor canaliza um aspecto diferente:
        <br /><br />
        • <strong>Carmesim</strong> — <em>manipulação térmica e cinética</em><br />
        • <strong>Cerúleo</strong> — <em>controle hídrico e atmosférico</em><br />
        • <strong>Âmbar</strong> — <em>cura e restauração biológica</em><br />
        • <strong>Obsidiana</strong> — <em>distorção temporal (extremamente raro)</em><br /><br />
        <em>Custo: o uso prolongado causa "Cristalização" — veias do portador endurecem lentamente.</em>
      </>
    ),
  },
  {
    role: 'user',
    text: 'Quem controla o acesso aos cristais de Obsidiana?',
  },
]

const FEATURES = [
  {
    color: 'gold',
    title: 'Grimório vivo',
    desc: 'Tudo que você cria é salvo automaticamente e usado para manter a coerência do mundo.',
  },
  {
    color: 'purple',
    title: 'Writing Coach',
    desc: 'Cole um trecho da sua história e receba feedback de consistência e qualidade narrativa.',
  },
  {
    color: 'teal',
    title: 'Memória profunda',
    desc: 'A IA conhece seu mundo inteiro — não apenas a última mensagem.',
  },
]

export default function Home() {
  const [input, setInput] = useState('')
  const router = useRouter()

  function handleCreate() {
    if (!input.trim()) return
    router.push(`/worlds/new?name=${encodeURIComponent(input.trim())}`)
  }

  function handleTag(tag: string) {
    setInput(tag)
  }

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoMark} />
          LOREFORGE
        </div>
        <div className={styles.navLinks}>
          <button className={styles.navLink}>Explorar</button>
          <button className={styles.navLink}>Recursos</button>
          <button className={styles.navLink}>Comunidade</button>
        </div>
        <button className={styles.navCta}>Começar agora</button>
      </nav>

      <section className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          <span>Inteligência artificial para criadores de mundos</span>
        </div>
        <h1 className={styles.headline}>
          Construa universos
          <em className={styles.headlineEm}>extraordinários</em>
        </h1>
        <p className={styles.sub}>
          Do sistema de magia à geopolítica dos reinos, a LoreForge te ajuda a criar mundos consistentes, profundos e inesquecíveis.
        </p>
        <div className={styles.inputWrap}>
          <input
            className={styles.mainInput}
            placeholder="Descreva o mundo que você imagina..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button className={styles.mainBtn} onClick={handleCreate}>
            Criar mundo
          </button>
        </div>
        <div className={styles.tags}>
          {QUICK_TAGS.map(tag => (
            <button key={tag} className={styles.tag} onClick={() => handleTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>veja o worldbuilder em ação</span>
        <span className={styles.dividerLine} />
      </div>

      <section className={styles.demo}>
        <div className={styles.demoBar}>
          <span className={`${styles.dot} ${styles.dotR}`} />
          <span className={`${styles.dot} ${styles.dotY}`} />
          <span className={`${styles.dot} ${styles.dotG}`} />
          <span className={styles.demoTitle}>loreforge — sessão ativa</span>
          <span className={styles.demoWorld}>Eldoria</span>
        </div>
        <div className={styles.messages}>
          {DEMO_MESSAGES.map((msg, i) => (
            <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : ''}`}>
              <div className={`${styles.avatar} ${msg.role === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                {msg.role === 'user' ? 'S' : ''}
              </div>
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div className={styles.msg}>
            <div className={`${styles.avatar} ${styles.avatarAi}`} />
            <div className={styles.typing}>
              <span /><span /><span />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        {FEATURES.map(f => (
          <div key={f.title} className={styles.feat}>
            <div className={styles.featIcon}>
              <span className={`${styles.gem} ${styles[`gem_${f.color}`]}`} />
            </div>
            <h4 className={styles.featTitle}>{f.title}</h4>
            <p className={styles.featDesc}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}