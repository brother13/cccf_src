/* jshint esversion: 8 */

/**
 * 通知书相关信息
 */
import {
  postdata
} from './common'

var obj = {
  ACTION: {

    list: '/log/operloglist'

  },

  /**
   * 获取通知书数据
   * @param {*} param
   * @param {*} page
   * @param {*} pagesize
   * @returns
   */
  async getList(query) {
    const res = await postdata(this.ACTION.list, query)
    return res.data
  },
  /**
   * 获取日志更新记录
   */
  async getUpdateLog() {
    const loglist = []

    loglist.push({
      date: '2025-06-13',
      log: [
        '【调整】沈阳简化版本'

      ]
    })
    loglist.push({
      date: '2025-06-23',
      log: [
        '【调整】修正直接开票的问题'

      ]
    })

    loglist.push({
      date: '2026-01-16',
      log: [
        '【调整】增加代管款台账模块'

      ]
    })
    // 倒序排列，最新的更新内容放在前面
    return loglist.reverse()
  }

}

export default obj
