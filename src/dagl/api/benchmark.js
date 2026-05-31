import { postdata } from '@/api/common'

// 获取基准利率列表
export function getBenchmarkList(params) {
  const action = '/benchmark/list'
  return postdata(action, params)
}

// 获取指定日期的基准利率
export function getBenchmarkRateByDate(date) {
  const action = '/benchmark/getRateByDate'
  return postdata(action, { date })
}

// 根据期限类型获取利率
// periodType: 6m, 6m_1y, 1y_3y, 3y_5y, 5y_plus, 1y, 1y_5y
export function getBenchmarkRateByPeriod(date, periodType) {
  const action = '/benchmark/getRateByPeriod'
  return postdata(action, { date, periodType })
}

// 获取最新基准利率
export function getLatestBenchmarkRate() {
  const action = '/benchmark/getLatestRate'
  return postdata(action, {})
}

// 批量同步基准利率（按发布日存在则更新，不存在则新增）
export function syncBenchmarkRates(rows) {
  const action = '/benchmark/syncRates'
  return postdata(action, { rows })
}
