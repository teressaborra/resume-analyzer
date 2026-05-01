import { useEffect, useState } from 'react'
import { getHistory } from '../api'
import styles from './History.module.css'

export default function History({ onSelect }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then(r => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className={styles.loading}>Loading...</p>
  if (!records.length) return <p className={styles.empty}>No past analyses yet. Analyze a resume to get started.</p>

  return (
    <div className={styles.list}>
      {records.map(r => (
        <div key={r._id} className={styles.item} onClick={() => onSelect(r._id)} role="button" tabIndex={0}>
          <div className={styles.info}>
            <p className={styles.name}>📄 {r.filename || 'resume.pdf'}</p>
            {r.job_description && (
              <p className={styles.jobSnippet}>{r.job_description.slice(0, 80)}...</p>
            )}
            <p className={styles.date}>{new Date(r.created_at).toLocaleString()}</p>
          </div>
          <div className={styles.scoreWrap}>
            <span className={styles.score}>{r.overall_score}%</span>
            <span className={styles.scoreLabel}>match</span>
          </div>
        </div>
      ))}
    </div>
  )
}
