import styles from './SkillTags.module.css'

export default function SkillTags({ matched = [], missing = [] }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <p className={styles.heading}>✅ Matched Skills <span style={{color:'#22c55e'}}>({matched.length})</span></p>
        <div className={styles.tags}>
          {matched.length
            ? matched.map(s => <span key={s} className={styles.matched}>{s}</span>)
            : <span className={styles.empty}>None detected</span>}
        </div>
      </div>
      <div className={styles.box}>
        <p className={styles.heading}>❌ Missing Skills <span style={{color:'#ef4444'}}>({missing.length})</span></p>
        <div className={styles.tags}>
          {missing.length
            ? missing.map(s => <span key={s} className={styles.missing}>{s}</span>)
            : <span className={styles.empty}>None — great match!</span>}
        </div>
      </div>
    </div>
  )
}
