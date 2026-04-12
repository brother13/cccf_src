import { postdata } from '@/api/common'

// 获取LPR利率列表
export function getLprList(params) {
  const action = '/lpr/list'
  return postdata(action, params)
}

// 获取指定日期的LPR利率
export function getLprRateByDate(date) {
  const action = '/lpr/getRateByDate'
  return postdata(action, { date })
}

// 获取最新LPR利率
export function getLatestLprRate() {
  const action = '/lpr/getLatestRate'
  return postdata(action, {})
}

// 根据日期范围获取LPR利率
export function getLprRateByDateRange(startDate, endDate) {
  const action = '/lpr/getRateByDateRange'
  return postdata(action, { startDate, endDate })
}
