import { useState } from 'react'
import UploadForm from './components/UploadForm'
import ResultCard from './components/ResultCard'
import History from './components/History'
import { analyzeResume, getHistoryDetail } from './api'
import styles from './App.module.css'

export default function App() {
  const [tab, setTab] = useState('analyze')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [currentFile, setCurrentFile] = useState(null)
  const [currentJobDesc, setCurrentJobDesc] = useState('')

  const handleAnalyze = async (file, jobDesc) => {
    setLoading(true); setError(''); setResult(null)
    setCurrentFile(file); setCurrentJobDesc(jobDesc)
    try {
      const res = await analyzeResume(file, jobDesc)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Is the backend running?')
    }
    setLoading(false)
  }

  const handleHistorySelect = async (id) => {
    setLoading(true); setError('')
    try {
      const res = await getHistoryDetail(id)
      setResult(res.data); setTab('analyze')
    } catch { setError('Failed to load record.') }
    setLoading(false)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🧠</span>
          AI Resume Analyzer
        </div>
        <nav className={styles.nav}>
          <button className={tab === 'analyze' ? styles.active : ''} onClick={() => setTab('analyze')}>Analyze</button>
          <button className={tab === 'history' ? styles.active : ''} onClick={() => setTab('history')}>History</button>
        </nav>
      </header>

      <main className={styles.main}>
        {tab === 'analyze' && (
          <>
            <div className={styles.hero}>
              <div className={styles.badge}>
                <span className={styles.badgeDot} />
                Powered by Gemini AI + NLP
              </div>
              <h1 className={styles.heroTitle}>
                Match your resume to<br /><span>any job in seconds</span>
              </h1>
              <p className={styles.heroSub}>
                Upload your PDF resume and paste a job description. Get AI-powered match scores, skill gap analysis, and personalized improvement tips.
              </p>
            </div>

            <div className={styles.layout}>
              <div className={styles.left}>
                <UploadForm onSubmit={handleAnalyze} loading={loading} />
                {error && <div className={styles.error}>⚠️ {error}</div>}
              </div>
              <div className={styles.right}>
                {result
                  ? <ResultCard result={result} file={currentFile} jobDesc={currentJobDesc} />
                  : (
                    <div className={styles.placeholder}>
                      <span className={styles.placeholderIcon}>📊</span>
                      <p>Your analysis will appear here</p>
                      <span className={styles.placeholderHint}>Upload a resume and job description to get started</span>
                    </div>
                  )
                }
              </div>
            </div>
          </>
        )}

        {tab === 'history' && (
          <div className={styles.historyPage}>
            <h2 className={styles.pageTitle}>Past Analyses</h2>
            <p className={styles.pageSubtitle}>Click any record to view the full analysis</p>
            <History onSelect={handleHistorySelect} />
          </div>
        )}
      </main>
    </div>
  )
}
