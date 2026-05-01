import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import styles from './ScoreGauge.module.css'

const getColor = (score) => {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

export default function ScoreGauge({ label, value }) {
  const color = getColor(value)
  return (
    <div className={styles.wrap}>
      <div className={styles.gauge}>
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          styles={buildStyles({
            textColor: color,
            pathColor: color,
            trailColor: '#2d3748',
            textSize: '18px',
          })}
        />
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  )
}
