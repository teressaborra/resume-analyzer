import styles from './AtsScore.module.css'

export default function AtsScore({ ats }) {
  if (!ats) return null
  const { ats_score, matched_keywords, missing_keywords, word_count, formatting_notes } = ats
  const color = ats_score >= 70 ? '#22c55e' : ats_score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>🤖 ATS Compatibility</p>
          <p className={styles.sub}>How well your resume passes Applicant Tracking Systems</p>
        </div>
        <div className={styles.scoreWrap}>
          <span className={styles.score} style={{ color }}>{ats_score}%</span>
          <span className={styles.scoreLabel}>ATS Score</span>
        </div>
      </div>

      <div className={styles.bar}>
        <div className={styles.barFill} style={{ width: `${ats_score}%`, background: color }} />
      </div>

      <div className={styles.meta}>
        <span className={styles.pill}>📝 {word_count} words</span>
        <span className={styles.pill}>✅ {matched_keywords.length} keywords matched</span>
        <span className={styles.pill}>❌ {missing_keywords.length} keywords missing</span>
      </div>

      {formatting_notes.length > 0 && (
        <div className={styles.notes}>
          <p className={styles.notesTitle}>⚠️ Formatting Issues</p>
          <ul>
            {formatting_notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      {missing_keywords.length > 0 && (
        <div>
          <p className={styles.kwTitle}>Missing Keywords — add these to your resume:</p>
          <div className={styles.tags}>
            {missing_keywords.slice(0, 15).map(k => (
              <span key={k} className={styles.missingTag}>{k}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
