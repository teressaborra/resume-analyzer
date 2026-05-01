import { useState, useRef } from 'react'
import styles from './LandingPage.module.css'

export default function LandingPage({ onSubmit }) {
  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [drag, setDrag] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !jobDesc.trim()) return
    setLoading(true)
    await onSubmit(file, jobDesc)
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.tag}>Free AI Resume Checker + Instant Score</span>
          <h1 className={styles.heroTitle}>
            Uncover Gaps and<br />
            <span className={styles.heroAccent}>3X your chances</span>
          </h1>
          <p className={styles.heroDesc}>
            Our AI Resume Analyzer scans your resume against the job description using 10+ quality parameters that recruiters and ATS systems care about.
          </p>
          <div className={styles.features}>
            {['ATS Score', 'Skill Gap Analysis', 'AI Feedback', 'Cover Letter'].map(f => (
              <span key={f} className={styles.featureChip}>✓ {f}</span>
            ))}
          </div>
        </div>

        <div className={styles.heroRight}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.formTitle}>Analyze Your Resume</h2>
            <p className={styles.formSub}>Upload your PDF and paste the job description</p>

            {/* Drop zone */}
            <div
              className={`${styles.dropzone} ${drag ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current.click()}
              role="button" tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
              {file ? (
                <div className={styles.fileInfo}>
                  <span className={styles.fileEmoji}>📄</span>
                  <div>
                    <p className={styles.fileName}>{file.name}</p>
                    <p className={styles.fileChange}>Click to change</p>
                  </div>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <div className={styles.uploadIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                  </div>
                  <p className={styles.dropText}>Drop your resume here</p>
                  <p className={styles.dropSub}>PDF only · Max 10MB</p>
                </div>
              )}
            </div>

            {/* Job description */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Job Description</label>
              <textarea
                className={styles.textarea}
                placeholder="Paste the full job description here..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={5}
              />
            </div>

            <button className={styles.submitBtn} type="submit" disabled={!file || !jobDesc.trim() || loading}>
              {loading
                ? <><span className={styles.spinner} /> Analyzing...</>
                : 'Analyze My Resume →'
              }
            </button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <h2 className={styles.howTitle}>How it works</h2>
          <div className={styles.steps}>
            {[
              { n: '1', title: 'Upload Resume', desc: 'Upload your PDF resume' },
              { n: '2', title: 'Paste Job Description', desc: 'Copy the job posting you want to apply for' },
              { n: '3', title: 'Get AI Analysis', desc: 'Receive scores, skill gaps, and AI feedback instantly' },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
