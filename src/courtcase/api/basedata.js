/* jshint esversion: 8 */

/**
 * 审判动态报表相关信息
 */
import {
  postdata
} from './common'
import store from './store'
import util from './util'
import { MessageBox } from 'element-ui'

var basedata = {
  ACTION: {

    list: '/data/list',
    userlist: '/user/list',
    fylist: '/court/list',
    othercasetype: '/casetype/otherlist',
    getexportType: '/export/typeList',
    getexportBank: '/export/banktypeList',
    getclass: '/class/list',
    getBasedata: '/data/basedata',
    newcode: '/casesk/getNextBill'

  },
  typeList: {
    casetype: 'casetype',
    casetypeclass: 'casetypeclass',
    deptlist: 'deptlist',
    cardtype: 'cardtype',
    tpreason: 'tpreason',
    currency: 'currency'

  },
  async getClassList(type) {
    const param = {
      classtype: type
    }
    const res = await postdata(this.ACTION.getclass, param)
    return res.data
  },
  async getList(type) {
    const param = {
      type: type,
      pagesize: 999
    }
    const res = await postdata(this.ACTION.list, param)
    return res.data
  },
  async getBasedata(type) {
    const param = {
      type: type,
      pagesize: 999
    }
    const res = await postdata(this.ACTION.getBasedata, param)
    return res.data
  },
  async getUserList() {
    // const param = { page: 1, pagesize: 9999 }
    const param = { page: 1, pagesize: 9999, usertype: ['cw', 'cwkld'] }

    const res = await postdata(this.ACTION.userlist, param)
    return res.data.items
  },
  async getCbrList() {
    // const param = { page: 1, pagesize: 9999 }
    const param = { page: 1, pagesize: 9999, usertype: ['cbr', 'yz'] }

    const res = await postdata(this.ACTION.userlist, param)
    return res.data.items
  },
  async getYearList() {
    const todayYear = new Date().getFullYear() + 2 // 今年加2年
    const yearList = []
    yearList.push(null)

    for (let i = todayYear; i >= 1990; i--) {
      yearList.push(i)
    }
    return yearList
  },

  /**
   * 获取日期快速选择的列表
   */
  getDateRangeList() {
    const alloption = []
    alloption.push({
      label: '今天',
      value: 'today'
    })
    alloption.push({
      label: '昨天',
      value: 'yesterday'
    })
    alloption.push({
      label: '本周',
      value: 'thisweek'
    })
    alloption.push({
      label: '7天内',
      value: 'last7day'
    })
    alloption.push({
      label: '本月',
      value: 'thismonth'
    })
    alloption.push({
      label: '本年',
      value: 'thisyear'
    })
    alloption.push({
      label: '上周',
      value: 'lastweek'
    })
    alloption.push({
      label: '上月',
      value: 'lastmonth'
    })
    alloption.push({
      label: '去年',
      value: 'lastyear'
    })
    alloption.push({
      label: '全部',
      value: 'all'
    })

    return alloption
  },
  /**
   * 根据传入的类型，获取时间范围
   * @param {*} type
   */
  getDateRange(type) {
    const data = {
      starttime: '',
      endtime: ''
    }
    let today = new Date()
    // 基准日期改成登录日期
    const logindate = this.getLogindate()
    today = new Date(logindate)
    if (type === 'today') {
      const sd = this.formatDate(today)
      data.starttime = sd
      data.endtime = sd
    }
    if (type === 'thisweek') {
      let day = today.getDay()
      if (day === 0) {
        day = 7
      }
      const startdate = new Date(today - (day - 1) * 86400000)
      // console.log(startdate)
      data.starttime = this.formatDate(startdate)
      data.endtime = this.formatDate(new Date(today - (day - 7) * 86400000))
    }
    if (type === 'thismonth') {
      data.starttime = this.formatDate(today, '{yyyy}-{mm}-01')
      data.endtime = this.formatDate(today)
    }
    if (type === 'thisyear') {
      data.starttime = this.formatDate(today, '{yyyy}-01-01')
      data.endtime = this.formatDate(today, '{yyyy}-12-31')
    }

    if (type === 'lastweek') {
      let day = today.getDay()
      if (day === 0) {
        day = 7
      }
      const startdate = new Date(today - (day + 6) * 86400000)
      data.starttime = this.formatDate(startdate)
      data.endtime = this.formatDate(new Date(today - (day) * 86400000))
    }
    if (type === 'last7day') {
      const startdate = new Date(today - 7 * 86400000)
      data.starttime = this.formatDate(startdate)
      data.endtime = this.formatDate(today)
    }

    if (type === 'lastmonth') {
      // const month = today.getMonth()
      // const year = today.getFullYear()
      const day = today.getDate()
      // const num = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      // let dayadd = num[month]
      // if (year % 4 === 0 && dayadd === 28) {
      //   if (year % 100 !== 0) {
      //     dayadd = 29
      //   } else if (year % 100 === 0 && year % 400 === 0) {
      //     dayadd = 29
      //   } // 闰年
      // }
      // const startdate = new Date(today - dayadd * 86400000)
      const startdate = new Date(today - day * 86400000)
      data.starttime = this.formatDate(startdate, '{yyyy}-{mm}-01')

      const tempstart = new Date(this.formatDate(today, '{yyyy}/{mm}/01')) // 默认的date只认 年日月格式
      const enddate = new Date(tempstart - 86400000)
      data.endtime = this.formatDate(enddate)
    }
    if (type === 'lastyear') {
      const startdate = new Date(today - 365 * 86400000)
      data.starttime = this.formatDate(startdate, '{yyyy}-01-01')
      data.endtime = this.formatDate(startdate, '{yyyy}-12-31')
    }
    if (type === 'yesterday') {
      // 昨天
      const startdate = new Date(today - 1 * 86400000)
      const sd = this.formatDate(startdate)
      data.starttime = sd
      data.endtime = sd
    }
    // 所有
    if (type === 'all') {
      data.starttime = ''
      // data.endtime = this.formatDate(today)
      data.endtime = ''
    }

    return data
  },

  formatDate(today, format_str) {
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const hour = today.getHours() // 得到小时数
    const minute = today.getMinutes() // 得到分钟数
    const second = today.getSeconds() // 得到秒数
    const format = []
    format.push({
      text: 'yyyy',
      value: year
    })
    format.push({
      text: 'mm',
      value: month
    })
    format.push({
      text: 'dd',
      value: day
    })
    format.push({
      text: 'hh',
      value: hour
    })
    format.push({
      text: 'min',
      value: minute
    })
    format.push({
      text: 'ss',
      value: second
    })

    let formatstr = '{yyyy}-{mm}-{dd}'
    if (format_str) {
      formatstr = format_str
    }
    for (var i = 0; i < format.length; i++) {
      const f = format[i]
      let v = f.value
      const l = '{' + f.text + '}'
      if (v < 10) {
        v = '0' + v
      }
      formatstr = formatstr.replace(l, v)
    }

    return formatstr
  },

  /**
   * 获得法院列表
   * @returns array
   */
  async getFyList() {
    const param = { page: 1, pagesize: 9999 }
    const res = await postdata(this.ACTION.fylist, param)
    return res.data.items
  },

  /**
   *
   * @param {*} fycode
   * @param {*} keyword
   * @param {*} page
   * @param {*} pagesize
   * @returns
   */
  async getOtherCaseTypeList(fycode, keyword, page, pagesize) {
    const param = { fycode: fycode, keyword: keyword, page: page, pagesize: pagesize }
    const res = await postdata(this.ACTION.othercasetype, param)
    return res.data
  },
  // 配置一些常用配置，方便修改，改用异步方式，便于以后修改为服务器端配置

  async getBillConfig() {
    const config = {
      noticeDuplicate: false, // 允许重复使用通知书号
      jumpToDetail: true, // 点击收退跳转时，是否直接跳至明细编辑页面，而非列表
      createNewAfterPrint: true, // 打印之后自动创建新单据
      defaultPagesize: 10, // 默认分页大小
      ExportConfirmNum: 5000, // 如果导出数据的数量超过5000,则做提示后再导出
      defaultDateRange: 'last7day', // last7day默认日期范围，为空是不选择，默认最近7天
      exportConfirm: true, // 导出列表数据前是否需要确认
      doublePageNav: true, // 是否表格前面也加翻页
      pageAutoCreate: false, // 进入单据之后，是否自动跳转到新增界面
      autoPrint: true, // 如果只有一个打印模板，是否自动打印，不做预览
      tkConfirmMoney: 1000000, // 退款时如果金额超过100万做提醒。如果是0则不做提醒
      fieldReadonly: ['je', 'noticenum', 'frombill', 'dwname', 'bankaccount', 'caseyear', 'casetype', 'casenum'] // 导入通知书号之后禁止修改的字段

    }
    return config
  },

  // 获得作废状态（已退票等）
  getVoidStatusList(typeid) {
    // console.log('getVoidStatusList', typeid)
    const result = []

    result.push({ id: 1, label: '正常状态', value: '0' })
    result.push({ id: 2, label: '已作废单据', value: '1' })
    if (typeid > 200 && typeid < 300) {
      result.push({ id: 4, label: '已退票', value: '2' })
    }
    result.push({ id: 3, label: '所有状态', value: '' })

    return result
  },
  async getTpReasonList() {
    return this.getList(this.typeList.tpreason)
  },

  async getExportBankList() {
    const res = await postdata(this.ACTION.getexportType)
    return res.data
  },
  async getExportTypeList() {
    const res = await postdata(this.ACTION.getexportType)
    return res.data
  },
  // 将当前的单据号保存在本地缓存中
  saveLocalBillno(typeid, billno) {
    // 保存当前单据的单据号
    const key = 'billno_type' + typeid
    store.set(key, billno)
  },
  // 获取缓存单据号
  getBillno(typeid) {
    const key = 'billno_type' + typeid
    const billno = store.get(key)
    return billno
  },
  // 生成下一个单据号
  async newcode(code) {
    const query = { billno: code }
    const res = await postdata(this.ACTION.newcode, query)
    return res.data
  },

  // 获取登录日期
  getLogindate() {
    const key = 'logindate'
    let logindate = store.Session_get(key)
    if (!logindate || logindate == null) {
      logindate = this.formatDate(new Date(), '{yyyy}-{mm}-{dd}')
    }
    return logindate
  },
  setLogindate(today) {
    const key = 'logindate'
    store.Session_set(key, today)
  },
  // 设置快速搜索的时间段
  setFilterDateRange(typeid, daterange) {
    const key = 'filter_date_' + typeid
    store.set(key, daterange)
  },
  // 获取快速搜索的时间段
  getFilterDateRange(typeid) {
    const key = 'filter_date_' + typeid
    let daterange = store.get(key)
    if (!daterange || daterange == null) {
      daterange = 'last7day'
    }
    return daterange
  },
  // 检查并更新当前登录日期
  checkLogindate() {
    // const logindate = this.getLogindate()
    // const today = this.formatDate(new Date(), '{yyyy}-{mm}-{dd}')
    // console.log(logindate)
    // console.log(today)
  },
  today() {
    return this.formatDate(
      new Date(),
      '{yyyy}-{mm}-{dd}'
    )
  },
  formatNumber(num) {
    return util.number_format(num, 2)
  },
  async checkMaxJe(je) {
    const config = await this.getBillConfig()

    if (config && config.tkConfirmMoney && je > config.tkConfirmMoney) {
      const str = '本单据退款金额【' + this.formatNumber(je) + '元】，已超过警示金额【' + this.formatNumber(config.tkConfirmMoney) + '元】，请检查是否有分管院领导签字'
      MessageBox.alert(str)
    }
  },

  getFmkTypeList() {
    const fmktypeList = [
      { label: '罚金' },
      { label: '没收款' },
      { label: '收缴款' },
      { label: '多项组合' }
    ]
    return fmktypeList
  }

}

export default basedata
