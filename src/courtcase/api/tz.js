/* jshint esversion: 8 */

/**
 * 台账相关的功能
 */
import {
  postdata
} from './common'

var report = {
  ACTION: {
    getCfBatchList: '/data/getCfBatchList',
    batch_save: '/data/batch_save',
    getDocTemplateList:'/data/getDocTemplateList'
  },

  async getCfBatchList(id) {
    const res = await postdata(this.ACTION.getCfBatchList, { id: id })
    return res.data
  },
  async batch_save(query) {
    const res = await postdata(this.ACTION.batch_save, query)
    return res
  },
   async getDocTemplateList(doctype='txcl') {
    const res = await postdata(this.ACTION.getDocTemplateList, { type: doctype })
    return res.data
  },
}

export default report
