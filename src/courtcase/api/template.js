/* jshint esversion: 8 */

/**
 * 审判动态报表相关信息
 */
import {
  postdata
} from './common'

var basedata = {
  ACTION: {

    list: '/template/list',
    info: '/template/info',
    getTemplate: '/template/gettemplate',
    saveTemplate: '/template/savetemplate',
    getField: '/template/field',
    getpreview: '/template/getpreview',
    getprintdata: '/template/getprintdata',
    getprintdata_batch: '/template/getprintdata_batch',
    getprintnum: '/template/getprintnum',
    logprint: '/template/logprint'

  },

  async getList(param) {
    const res = await postdata(this.ACTION.list, param)
    return res.data
  },
  async getInfo(id) {
    const param = { id: id }
    const res = await postdata(this.ACTION.info, param)
    return res.data
  },
  /**
   *  获取模板可用的字段列表
   * @param {number} typeid
   * @returns
   */
  async getTemplateField(typeid) {
    const param = { typeid: typeid }
    const res = await postdata(this.ACTION.getField, param)
    return res.data
  },

  /**
   * 获取模板内容
   * @param {*} id
   * @returns
   */
  async getTemplate(id) {
    const param = { id: id }
    const res = await postdata(this.ACTION.getTemplate, param)

    return res
  },

  /**
   * 保存模板数据
   * @param {*} id
   * @param {*} tpldata
   * @returns
   */
  async saveTemplate(id, tpldata) {
    const param = { id: id, tpldata: tpldata }
    const res = await postdata(this.ACTION.saveTemplate, param)
    return res
  },

  /**
   * 获取预览数据
   * @param {*} typeid
   * @returns
   */
  async getPreviewData(typeid) {
    const param = { typeid: typeid }
    const res = await postdata(this.ACTION.getpreview, param)

    return res.data
  },

  /**
   * 获取打印数据
   * @param {*} typeid
   * @param {*} id
   * @returns
   */
  async getPrintData(typeid, id) {
    const param = { typeid: typeid, id: id }
    const res = await postdata(this.ACTION.getprintdata, param)
    return res
  },
  async getPrintData_Batch(typeid, id) {
    const param = { typeid: typeid, id: id }
    const res = await postdata(this.ACTION.getprintdata_batch, param)
    return res
  },

  async getPrintNum(typeid, id) {
    const param = { typeid: typeid, id: id }
    const res = await postdata(this.ACTION.getprintnum, param)
    return res.data
  },
  async logPrintNum(typeid, id) {
    const param = { typeid: typeid, id: id }
    const res = await postdata(this.ACTION.logprint, param)
    return res
  }

}

export default basedata
