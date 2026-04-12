import { postdata } from '@/api/common'

// 保存计算记录
export function saveCalculation(data) {
  const action = '/lixijs/save'
  return postdata(action, data)
}

// 获取计算历史
export function getCalculationHistory(params) {
  const action = '/lixijs/history'
  return postdata(action, params)
}

// 删除计算记录
export function deleteCalculation(data) {
  const action = '/lixijs/delete'
  return postdata(action, data)
}
