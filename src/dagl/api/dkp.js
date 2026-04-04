import { postdata } from '@/api/common'

/**
 * 获取待开收据列表
 * @param {Object} data - 查询参数
 * @param {number} data.page - 页码
 * @param {number} data.pagesize - 每页数量
 * @param {string} data.keyword - 案号关键字
 * @param {string} data.cbr - 承办人
 * @param {string} data.dsr - 当事人
 * @param {string} data.starttime - 起始日期
 * @param {string} data.endtime - 截止日期
 * @returns {Promise}
 */
export function dkpList(data) {
  const action = '/dkp/list'
  return postdata(action, data)
}

/**
 * 获取待开收据详情
 * @param {Object} data
 * @param {string|number} data.id - 记录ID
 * @returns {Promise}
 */
export function dkpDetail(data) {
  const action = '/dkp/detail'
  return postdata(action, data)
}
