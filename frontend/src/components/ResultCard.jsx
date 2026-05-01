import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import SkillTags from './SkillTags'
import { generateCoverLetter } from '../api'
import styles from './ResultCard.module.css'

const fitColor = { Strong: '#22c55e', Moderate: '#f59e0b', Weak: '#ef4444' }

function Section({ title, icon, items, color }) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle} style={{ color }}>{icon} {title}</p>
      <ul className={styles.list}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}

export default function ResultCard({ result, file, jobDesc }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [clLoading, setClLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { ai_feedback: ai, skill_match, overall_score, semantic_similarity, years_of_experience, contact_info } = result

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

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Analysis Result</h2>
          <div className={styles.contactRow}>
            {contact_info?.email && <span className={styles.contact}>📧 {contact_info.email}</span>}
            {contact_info?.phone && <span className={styles.contact}>📞 {contact_info.phone}</span>}
          </div>
        </div>
        {ai?.overall_fit && (
          <span className={styles.fitBadge} style={{
            color: fitColor[ai.overall_fit],
            borderColor: fitColor[ai.overall_fit] + '55',
            background: fitColor[ai.overall_fit] + '12'
          }}>
            {ai.overall_fit} Fit
          </span>
        )}
      </div>

      <div className={styles.scores}>
        <ScoreGauge label="Overall Score" value={overall_score} />
        <ScoreGauge label="Semantic Match" value={semantic_similarity} />
        <ScoreGauge label="Skill Match" value={skill_match?.score ?? 0} />
      </div>

      {years_of_experience > 0 && (
        <div className={styles.expRow}>🗓 {years_of_experience}+ years of experience detected</div>
      )}

      {ai?.fit_summary && <p className={styles.summary}>{ai.fit_summary}</p>}

      <SkillTags matched={skill_match?.matched} missing={skill_match?.missing} />

      <div className={styles.grid}>
        {ai?.strengths?.length > 0 && <Section title="Strengths" icon="💪" items={ai.strengths} color="#22c55e" />}
        {ai?.improvement_suggestions?.length > 0 && <Section title="Improvements" icon="🔧" items={ai.improvement_suggestions} color="#f59e0b" />}
        {ai?.resume_tips?.length > 0 && <Section title="Resume Tips" icon="📝" items={ai.resume_tips} color="#6366f1" />}
        {ai?.red_flags?.length > 0 && <Section title="Red Flags" icon="🚩" items={ai.red_flags} color="#ef4444" />}
        {ai?.recommended_roles?.length > 0 && <Section title="Recommended Roles" icon="🎯" items={ai.recommended_roles} color="#8b5cf6" />}
      </div>

      <button className={styles.clBtn} onClick={handleCoverLetter} disabled={clLoading || !file}>
        {clLoading ? '⏳ Generating...' : '✉️ Generate Cover Letter'}
      </button>

      {coverLetter && (
        <div className={styles.coverLetter}>
          <div className={styles.clHeader}>
            <p className={styles.clTitle}>✉️ Cover Letter</p>
            <button className={styles.copyBtn} onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
          </div>
          <pre className={styles.clText}>{coverLetter}</pre>
        </div>
      )}
    </div>
  )
}
