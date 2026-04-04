/* jshint esversion: 8 */

/**
 * 接口相关相关信息
 */
import {
  postdata
} from './common'

var obj = {
  ACTION: {

    countvoucher: '/export/countvoucher', // 统计指定日期内的凭证数量
    voucherTypeList: '/export/vouchertype', // 获取导出凭证接口类型
    exportVoucher: '/export/exportvoucher', // 导出凭证

    uploadfile: '/import/upload', // 通过base64上传文件

    checkfile: '/import/checkfile', // 检查文件名是否已存在
    yzw_getdata: '/import/yzw_getdata', // 获取一张网Excel的数据

    yzw_importdata: '/import/yzw_importdata'

  },

  async getCountVoucher(query) {
    const res = await postdata(this.ACTION.countvoucher, query)
    return res.data
  },
  async getVoucherTypeList() {
    const res = await postdata(this.ACTION.voucherTypeList)
    return res.data
  },
  async exportVoucher(query) {
    const res = await postdata(this.ACTION.exportVoucher, query)
    return res
  },

  async uploadFile(query) {
    const res = await postdata(this.ACTION.uploadfile, query)
    return res.data
  },
  async checkfile(query) {
    const res = await postdata(this.ACTION.checkfile, query)
    return res.data
  },
  async yzw_getdata(query) {
    const res = await postdata(this.ACTION.yzw_getdata, query)
    return res.data
  },
  async yzw_importdata(query) {
    const res = await postdata(this.ACTION.yzw_importdata, query)
    return res.data
  }
}

export default obj
