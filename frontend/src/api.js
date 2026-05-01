import axios from 'axios'

const BASE = 'http://localhost:8000'

export const analyzeResume = (file, jobDescription) => {
  const form = new FormData()
  form.append('resume', file)
  form.append('job_description', jobDescription)
  return axios.post(`${BASE}/analyze`, form)
}

export const generateCoverLetter = (file, jobDescription) => {
  const form = new FormData()
  form.append('resume', file)
  form.append('job_description', jobDescription)
  return axios.post(`${BASE}/cover-letter`, form)
}

export const getHistory = () => axios.get(`${BASE}/history`)
export const getHistoryDetail = (id) => axios.get(`${BASE}/history/${id}`)
