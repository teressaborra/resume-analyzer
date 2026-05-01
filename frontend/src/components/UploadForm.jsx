import { useState, useRef } from 'react'
import styles from './UploadForm.module.css'

export default function UploadForm({ onSubmit, loading }) {
  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') setFile(dropped)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || !jobDesc.trim()) return
    onSubmit(file, jobDesc)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div>
        <p className={styles.label}>Resume PDF</p>
        <div
          className={`${styles.dropzone} ${drag ? styles.active : ''} ${file ? styles.hasFile : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
          aria-label="Upload resume PDF"
        >
          <input ref={inputRef} type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
          {file ? (
            <>
              <span className={styles.fileIcon}>📄</span>
              <p className={styles.fileName}>{file.name}</p>
              <span className={styles.change}>Click to change file</span>
            </>
          ) : (
            <>
              <span className={styles.uploadIcon}>☁️</span>
              <p className={styles.dropText}>Drop your resume here</p>
              <span className={styles.sub}>PDF files only · Click to browse</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.divider}>Job Description</div>

      <textarea
        className={styles.textarea}
        placeholder="Paste the full job description here..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        rows={6}
        aria-label="Job description"
      />

      <button className={styles.btn} type="submit" disabled={!file || !jobDesc.trim() || loading}>
        {loading ? <span className={styles.spinner} aria-hidden="true" /> : '✦'}
        {loading ? 'Analyzing your resume...' : 'Analyze Resume'}
      </button>
    </form>
  )
}
