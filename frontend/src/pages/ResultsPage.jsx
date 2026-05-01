import { useState } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { generateCoverLetter } from '../api'
import styles from './ResultsPage.module.css'

const getColor = (v) => v >= 70 ? '#16a34a' : v >= 40 ? '#d97706' : '#dc2626'
const getLabel = (v) => v >= 70 ? 'Great' : v >= 40 ? 'Needs Work' : 'Poor'

function CheckItem({ status, title, why, detail }) {
  const isGood = status === 'good'
  const isWarn = status === 'warn'
  return (
    <div className={`${styles.checkItem} ${isGood ? styles.checkGood : isWarn ? styles.checkWarn : styles.checkBad}`}>
      <div className={styles.checkIcon}>
        {isGood ? '✓' : isWarn ? '!' : '✗'}
      </div>
      <div className={styles.checkBody}>
        <p className={styles.checkTitle}>{title}</p>
        {why && <p className={styles.checkWhy}><strong>Why it matters:</strong> {why}</p>}
        {detail && <p className={styles.checkDetail}>{detail}</p>}
      </div>
    </div>
  )
}

function Section({ num, title, children }) {
  return (
    <div className={styles.section} id={`section-${num}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{num}. {title}</h2>
        <span className={styles.stepLabel}>Step {num}</span>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

export default function ResultsPage({ result, loading, error, file, jobDesc, onBack }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [clLoading, setClLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCoverLetter = async () => {
    setClLoading(true)
    try {
      const res = await generateCoverLetter(file, jobDesc)
      setCoverLetter(res.data.cover_letter)
    } catch { setCoverLetter('Failed to generate. Please try again.') }
    setClLoading(false)
  }

  if (loading) return <LoadingSkeleton />
  if (error) return (
    <div className={styles.errorPage}>
      <div className={styles.errorBox}>
        <p className={styles.errorTitle}>Analysis Failed</p>
        <p className={styles.errorMsg}>{error}</p>
        <button className={styles.backBtn} onClick={onBack}>← Try Again</button>
      </div>
    </div>
  )
  if (!result) return null

  const { ai_feedback: ai, skill_match, ats, overall_score, semantic_similarity, years_of_experience, contact_info } = result
  const fit = ai?.overall_fit || 'Moderate'
  const scoreColor = getColor(overall_score)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.gaugeWrap}>
              <CircularProgressbar
                value={overall_score}
                text={`${overall_score}`}
                styles={buildStyles({
                  textColor: scoreColor,
                  pathColor: scoreColor,
                  trailColor: '#e2e8f0',
                  textSize: '22px',
                })}
              />
            </div>
            <p className={styles.sidebarScoreLabel}>Your Resume Score</p>
            <p className={styles.sidebarScoreDesc} style={{ color: scoreColor }}>
              {getLabel(overall_score)}
            </p>
            {ai?.fit_summary && <p className={styles.sidebarSummary}>{ai.fit_summary}</p>}
          </div>

          <div className={styles.sidebarMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Semantic Match</span>
              <span className={styles.metricVal} style={{ color: getColor(semantic_similarity) }}>{semantic_similarity}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Skill Match</span>
              <span className={styles.metricVal} style={{ color: getColor(skill_match?.score) }}>{skill_match?.score}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>ATS Score</span>
              <span className={styles.metricVal} style={{ color: getColor(ats?.ats_score) }}>{ats?.ats_score}%</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Overall Fit</span>
              <span className={styles.metricVal} style={{ color: getColor(fit === 'Strong' ? 80 : fit === 'Moderate' ? 55 : 25) }}>{fit}</span>
            </div>
          </div>

          <button className={styles.backBtn} onClick={onBack}>← Analyze Another</button>
        </aside>

        {/* Main content */}
        <main className={styles.main}>

          {/* Section 1: Contact Info */}
          <Section num={1} title="Contact Information">
            <CheckItem
              status={contact_info?.email ? 'good' : 'bad'}
              title={contact_info?.email ? `Email Detected: ${contact_info.email}` : 'No Email Found'}
              why="ATS and recruiters need your email to contact you."
              detail={contact_info?.email ? 'No action needed.' : 'Add your email address to your resume.'}
            />
            <CheckItem
              status={contact_info?.phone ? 'good' : 'warn'}
              title={contact_info?.phone ? `Phone Detected: ${contact_info.phone}` : 'No Phone Number Found'}
              why="Recruiters may want to call you directly."
              detail={contact_info?.phone ? 'No action needed.' : 'Consider adding your phone number.'}
            />
            {years_of_experience > 0 && (
              <CheckItem
                status="good"
                title={`${years_of_experience}+ Years of Experience Detected`}
                why="Experience level helps recruiters quickly assess your seniority."
                detail="Your experience is clearly stated in your resume."
              />
            )}
          </Section>

          {/* Section 2: Skills */}
          <Section num={2} title="Skills Analysis">
            <div className={styles.skillsGrid}>
              <div className={styles.skillBox}>
                <p className={styles.skillBoxTitle} style={{ color: '#16a34a' }}>
                  ✓ Matched Skills
                  <span className={styles.skillCount}>{skill_match?.matched?.length || 0}</span>
                </p>
                <div className={styles.tags}>
                  {skill_match?.matched?.length
                    ? skill_match.matched.map(s => <span key={s} className={styles.tagGreen}>{s}</span>)
                    : <span className={styles.noSkills}>None detected</span>}
                </div>
              </div>
              <div className={styles.skillBox}>
                <p className={styles.skillBoxTitle} style={{ color: '#dc2626' }}>
                  ✗ Missing Skills
                  <span className={styles.skillCount}>{skill_match?.missing?.length || 0}</span>
                </p>
                <div className={styles.tags}>
                  {skill_match?.missing?.length
                    ? skill_match.missing.map(s => <span key={s} className={styles.tagRed}>{s}</span>)
                    : <span className={styles.noSkills}>None — great match!</span>}
                </div>
              </div>
            </div>
          </Section>

          {/* Section 3: ATS */}
          <Section num={3} title="ATS Compatibility">
            <div className={styles.atsHeader}>
              <div className={styles.atsBar}>
                <div className={styles.atsBarFill} style={{ width: `${ats?.ats_score}%`, background: getColor(ats?.ats_score) }} />
              </div>
              <span className={styles.atsScore} style={{ color: getColor(ats?.ats_score) }}>{ats?.ats_score}%</span>
            </div>
            <div className={styles.atsMeta}>
              <span className={styles.atsChip}>📝 {ats?.word_count} words</span>
              <span className={styles.atsChip}>✓ {ats?.matched_keywords?.length} keywords matched</span>
              <span className={styles.atsChip}>✗ {ats?.missing_keywords?.length} keywords missing</span>
            </div>
            {ats?.formatting_notes?.map((n, i) => (
              <CheckItem key={i} status="warn" title={n} why="Formatting affects ATS parsing." />
            ))}
            {ats?.missing_keywords?.length > 0 && (
              <div className={styles.missingKw}>
                <p className={styles.missingKwTitle}>Add these keywords to improve your ATS score:</p>
                <div className={styles.tags}>
                  {ats.missing_keywords.slice(0, 15).map(k => <span key={k} className={styles.tagRed}>{k}</span>)}
                </div>
              </div>
            )}
          </Section>

          {/* Section 4: AI Feedback */}
          <Section num={4} title="AI Feedback">
            {ai?.error ? (
              <div className={styles.aiError}>
                <p className={styles.aiErrorTitle}>⚠️ AI Analysis Unavailable</p>
                <p className={styles.aiErrorMsg}>Gemini API could not be reached. This is a network issue — your network may be blocking Google API calls. Try switching to a mobile hotspot.</p>
                <p className={styles.aiErrorDetail}>Error: {ai.error}</p>
              </div>
            ) : (
              <>
                {ai?.strengths?.length > 0 && (
                  <div className={styles.feedbackBlock}>
                    <p className={styles.feedbackTitle} style={{ color: '#16a34a' }}>💪 Strengths</p>
                    {ai.strengths.map((s, i) => <CheckItem key={i} status="good" title={s} />)}
                  </div>
                )}
                {ai?.improvement_suggestions?.length > 0 && (
                  <div className={styles.feedbackBlock}>
                    <p className={styles.feedbackTitle} style={{ color: '#d97706' }}>🔧 Improvements Needed</p>
                    {ai.improvement_suggestions.map((s, i) => <CheckItem key={i} status="warn" title={s} />)}
                  </div>
                )}
                {ai?.resume_tips?.length > 0 && (
                  <div className={styles.feedbackBlock}>
                    <p className={styles.feedbackTitle} style={{ color: '#6366f1' }}>📝 Resume Tips</p>
                    {ai.resume_tips.map((s, i) => <CheckItem key={i} status="warn" title={s} />)}
                  </div>
                )}
                {ai?.red_flags?.length > 0 && (
                  <div className={styles.feedbackBlock}>
                    <p className={styles.feedbackTitle} style={{ color: '#dc2626' }}>🚩 Red Flags</p>
                    {ai.red_flags.map((s, i) => <CheckItem key={i} status="bad" title={s} />)}
                  </div>
                )}
                {ai?.recommended_roles?.length > 0 && (
                  <div className={styles.feedbackBlock}>
                    <p className={styles.feedbackTitle} style={{ color: '#7c3aed' }}>🎯 Recommended Roles</p>
                    <div className={styles.tags} style={{ marginTop: 8 }}>
                      {ai.recommended_roles.map(r => <span key={r} className={styles.tagPurple}>{r}</span>)}
                    </div>
                  </div>
                )}
                {!ai?.strengths?.length && !ai?.improvement_suggestions?.length && (
                  <p className={styles.aiEmpty}>No AI feedback available for this analysis.</p>
                )}
              </>
            )}
          </Section>

          {/* Section 5: Bullet Rewrites */}
          {ai?.bullet_rewrites?.length > 0 && (
            <Section num={5} title="Suggested Bullet Rewrites">
              {ai.bullet_rewrites.map((r, i) => (
                <div key={i} className={styles.rewrite}>
                  <div className={styles.rewriteCol}>
                    <span className={styles.rewriteTag} style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>Before</span>
                    <p className={styles.rewriteText}>{r.original}</p>
                  </div>
                  <div className={styles.rewriteArrow}>→</div>
                  <div className={styles.rewriteCol}>
                    <span className={styles.rewriteTag} style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>After</span>
                    <p className={styles.rewriteText} style={{ color: '#0f172a' }}>{r.improved}</p>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* Section 6: Cover Letter */}
          <Section num={ai?.bullet_rewrites?.length > 0 ? 6 : 5} title="Cover Letter">
            {!coverLetter ? (
              <div className={styles.clPrompt}>
                <p className={styles.clPromptText}>Generate a personalized cover letter tailored to this specific job description using your resume details.</p>
                {!file && <p className={styles.aiErrorMsg}>⚠️ Cover letter requires the original resume file. Please re-analyze to use this feature.</p>}
                <button className={styles.clBtn} onClick={handleCoverLetter} disabled={clLoading || !file}>
                  {clLoading ? <><span className={styles.spinner} /> Generating...</> : '✉️ Generate Cover Letter'}
                </button>
              </div>
            ) : coverLetter.startsWith('Cover letter generation failed') ? (
              <div className={styles.aiError}>
                <p className={styles.aiErrorTitle}>⚠️ Cover Letter Generation Failed</p>
                <p className={styles.aiErrorMsg}>Gemini API is not reachable on your network. Try switching to a mobile hotspot and click regenerate.</p>
                <button className={styles.clBtn} style={{ marginTop: 10 }} onClick={handleCoverLetter} disabled={clLoading}>
                  {clLoading ? <><span className={styles.spinner} /> Retrying...</> : '🔄 Retry'}
                </button>
              </div>
            ) : (
              <div className={styles.clOutput}>
                <div className={styles.clActions}>
                  <button className={styles.clActionBtn} onClick={() => { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button className={styles.clActionBtn} onClick={() => { setCoverLetter(''); handleCoverLetter() }}>🔄 Regenerate</button>
                </div>
                <pre className={styles.clText}>{coverLetter}</pre>
              </div>
            )}
          </Section>

        </main>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={`${styles.bone} ${styles.boneCircle}`} />
            <div className={`${styles.bone} ${styles.boneLine}`} style={{ width: 100, margin: '12px auto 6px' }} />
            <div className={`${styles.bone} ${styles.boneLine}`} style={{ width: 60, margin: '0 auto' }} />
          </div>
        </aside>
        <main className={styles.main}>
          {[1,2,3,4].map(i => (
            <div key={i} className={styles.section}>
              <div className={`${styles.bone} ${styles.boneLine}`} style={{ width: 200, height: 20, marginBottom: 16 }} />
              <div className={`${styles.bone} ${styles.boneBlock}`} />
              <div className={`${styles.bone} ${styles.boneBlock}`} style={{ height: 60 }} />
            </div>
          ))}
          <div className={styles.loadingMsg}>
            <span className={styles.spinner} style={{ borderTopColor: '#6366f1', borderColor: 'rgba(99,102,241,0.2)' }} />
            Analyzing your resume with AI...
          </div>
        </main>
      </div>
    </div>
  )
}
