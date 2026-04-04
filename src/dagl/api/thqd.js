import { postdata } from '@/api/common'

/**
 * 获取退回清单列表
 * @param {Object} data - 查询参数
 * @param {number} data.page - 页码
 * @param {number} data.pagesize - 每页数量
 * @param {string} data.keyword - 案号关键字
 * @param {string} data.cbr - 经办人
 * @param {string} data.skr - 收款人
 * @param {string} data.starttime - 起始日期
 * @param {string} data.endtime - 截止日期
 * @param {string} data.czzt - 出账状态
 * @returns {Promise}
 */
export function thqdList(data) {
  const action = '/thqd/list'
  return postdata(action, data)
}

/**
 * 获取退回清单详情
 * @param {Object} data
 * @param {string|number} data.id - 记录ID
 * @returns {Promise}
 */
export function thqdDetail(data) {
  const action = '/thqd/detail'
  return postdata(action, data)
}
