import { useEffect, useState } from 'react'
import { getHistory } from '../api'
import styles from './HistoryPage.module.css'

export default function HistoryPage({ onSelect }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory().then(r => setRecords(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const getColor = (v) => v >= 70 ? '#16a34a' : v >= 40 ? '#d97706' : '#dc2626'

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Past Analyses</h1>
          <p className={styles.sub}>Click any record to view the full analysis</p>
        </div>

        {loading && <p className={styles.msg}>Loading...</p>}
        {!loading && !records.length && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>📋</p>
            <p className={styles.emptyTitle}>No analyses yet</p>
            <p className={styles.emptySub}>Analyze a resume to see your history here</p>
          </div>
        )}

        <div className={styles.list}>
          {records.map(r => (
            <div key={r._id} className={styles.item} onClick={() => onSelect(r._id)}>
              <div className={styles.itemLeft}>
                <span className={styles.fileIcon}>📄</span>
                <div>
                  <p className={styles.fileName}>{r.filename || 'resume.pdf'}</p>
                  <p className={styles.jobSnippet}>{r.job_description?.slice(0, 80)}...</p>
                  <p className={styles.date}>{new Date(r.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.score} style={{ color: getColor(r.overall_score) }}>{r.overall_score}%</span>
                <span className={styles.scoreLabel}>match</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
