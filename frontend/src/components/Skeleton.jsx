import styles from './Skeleton.module.css'

export default function Skeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={`${styles.bone} ${styles.title}`} />
          <div className={`${styles.bone} ${styles.sub}`} />
        </div>
        <div className={`${styles.bone} ${styles.badge}`} />
      </div>

      <div className={styles.scores}>
        {[1,2,3,4].map(i => (
          <div key={i} className={styles.gauge}>
            <div className={`${styles.bone} ${styles.circle}`} />
            <div className={`${styles.bone} ${styles.gaugeLabel}`} />
          </div>
        ))}
      </div>

      <div className={`${styles.bone} ${styles.summary}`} />

      <div className={styles.skillsRow}>
        <div className={`${styles.bone} ${styles.skillBox}`} />
        <div className={`${styles.bone} ${styles.skillBox}`} />
      </div>

      <div className={styles.grid}>
        {[1,2,3,4].map(i => (
          <div key={i} className={`${styles.bone} ${styles.section}`} />
        ))}
      </div>

      <div className={styles.loadingMsg}>
        <span className={styles.spinner} />
        Analyzing your resume with AI...
      </div>
    </div>
  )
}
