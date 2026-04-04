/* jshint esversion: 8 */

/**
 * 收款相关操作
 */
import {
  postdata
} from './common'

import { MessageBox } from 'element-ui'

import base from './basedata'
import store from './store'
var obj = {
  ACTION: {

    list: '/casesk/list',
    info: '/casesk/info',
    next: '/casesk/next',
    pre: '/casesk/pre',
    voidcase: '/casesk/void',

    save: '/casesk/save',
    add: '/casesk/add',
    newcode: '/casesk/newcode',
    checknotice: '/casesk/checknotice',
    // 根据单据号获取收退列表
    billstlist: '/casesk/billstlist',
    // 根据案号获取收退列表
    casestlist: '/casesk/casestlist',
    claiminfo: '/casesk/claiminfo',

    // 根据单据号获取单据信息
    billInfo: '/casesk/billinfo',

    // 上传诉讼费接口文件及相关功能

    uploadssf: '/import/importssfbank',

    // 诉讼费 非税列表

    ssffslist: '/import/ssffslist',
    // 导入诉讼费非税
    ssffsimport: '/import/importssfnotax',
    // 获取五年上缴的列表
    getoldlist: '/casesk/getoldlist',

    // 以下是罚没款相关的操作
    fmk_getList: '/export/fmkList',
    fmk_Export: '/export/fmkExport',
    fmkimport: '/import/importjailfmk',

    // 根据银行账号刷新承办人和案号信息
    casebillRefreshCaseinfo: '/casesk/casebill_updateCasebankzh',
    casebillRefreshCaseinfo_new: '/casesk/casebill_updateCasebankzh_new',

    casebill_getbanklist: '/casesk/casebill_getbankzhlist',
    casebill_getbanklist_new: '/casesk/casebill_getbankzhlist_new',

    updateCasebill_caseinfo: '/casesk/updateCasebill_caseinfo',
    // 新的，增加部门信息
    updateCasebill_caseinfo_new: '/casesk/updateCasebill_caseinfo_new',

    // 获取银行流水号明细
    getbanklsh: '/casesk/getbanklsh',

    // 做非税导入
    ssfnotax_getdata: '/import/ssfnotax_getdata',
    ssfnotax_importdata: '/import/ssfnotax_importdata',

    // 变更收退款方式
    changeaccount: '/casesk/changeaccount',

    // 罚没款入账 获取excel数据
    casebillfmk_getdata: '/import/casebillfmk_getdata',
    // 罚没款入账 批量导入生成数据
    casebillfmk_importdata: '/import/casebillfmk_importdata',

    // 罚没款 认领获取数据
    casebillfmk_getinfo: '/casesk/casebillfmk_getinfo',

    // 获取案件信息
    getajjbxx: '/casesk/ajjbxx',

    // 罚没款入账获取可用接口类型
    fmk_getfiletype: '/import/fmk_getfiletype',

    // 做国库提存款导入
    gksk_getdata: '/import/gksk_getdata',
    gksk_importdata: '/import/gksk_importdata',

    BatchDelJailfmk: '/casesk/BatchDelJailfmk',

    getNewBillnoByLast: '/casesk/getNewBillnoByLast'

  },

  /**
   * 获取案款列表数据
   * @param {*} param
   * @param {*} page
   * @param {*} pagesize
   * @returns
   */
  async getList(param, page, pagesize) {
    const query = param
    query['page'] = page || param['page'] || 1
    query['pagesize'] = pagesize || param['pagesize']

    const action = '/casesk/list'
    const res = await postdata(action, query)
    return res.data
  },
  /**
   * 获取单据信息
   * @param {int} id 单据ID
   * @param {int} typeid  单据类型
   * @returns
   */
  async info(id, typeid) {
    const query = { id: id, typeid: typeid }
    const res = await postdata(this.ACTION.info, query)
    return res.data
  },
  async getInfoByDjcode(djcode, typeid) {
    const query = { billno: djcode, typeid: typeid }
    const res = await postdata(this.ACTION.list, query)
    const data = res.data
    if (data.total && data.total.num > 0) {
      return data.items[0]
    } else {
      return null
    }
  },
  // 下一张
  async getNext(billno, typeid) {
    const query = { billno: billno, typeid: typeid }
    const res = await postdata(this.ACTION.next, query)
    const data = res.data
    if (data) {
      const id = data.id
      const row = await this.info(id, typeid)
      return row
    } else {
      return false
    }
  },
  // 上一张
  async getPre(billno, typeid) {
    const query = { billno: billno, typeid: typeid }
    const res = await postdata(this.ACTION.pre, query)
    const data = res.data
    if (data) {
      const id = data.id
      const row = await this.info(id, typeid)
      return row
    } else {
      return false
    }
  },

  // 作废单据
  async voidCase(id, newval) {
    // 加入备注信息
    let res2 = { code: 0, message: '操作失败' }
    let query = { id: id, value: newval, note: '' }
    if (newval === 1) {
      // 弹框提醒
      try {
        const rtdata = await MessageBox.prompt('请填写作废理由', '作废单据', {
          confirmButtonText: '作废',
          cancelButtonText: '取消',
          inputValidator: (res) => {
            if (!res || res.length < 1) {
              return '作废理由不能为空！'
            }
            return true
          }
        })
        if (rtdata.action === 'confirm') {
          query.note = rtdata.value
          if (!query.note || query.note === '' || query.note === undefined || query.note === null) {
            // MessageBox.alert('作废理由不能为空！')
            res2.code = 0
            res2.message = '作废理由不能为空！'
            return res2
          }
        }
      } catch (e) {
        // 错误
        res2.code = 0
        res2.message = '取消操作'
        return res2
      }
    }

    // return res2

    const res = await postdata(this.ACTION.voidcase, query)
    return res
  },
  // 作废款项入账
  async voidCasebill(id, newval) {
    // 加入备注信息
    let res2 = { code: 0, message: '操作失败' }
    let query = { id: id, value: newval, typeid: 401, note: '' }
    if (newval === 1) {
      // 弹框提醒
      try {
        const rtdata = await MessageBox.prompt('请填写作废理由', '作废单据', {
          confirmButtonText: '作废',
          cancelButtonText: '取消',
          inputValidator: (res) => {
            if (!res || res.length < 1) {
              return '作废理由不能为空！'
            }
            return true
          }
        })
        if (rtdata.action === 'confirm') {
          query.note = rtdata.value
          if (!query.note || query.note === '' || query.note === undefined || query.note === null) {
            // MessageBox.alert('作废理由不能为空！')
            res2.code = 0
            res2.message = '作废理由不能为空！'
            return res2
          }
        }
      } catch (e) {
        // 错误
        res2.code = 0
        res2.message = '取消操作'
        return res2
      }
    }
    // const query = { id: id, value: newval, typeid: 401 }
    const res = await postdata(this.ACTION.voidcase, query)
    return res
  },

  /**
   * 保存案款数据
   * @param {int} id
   * @param {*} data
   * @returns
   */
  async saveCase(id, data) {
    let query = data
    data['id'] = id
    const res = await postdata(this.ACTION.save, query)
    return res
  },
  /**
   * 新增案款数据
   * @param {*} data
   */
  async addCase(data) {
    const query = data
    // 保存信息
    const res = await postdata(this.ACTION.add, query)
    if (res.code === 20000) {
      // 保存成功才存单据号
      // console.log('addCase', data)
      let typeid = data['typeid']
      if (typeid === 102) {
        typeid = 101 // 代管款保证金共用单据号段
      }
      if (typeid === 111) {
        typeid = 103
      }
      const billno = data['billno']
      // 保存当前单据号
      base.saveLocalBillno(typeid, billno)
    }
    return res
  },
  async getNewCode(typeid) {
    let newtypeid = typeid
    // 保证金与代管款同票据
    if (typeid === 102) {
      newtypeid = 101
    }
    // 监狱罚没和罚没款同票据
    // if (typeid === 111) {
    //   newtypeid = 103
    // }

    // 如果是款项入账，则单据号取当前登录日期做递增
    if (typeid === 401 || typeid === 121) {
      const logindate = base.getLogindate()
      const query = { typeid: typeid, operdate: logindate }
      const res = await postdata(this.ACTION.newcode, query)
      return res.data
    }
    console.log('casesk/getNewCode', typeid,newtypeid)
    const localbillno = base.getBillno(newtypeid)
    const key_billnotype = 'billno_typefrom_'+newtypeid;
    const billtype = store.get(key_billnotype) // 默认为或 local，如果所有人共用号码，则取 fromall

    console.log("billtype",billtype);

    if(billtype === 'fromall'){

      const query = { typeid: typeid }
      const res = await postdata(this.ACTION.getNewBillnoByLast, query)
      return res.data
    }else{
      if (localbillno ) {
        // 自增长+1
        const newcode = await base.newcode(localbillno)
        return newcode
      } else {
        const query = { typeid: typeid }
        const res = await postdata(this.ACTION.newcode, query)
        return res.data
      }
    }
    
  },

  /**
   * 检查通知书是否已使用过
   * @param {int} typeid
   * @param {string} noticenum
   * @returns
   */
  async checkNotice(typeid, noticenum) {
    // console.log('casesk/checkNotice')
    const query = { typeid: typeid, noticenum: noticenum }
    const res = await postdata(this.ACTION.checknotice, query)
    return res.data
  },

  /**
   * 根据单据号获取收退列表
   * @param {*} typeid
   * @param {*} billno
   * @returns
   */
  async getStList_by_billno(typeid, billno) {
    const query = { typeid: typeid, billno: billno }
    const res = await postdata(this.ACTION.billstlist, query)
    return res.data
  },

  /**
   * 根据案号获取收退列表
   * @param {*} typeid
   * @param {*} caseyear
   * @param {*} casetype
   * @param {*} casenum
   * @returns
   */
  async getStList_by_caseinfo(typeid, caseyear, casetype, casenum, page, pagesize) {
    const query = { typeid: typeid, caseyear: caseyear, casetype: casetype, casenum: casenum, page: page, pagesize: pagesize }
    const res = await postdata(this.ACTION.casestlist, query)
    return res.data
  },

  /**
   * 获取认领情况
   * @param {string} billno
   * @returns
   */
  async getClaimInfo(billno) {
    const query = { billno: billno }
    const res = await postdata(this.ACTION.claiminfo, query)
    return res.data
  },

  async checkSSfBank(filedata, accountid, datetype, operdate, filename) {
    const query = { data: filedata, accountid: accountid, datetype: datetype, operdate: operdate, filename: filename }
    const res = await postdata(this.ACTION.uploadssf, query)
    return res
  },
  async uploadSSfBank(filedata, accountid, autossf, datetype, operdate, accountid_109, filename) {
    const query = { autossf: autossf, accountid: accountid, data: filedata, datetype: datetype, operdate: operdate, accountid_109: accountid_109, filename: filename }
    const res = await postdata(this.ACTION.uploadssf, query)
    return res
  },

  // 获取非税列表
  async getFsList(query) {
    const res = await postdata(this.ACTION.ssffslist, query)
    return res.data
  },

  // 获取非税文件信息（不导入）
  async getFsInfo(id, filetype) {
    const query = { fileid: id, filetype: filetype, import: 0 }
    const res = await postdata(this.ACTION.ssffsimport, query)
    return res
  },
  // 获取获取监狱罚没信息（不导入）
  async getJailFmkInfo(id, billno, accountid, datetype, operdate, jail) {
    const query = { fileid: id, import: 0, billno: billno, accountid: accountid, datetype: datetype, operdate: operdate, jail: jail }
    const res = await postdata(this.ACTION.fmkimport, query)
    return res
  },
  // 导入获取监狱罚没信息（导入）
  async importJailFmkInfo(id, billno, accountid, datetype, operdate, jail) {
    const query = { fileid: id, import: 1, billno: billno, accountid: accountid, datetype: datetype, operdate: operdate, jail: jail }
    const res = await postdata(this.ACTION.fmkimport, query)
    return res
  },

  // 导入数据
  async importFsInfo(id, filetype) {
    const query = { fileid: id, filetype: filetype, import: 1 }
    const res = await postdata(this.ACTION.ssffsimport, query)
    return res
  },

  // 根据单据号获取单据信息
  async getBillInfo(typeid, billno) {
    const query = { typeid: typeid, billno: billno }
    const res = await postdata(this.ACTION.billInfo, query)
    return res
  },
  async getFmkList(query) {
    const res = await postdata(this.ACTION.fmk_getList, query)
    return res.data
  },
  async getFmkExport(query) {
    const res = await postdata(this.ACTION.fmk_Export, query)
    return res
  },
  async refreshCaseBillInfo(id) {
    const res = await postdata(this.ACTION.casebillRefreshCaseinfo, { id: id })
    return res
  },
  async refreshCaseBillInfo_new(id) {
    const res = await postdata(this.ACTION.casebillRefreshCaseinfo_new, { id: id })
    return res
  },
  async casebill_getbanklist(query) {
    const res = await postdata(this.ACTION.casebill_getbanklist, query)
    return res.data
  },
  async casebill_getbanklist_new(query) {
    const res = await postdata(this.ACTION.casebill_getbanklist_new, query)
    return res.data
  },
  async updateCasebill_caseinfo(query) {
    const res = await postdata(this.ACTION.updateCasebill_caseinfo, query)
    return res
  },
  async updateCasebill_caseinfo_new(query) {
    const res = await postdata(this.ACTION.updateCasebill_caseinfo_new, query)
    return res
  },
  // 获取银行明细
  async getBankMxList(query) {
    const res = await postdata('/casesk/getbankmx', query)
    return res.data
  },

  // 获取银行流水号
  async getBankLshList(query) {
    const res = await postdata(this.ACTION.getbanklsh, query)
    return res.data
  },

  // 非税获取数据
  async ssfnotax_getdata(fileid, filetype) {
    const query = { fileid: fileid, filetype: filetype }
    const res = await postdata(this.ACTION.ssfnotax_getdata, query)
    return res.data
  },

  async ssfnotax_importdata(data) {
    const res = await postdata(this.ACTION.ssfnotax_importdata, { data: data })
    return res.data
  },
  // 做入库操作
  async setFsStatus(query) {
    const res = await postdata('/casesk/setFsStatus', query)
    return res
  },

  // 获取诉讼费电子票据信息
  async getSsfBill(billno) {
    const res = await postdata('/casesk/getssfpj', { billno: billno })
    return res.data
  },

  // 变更款项收退款方式
  async changeBillAccount(typeid, id, accountid) {
    // 增加提示
    try {
      const rtdata = await MessageBox.confirm('您确定要变更收退款方式吗？', '操作提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'

      })
      if (rtdata === 'confirm') {
        const param = { typeid: typeid, id: id, accountid: accountid }
        const res = await postdata(this.ACTION.changeaccount, param)
        MessageBox.alert('操作完成！')
        return res.data
      }
    } catch (e) {
      // 错误
      return
    }
  },

  // 罚没款获取上传文件数据
  async casebillfmk_getdata(param) {
    // const param = { fileid: fileid }
    const res = await postdata(this.ACTION.casebillfmk_getdata, param)
    return res.data
  },
  // 罚没款上传数据
  async casebillfmk_importdata(query) {
    const res = await postdata(this.ACTION.casebillfmk_importdata, query)
    return res.data
  },

  // 获取罚没款认领的信息，并判断是否允许
  async casebillfmk_getinfo(query) {
    const res = await postdata(this.ACTION.casebillfmk_getinfo, query)
    return res
  },

  /**
   * 获取案件基本信息
   * @param {*} caseyear
   * @param {*} casetype
   * @param {*} casenum
   * @returns
   */
  async getajjbxx(caseyear, casetype, casenum) {
    const query = { caseyear: caseyear, casetype: casetype, casenum: casenum }
    const res = await postdata(this.ACTION.getajjbxx, query)
    return res.data
  },

  // 保存批量生成的款项入账数据
  async saveCasebillByBanklsh(query) {
    const res = await postdata('/casesk/saveCasebillByBanklsh', query)
    return res
  },
  async fmk_getfiletype() {
    const res = await postdata(this.ACTION.fmk_getfiletype)
    return res.data
  },
  async voidbill(query) {
    const res = await postdata(this.ACTION.voidcase, query)
    return res
  },

  // 非税获取数据
  async gksk_getdata(fileid) {
    const query = { fileid: fileid }
    const res = await postdata(this.ACTION.gksk_getdata, query)
    return res.data
  },

  async gksk_importdata(param) {
    const res = await postdata(this.ACTION.gksk_importdata, param)
    return res
  },
  async BatchDelJailfmk(param) {
    const res = await postdata(this.ACTION.BatchDelJailfmk, param)
    return res.data
  },
  async getNewBillnoByLast(param) {
    const res = await postdata(this.ACTION.getNewBillnoByLast, param)
    return res.data
  }
}

export default obj
