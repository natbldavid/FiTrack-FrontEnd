import api from './axios'

export const getWeeklyActivitySummary = async (weekStartDate) => {
  const response = await api.get(`/ActivityLogs/weekly-summary/${weekStartDate}`)
  return response.data
}

export const getActivityLogs = async () => {
  const response = await api.get('/ActivityLogs')
  return response.data
}

export const getActivityLogsByDate = async (dateString) => {
  const logs = await getActivityLogs()
  return logs.filter((log) => log.logDate === dateString)
}

export const getDailyActivityMinutesTrend = async () => {
  const logs = await getActivityLogs()
  return Array.isArray(logs) ? logs : []
}

export const createActivityLog = async (payload) => {
  const response = await api.post('/ActivityLogs', payload)
  return response.data
}