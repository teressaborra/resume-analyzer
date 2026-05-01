import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import { analyzeResume, getHistoryDetail } from './api'
import styles from './App.module.css'

export default function App() {
  const [page, setPage] = useState('home') // 'home' | 'results' | 'history'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [currentFile, setCurrentFile] = useState(null)
  const [currentJobDesc, setCurrentJobDesc] = useState('')

  const handleAnalyze = async (file, jobDesc) => {
    setLoading(true); setError(''); setResult(null)
    setCurrentFile(file); setCurrentJobDesc(jobDesc)
    setPage('results')
    try {
      const res = await analyzeResume(file, jobDesc)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Is the backend running?')
    }
    setLoading(false)
  }

  const handleHistorySelect = async (id) => {
    setLoading(true); setError(''); setResult(null)
    setPage('results')
    try {
      const res = await getHistoryDetail(id)
      setResult(res.data)
    } catch { setError('Failed to load record.') }
    setLoading(false)
  }

  return (
    <div className={styles.app}>
      {/* Navbar */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <button className={styles.logo} onClick={() => setPage('home')}>
            <span className={styles.logoMark}>R</span>
            ResumeAI
          </button>
          <div className={styles.navLinks}>
            <button className={page === 'home' ? styles.navLinkActive : styles.navLink} onClick={() => setPage('home')}>Analyzer</button>
            <button className={page === 'history' ? styles.navLinkActive : styles.navLink} onClick={() => setPage('history')}>History</button>
          </div>
        </div>
      </header>

      {page === 'home' && <LandingPage onSubmit={handleAnalyze} />}
      {page === 'results' && (
        <ResultsPage
          result={result}
          loading={loading}
          error={error}
          file={currentFile}
          jobDesc={currentJobDesc}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'history' && <HistoryPage onSelect={handleHistorySelect} />}
    </div>
  )
}
