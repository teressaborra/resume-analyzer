import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import SkillTags from './SkillTags'
import AtsScore from './AtsScore'
import { generateCoverLetter } from '../api'
import styles from './ResultCard.module.css'

const fitColor = { Strong: '#22c55e', Moderate: '#f59e0b', Weak: '#ef4444' }
const fitBg = { Strong: 'rgba(34,197,94,0.1)', Moderate: 'rgba(245,158,11,0.1)', Weak: 'rgba(239,68,68,0.1)' }

function Section({ title, icon, items, color }) {
  if (!items?.length) return null
  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle} style={{ color }}>{icon} {title}</p>
      <ul className={styles.list}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}

function BulletRewrites({ rewrites }) {
  if (!rewrites?.length) return null
  return (
    <div className={styles.rewriteWrap}>
      <p className={styles.blockTitle}>✏️ Suggested Bullet Rewrites</p>
      {rewrites.map((r, i) => (
        <div key={i} className={styles.rewriteItem}>
          <div className={styles.rewriteBefore}>
            <span className={styles.rewriteTag} style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>Before</span>
            <p>{r.original}</p>
          </div>
          <div className={styles.rewriteAfter}>
            <span className={styles.rewriteTag} style={{ color: '#4ade80', background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }}>After</span>
            <p>{r.improved}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ResultCard({ result, file, jobDesc }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [clLoading, setClLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCL, setShowCL] = useState(false)

  const { ai_feedback: ai, skill_match, ats, overall_score, semantic_similarity, years_of_experience, contact_info } = result
  const fit = ai?.overall_fit

  const handleCoverLetter = async () => {
    setClLoading(true)
    try {
      const res = await generateCoverLetter(file, jobDesc)
      setCoverLetter(res.data.cover_letter)
    } catch {
      setCoverLetter('Failed to generate. Please try again.')
    }
    setClLoading(false)
  }

  return (
    <div className={styles.card}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          {fit && (
            <span className={styles.fitBadge} style={{ color: fitColor[fit], background: fitBg[fit], borderColor: fitColor[fit] + '44' }}>
              {fit === 'Strong' ? '🟢' : fit === 'Moderate' ? '🟡' : '🔴'} {fit} Fit
            </span>
          )}
          <div className={styles.contactRow}>
            {contact_info?.email && <span className={styles.contact}>📧 {contact_info.email}</span>}
            {contact_info?.phone && <span className={styles.contact}>📞 {contact_info.phone}</span>}
          </div>
        </div>
        {years_of_experience > 0 && (
          <span className={styles.expPill}>🗓 {years_of_experience}+ yrs exp</span>
        )}
      </div>

      {/* ── 4 Score gauges ── */}
      <div className={styles.scores}>
        <ScoreGauge label="Overall" value={overall_score} />
        <ScoreGauge label="Semantic" value={semantic_similarity} />
        <ScoreGauge label="Skills" value={skill_match?.score ?? 0} />
        <ScoreGauge label="ATS" value={ats?.ats_score ?? 0} />
      </div>

      {/* ── AI Summary ── */}
      {ai?.fit_summary && (
        <div className={styles.summary}>
          <span className={styles.summaryIcon}>💡</span>
          <p>{ai.fit_summary}</p>
        </div>
      )}

      {/* ── Skills ── */}
      <SkillTags matched={skill_match?.matched} missing={skill_match?.missing} />

      {/* ── AI Feedback — always visible ── */}
      {(ai?.strengths?.length > 0 || ai?.improvement_suggestions?.length > 0 || ai?.resume_tips?.length > 0 || ai?.recommended_roles?.length > 0) && (
        <div className={styles.block}>
          <p className={styles.blockTitle}>🤖 AI Feedback</p>
          <div className={styles.grid}>
            <Section title="Strengths" icon="💪" items={ai?.strengths} color="#4ade80" />
            <Section title="Improvements" icon="🔧" items={ai?.improvement_suggestions} color="#fbbf24" />
            <Section title="Resume Tips" icon="📝" items={ai?.resume_tips} color="#818cf8" />
            <Section title="Recommended Roles" icon="🎯" items={ai?.recommended_roles} color="#c084fc" />
            {ai?.red_flags?.length > 0 && <Section title="Red Flags" icon="🚩" items={ai.red_flags} color="#f87171" />}
          </div>
        </div>
      )}

      {/* ── Bullet Rewrites ── */}
      <BulletRewrites rewrites={ai?.bullet_rewrites} />

      {/* ── ATS ── */}
      <AtsScore ats={ats} />

      {/* ── Cover Letter — prominent button ── */}
      <div className={styles.clBlock}>
        {!showCL ? (
          <button
            className={styles.clMainBtn}
            onClick={() => { setShowCL(true); if (!coverLetter) handleCoverLetter() }}
            disabled={clLoading}
          >
            <span className={styles.clBtnIcon}>✉️</span>
            <div>
              <p className={styles.clBtnTitle}>{clLoading ? 'Generating cover letter...' : 'Generate Cover Letter'}</p>
              <p className={styles.clBtnSub}>AI-tailored to this specific job description</p>
            </div>
            {clLoading
              ? <span className={styles.clSpinner} />
              : <span className={styles.clArrow}>→</span>
            }
          </button>
        ) : (
          <div className={styles.clOutput}>
            <div className={styles.clOutputHeader}>
              <p className={styles.blockTitle}>✉️ Cover Letter</p>
              <div className={styles.clActions}>
                <button className={styles.clActionBtn} onClick={() => { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button className={styles.clActionBtn} onClick={() => { setCoverLetter(''); handleCoverLetter() }}>Regenerate</button>
                <button className={styles.clActionBtn} onClick={() => setShowCL(false)}>Hide</button>
              </div>
            </div>
            {clLoading
              ? <div className={styles.clLoading}><span className={styles.clSpinner} /> Generating...</div>
              : <pre className={styles.clText}>{coverLetter}</pre>
            }
          </div>
        )}
      </div>

    </div>
  )
}
