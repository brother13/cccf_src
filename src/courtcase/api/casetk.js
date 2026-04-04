/* jshint esversion: 8 */

/**
 * 退款相关操作
 */
import {
  postdata
} from './common'
import {
  MessageBox
} from 'element-ui'
import base from './basedata'

var obj = {
  ACTION: {

    list: '/casetk/list',
    info: '/casetk/info',
    next: '/casetk/next',
    pre: '/casetk/pre',
    voidcase: '/casetk/void',
    save: '/casetk/save',
    add: '/casetk/add',
    newcode: '/casetk/newcode',
    checknotice: '/casetk/checknotice',
    checkye: '/casetk/checkye',
    getskinfo: '/casetk/getskinfo',
    ssftklist: '/casetk/ssftklist',
    exportlist: '/casetk/exportlist',
    getssftkfile: '/casetk/getssftkfile',
    checkssfexport: '/casetk/checkssfexport',
    // 退票操作
    billtp: '/casetk/billtp',
    // 获取退票理由（最新的10个）
    tpreason: '/casetk/tpreason',

    // 获取退款可网银支付的数据
    ExportBank_getList: '/export/exportbank_list',
    // 测试用，清除状态
    ExportBank_clearStatus: '/export/exportbank_clear',
    // 导出数据
    ExportBank_getData: '/export/exportbank_getdata',
    // 获取可用银行接口
    ExportBank_getBankType: '/export/banktypeList',
    // 获取可用单据类型
    ExportBank_typeList: '/export/typeList',
    // 导出数据
    ExportBank_export: '/export/export',

    // 不明款上缴信息
    // 不明款上缴列表
    CasebillUpload_getList: '/casetk/casebilluploadList',
    // 获取上缴日期
    CasebillUpload_uploaddate: '/casetk/casebillupdate',

    // 获取备用金余额
    pettyye: '/casetk/pettyye',

    // 设置出账状态
    setTkCheckStatus: '/casetk/setTkCheckStatus',

    checkSSfSTinfo: '/casetk/checkSSfSTinfo',

    // 检查最近的退款情况
    checkLastTkJe: '/casetk/checkLastTkJe',

    // 检查诉讼费单据号退款情况
    checkSsfBill: '/casetk/checkSsfBill',

    // 获取诉讼费排除清单

    ssf_exclude: '/casetk/ssf_exclude',

    // 检查退库文件信息

    checkSSfTkFile: '/import/checkSSfTkFile',

    // 获取诉讼费备用金文件列表
    getSSF_ExportList: '/casetk/getSSF_ExportList',

    // 下载文件
    getSSF_downfile: '/casetk/getSSF_downfile',

    // 以下是国库操作

    // 根据收据号获取收款信息
    gk_getskinfo: '/casetk/gk_getskinfo',
    // 根据案号获取收款列表
    gk_getskListByCaseinfo: '/casetk/gk_getskListByCaseinfo',

    // 获取案件编号（移送诉讼费用）
    getNewCaseNum: '/casetk/getNewCaseNum',

    checkBankTp: '/casetk/checkBankTp',

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
    const res = await postdata('/casetk/list', query)
    return res.data
  },
  /**
   * 获取单据信息
   * @param {int} id 单据ID
   * @param {int} typeid  单据类型
   * @returns
   */
  async info(id, typeid) {
    const query = {
      id: id,
      typeid: typeid
    }
    const res = await postdata(this.ACTION.info, query)
    return res.data
  },
  async getInfoByDjcode(djcode, typeid) {
    const query = {
      djcode: djcode,
      typeid: typeid
    }
    const res = await postdata(this.ACTION.list, query)
    const data = res.data
    if (data.total > 0) {
      return data.items[0]
    } else {
      return null
    }
  },
  // 下一张
  async getNext(billno, typeid) {
    const query = {
      billno: billno,
      typeid: typeid
    }
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
    const query = {
      billno: billno,
      typeid: typeid
    }
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
    // const query = { id: id, value: newval }
    // 加入备注信息
    let res2 = {
      code: 0,
      message: '操作失败'
    }
    let query = {
      id: id,
      value: newval,
      note: ''
    }
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

    const res = await postdata(this.ACTION.voidcase, query)
    return res
  },
  // 作废操作
  async voidtk(id, note) {
    let query = {
      id: id,
      value: 1,
      note: note
    }
    const res = await postdata(this.ACTION.voidcase, query)

    return res;
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
    const res = await postdata(this.ACTION.add, query)
    const billno = data['billno']
    const typeid = data['typeid']
    // 保存当前单据号
    base.saveLocalBillno(typeid, billno)

    return res
  },
  async getNewCode_bak(typeid) {
    const query = {
      typeid: typeid
    }
    const res = await postdata(this.ACTION.newcode, query)
    return res.data
  },

  async getNewCode(typeid) {
    let newtypeid = typeid

    const localbillno = base.getBillno(newtypeid)
    if (localbillno) {
      // 自增长+1
      const newcode = await base.newcode(localbillno)
      return newcode
    } else {
      const query = {
        typeid: typeid
      }
      const res = await postdata(this.ACTION.newcode, query)
      return res.data
    }
  },

  /**
   * 检查通知书是否已使用过
   * @param {int} typeid
   * @param {string} noticenum
   * @returns
   */
  async checkNotice(typeid, noticenum) {
    const query = {
      typeid: typeid,
      noticenum: noticenum
    }
    const res = await postdata(this.ACTION.checknotice, query)
    return res.data
  },

  /**
   * 检测退款的余额情况（排除自身的金额）
   * @param {*} billno
   * @param {*} typeid
   * @param {*} id
   * @returns
   */
  async checkYe(billno, typeid, id) {
    const query = {
      typeid: typeid,
      id: id,
      billno: billno
    }
    const res = await postdata(this.ACTION.checkye, query)
    return res
  },

  /**
   * 获取收款的数据
   * @param {*} billno
   * @param {*} typeid
   * @returns
   */
  async getSK(billno, typeid) {
    const query = {
      typeid: typeid,
      billno: billno
    }
    const res = await postdata(this.ACTION.getskinfo, query)
    return res
  },

  /**
   * 获取诉讼费退库申请单数据
   * @param {object}} query
   * @returns object
   */
  async getSsfTkList(query) {
    const res = await postdata(this.ACTION.ssftklist, query)
    return res.data
  },
  async checkssfexport(query) {
    const res = await postdata(this.ACTION.checkssfexport, query)
    return res.data
  },
  async getSsfTkFile(query) {
    const res = await postdata(this.ACTION.getssftkfile, query)
    return res
  },
  async getExportList(query) {
    const res = await postdata(this.ACTION.exportlist, query)
    return res.data
  },

  /**
   * 操作退票
   * @param {*} typeid
   * @param {*} id
   * @returns
   */
  async billTP(typeid, id, tpreason, tpdate, tpbankbillno) {
    const query = {
      typeid: typeid,
      id: id,
      tpreason: tpreason,
      tpdate: tpdate,
      tpbankbillno: tpbankbillno
    }
    const res = await postdata(this.ACTION.billtp, query)
    return res
  },
  async getTpReason() {
    const query = {
      page: 1,
      pagesize: 10
    }
    const res = await postdata(this.ACTION.tpreason, query)
    return res.data
  },
  // 获取能够导出的退款数据清单
  async getExportCaseList(query) {
    const res = await postdata(this.ACTION.ExportBank_getList, query)
    return res.data
  },
  // 清除导出日志（调试时启用）
  async clearExportBankStatus(idarr) {
    const query = {
      id: idarr
    }
    const res = await postdata(this.ACTION.ExportBank_clearStatus, query)
    return res.data
  },
  /**
   * 获取 可用的银行接口类型
   * @returns
   */
  async ExportBank_getBankType() {
    const res = await postdata(this.ACTION.ExportBank_getBankType)
    return res.data
  },
  async ExportBank_getTypeList() {
    const res = await postdata(this.ACTION.ExportBank_typeList)
    return res.data
  },

  /**
   * 导出数据
   * @param {string} bankcode
   * @param {*} id
   * @returns
   */
  async ExportBank_getFile(bankcode, id,param) {
    const query = {
      bankcode: bankcode,
      id: id,
      query:param
    }
    const res = await postdata(this.ACTION.ExportBank_export, query)
    return res
  },

  // 获取不明款上缴的列表
  async casebillUpload_getList(query) {
    const res = await postdata(this.ACTION.CasebillUpload_getList, query)
    return res.data
  },
  async casebillUpload_getdate() {
    const res = await postdata(this.ACTION.CasebillUpload_uploaddate)
    return res.data
  },

  // 获取诉讼费备用金余额
  async getSSF_Pettyye(endtime) {
    const query = {
      enddate: endtime
    }
    const res = await postdata(this.ACTION.pettyye, query)
    return res.data
  },
  // 设置出账状态
  async setTkCheckStatus(query) {
    const res = await postdata(this.ACTION.setTkCheckStatus, query)
    return res
  },
  async checkSSfSTinfo(query) {
    const res = await postdata(this.ACTION.checkSSfSTinfo, query)
    return res.data
  },
  // 检查近期退款情况
  async checkLastTkJe(query) {
    const res = await postdata(this.ACTION.checkLastTkJe, query)
    return res.data
  },
  // 获取诉讼费当前单据号已发生的退款数据，排除自己
  async checkSsfBill(billno, id) {
    const query = {
      billno: billno,
      id: id
    }
    const res = await postdata(this.ACTION.checkSsfBill, query)
    return res.data
  },

  // 做排除数据的管理
  async ssf_exclude(action, id) {
    const query = {
      action: action,
      id: id
    }
    const res = await postdata(this.ACTION.ssf_exclude, query)
    return res.data
  },
  // 检查并判断退库申请单数据

  async checkSSfTkFile(filename, filedata, update = false) {
    const param = {
      filename: filename,
      data: filedata,
      update: update
    }
    const res = await postdata(this.ACTION.checkSSfTkFile, param)
    return res.data
  },

  // 获取已经生成的备用金的文件列表
  async getSSF_ExportList(param) {
    const res = await postdata(this.ACTION.getSSF_ExportList, param)
    return res.data
  },
  // 下载文件
  async getSSF_downfile(fileid) {
    const param = {
      fileid: fileid
    }
    const res = await postdata(this.ACTION.getSSF_downfile, param)
    return res.data
  },
  async gk_getskinfo(param) {
    const res = await postdata(this.ACTION.gk_getskinfo, param)
    return res
  },
  async gk_getskListByCaseinfo(param) {
    const res = await postdata(this.ACTION.gk_getskListByCaseinfo, param)
    return res.data
  },

  async getNewCaseNum(param) {
    const res = await postdata(this.ACTION.getNewCaseNum, param)
    return res.data
  },

  // 检查是否有退票
  async checkBankTp(param) {
    const res = await postdata(this.ACTION.checkBankTp, param)
    return res.data
  },

  async checkBanktpInfo(param) {
    const dwname = param.dwname;
    const bankaccount = param.bankaccount;
    const bankname = param.bankname;

    // if (!dwname && !bankaccount && !bankname) {
    //   return false; // 没有内容，直接返回
    // }

    let typeid = param.typeid;
    let newtypeid = typeid;
    let frombill = param.frombill||'';

    switch(typeid){
      case 101:
        newtypeid = 203;
        frombill = param.billno||'';
        break;
      case 104:
      case 109:
        newtypeid = 201;
        frombill = param.billno||'';
        break;
    }

    const query = {
      dwname: dwname,
      bankaccount: bankaccount,
      bankname: bankname,
      frombill: frombill,
      typeid: newtypeid
    }



    const res = await this.checkBankTp(query);
    const items = res.items;
    const items_bill = res.items_bill;
    let text = "";

    const total = res.total || 0;
    const total_bill = res.total_bill || 0;





    if (total + total_bill < 1) {
      return true;
    }


    // 判断是否存在单据号有发生过退票
    // 判断是否有单据的退票记录
    if (total_bill > 0) {
      // text = "";
      const row = items_bill[0];
      const tpreason = row.tpreason;
      const tpdate = row.tpdate;
      text += `当前单据号【${frombill}】在【${tpdate}】有退票记录，退票理由是：${tpreason}。<br>`;
      // await this.$alert(text);
      // return false;

    }


    if (total > 0) {
      text += `当前账号【${dwname}  ${bankaccount}】有 ${total} 条退票记录。`;

      text += '<ul>'

      // 如果存在多条，则提示第一次
      for (let i = 0; i < items.length; i++) {
        if (i > 2) { // 最多显示三条
          break;
        }
        const row = items[i];
        const tpdate = row.tpdate;
        const tpreason = row.tpreason;
        const rowbankname = row.bankname;
        text += `<li>${tpdate}发生退票，理由：${tpreason}，开户行：${rowbankname}</li>`

      }
      text += "</ul>";
    }



    MessageBox.alert(text, '退票提醒', {
      confirmButtonText: '确定',
      type: 'warning',
      dangerouslyUseHTMLString: true,
      callback: action => {
        // this.$message({
        //   type: 'info',
        //   message: `action: ${action}`
        // })
      }
    })


  }
}

export default obj
