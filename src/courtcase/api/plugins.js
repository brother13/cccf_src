/* jshint esversion: 8 */

/**
 * 增强功能
 */
import store from './store'
import {
  postdata
} from './common'

var report = {
  ACTION: {

    dgkreport_calc: '/plugins/dgkreport_calc',
    dgkreport_count: '/plugins/dgkreport_count',
    dgkreport_getList: '/plugins/dgkreport_getList',
    dgkreport_getDataRange: '/plugins/dgkreport_getDataRange',
    dgkreport_getendtime: '/plugins/dgkreport_getendtime',

    getStListByBillCase: '/plugins/getStListByBillCase',

    // 添加与查看备注
    getNote: '/plugins/getNote',
    addNote: '/plugins/addNote',

    // 收款明细表
    queryList_sk: '/plugins/sklist',
    queryList_tk: '/plugins/tklist',
    countCasenum: '/plugins/countCasenum',

    // 直接从admin_shoukuan表查询代管款数据
    queryList_sk_direct: '/plugins/queryList_sk_direct',

    // 执行款台账汇总表
    queryList_sk_tk_summary: '/plugins/queryList_sk_tk_summary'

  },

  async dgkreport_calc(query) {
    const res = await postdata(this.ACTION.dgkreport_calc, query)
    return res
  },

  async dgkreport_count(query) {
    const res = await postdata(this.ACTION.dgkreport_count, query)
    return res.data
  },

  async dgkreport_getList(query) {
    const res = await postdata(this.ACTION.dgkreport_getList, query)
    return res.data
  },
  async dgkreport_getDataRange() {
    const res = await postdata(this.ACTION.dgkreport_getDataRange)
    return res.data
  },
  async dgkreport_getendtime() {
    const res = await postdata(this.ACTION.dgkreport_getendtime)
    return res.data
  },
  async getStListByBillCase(query) {
    const res = await postdata(this.ACTION.getStListByBillCase, query)
    return res.data
  },
  async getNote(query) {
    const res = await postdata(this.ACTION.getNote, query)
    return res.data
  },
  async addNote(query) {
    const res = await postdata(this.ACTION.addNote, query)
    return res.data
  },

  async queryList_sk(query) {
    const res = await postdata(this.ACTION.queryList_sk, query)
    return res.data
  },
  async queryList_tk(query) {
    const res = await postdata(this.ACTION.queryList_tk, query)
    return res.data
  },

  async countCasenum(query) {
    const res = await postdata(this.ACTION.countCasenum, query)
    return res.data
  },

  async queryList_sk_direct(query) {
    const res = await postdata(this.ACTION.queryList_sk_direct, query)
    return res.data
  },

  async queryList_sk_tk_summary(query) {
    const res = await postdata(this.ACTION.queryList_sk_tk_summary, query)
    return res.data
  }
}

export default report
