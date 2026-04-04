/* jshint esversion: 8 */

/**
 * 审判动态报表相关信息
 */
import store from './store'
import {
  postdata
} from './common'

var report = {
  ACTION: {

    data: '/report/data',
    list: '/report/list',
    lastnote: '/report/lastnote',
    casebill: '/report/casebill',

    // 代管款余额情况表
    caseye: '/report/caseye',
    // 获取案件收退明细表（根据案号或收据号）
    getstlist: '/report/stlist',

    caseye_billno: '/report/djyebybill', // 根据单据号汇总单据余额
    caseye_billno_warning: '/report/djyebybill_warning', // 根据单据号汇总单据余额

    caseye_billno_count: '/report/djyebybill_count', // 根据单据号汇总单据余额并根据部门汇总
    caseye_billno_count_warning: '/report/djyebybill_count_warning', // 根据单据号汇总单据余额并根据部门汇总

    caseye_caseinfo: '/report/djyebycase', // 根据案号汇总单据余额
    sklist: '/report/sklist',
    tklist: '/report/tklist',
    

    oldcase: '/report/oldcase', // 获取五年上缴案件列表
    casebill_flashye: '/report/casebill_createtemp',

    caseye_fleshye: '/report/djyebybill_fleshdata',

    caseye_bycase_fleshye: '/report/djyebycase_fleshdata',

    // 闵行法院高级统计报表
    casebill_adv_report: '/report/report_adv_casebill',

    // 闵行法院 代管款高级统计报表
    // report_adv_caseyebill: '/report/report_adv_caseyebill',
    report_adv_caseyebill: '/report/dgk_report_getList',

    // 代管款，计算余额，共分2步
    dgk_report_createtemp: '/report/dgk_report_createtemp', // 计算余额

    // 闵行法院 不明款项分步计算
    report_adv_casebill_step: '/report/report_adv_casebill_step',
    // 获取时间
    report_adv_casebill_gettime: '/report/report_adv_casebill_gettime',

    // 代管款列表，刷新指定时间 内的部门数据
    dgk_report_updateNullDept: '/report/dgk_report_updateNullDept',

    // 代管款分类总账相关api

    report_casebill_CasebillByDept: '/report/CasebillByDept',
    report_casebill_CasebillByDept_cbr: '/report/CasebillByDept_cbr',

    // 获取excel
    report_casebill_days_ByDept_exportExcel: '/report/report_Casebill_days_ByDept_exportExcel',

    report_casebill_getList: '/report/report_casebill_getList', // 获取列表

    report_casebill_getendtime: '/report/report_casebill_getendtime', // 获取时间

    // 刷新记录
    advcasebill_updateCaseByBankzh: '/report/advcasebill_updateCaseByBankzh',

    advcasebill_updatecbrinfo: '/report/advcasebill_updatecbrinfo',

    // 代管款刷新部门
    dgk_report_updateDeptBycbr: '/report/dgk_report_updateDeptBycbr',

    dgk_report_getList_detail: '/report/dgk_report_getList_detail',

    // 根据案号匹配当事人和承办人
    update_report_deptcbr_bycaseinfo: '/report/dgk_report_update_deptcbr_bycaseinfo',

    report_advcasebill2_getcount: '/report/report_advcasebill2_getcount',

    // 不明款监管 新 的取数据
    report_advcasebill2_getdata: '/report/report_advcasebill2_getdata',

    // 获取不明款监管的ID数组
    advcasebill_getid: '/report/advcasebill_getid',

    // 创建缓存表

    report_Casebill_createtable: '/report/report_Casebill_createtable',

    // 刷新实时余额

    casebill_temp_updateye3: '/report/casebill_temp_updateye3',

    // 刷新部门信息
    advdgkreport_update_key_caseinfo: '/report/advdgkreport_update_key_caseinfo',
    advdgkreport_update_key_caseinfo_caseye_caseinfo: '/report/advdgkreport_update_key_caseinfo_caseye_caseinfo',

    // 以下是不明款监管部门相关的接口
    advcasebill_dept_config_get: '/report/advcasebill_dept_config_get',
    advcasebill_dept_config_set: '/report/advcasebill_dept_config_set',
    advcasebill_dept_deptlist_get: '/report/advcasebill_dept_deptlist_get',
    advcasebill_dept_deptlist_set: '/report/advcasebill_dept_deptlist_set',

    advdgkreport_update_key_casechange: '/report/advdgkreport_update_key_casechange',


    caseye_getReasonList: '/report/caseye_getReasonList',

    report_dgkye_bybill_view_cbrnum: '/report/report_dgkye_bybill_view_cbrnum',

    casebill_report: '/report/casebill_report',

    report8day_report_casebill_CasebillByDept: '/report/report8day_CasebillByDept',
    report8day_report_casebill_getList: '/report/report8day_report_casebill_getList', // 获取列表
    report8day_report_casebill_days_ByDept_exportExcel: '/report/report8day_report_Casebill_days_ByDept_exportExcel',

    report8day_report_casebill_getendtime: '/report/report8day_report_casebill_getendtime', // 获取时间

  },
  CODE: {
    la: 'lacount',
    ms: 'mscount',
    tj: 'tjcount'
  },
  async getData(code, page, pagesize) {
    const res = await postdata(this.ACTION.data, {
      report: code,
      page: page,
      pagesize: pagesize
    })
    const data = res.data

    if (code === 'mscount' || code === 'tjcount') {
      if (page && pagesize) {
        // let chart = data.chart;
        const title = '(第' + ((page - 1) * pagesize + 1) + '~' + (page * pagesize) + '名)'
        data.chart['title']['text'] = data.chart['title']['text'] + title
      }
      // 设置名称
      const userlist = data['chart']['yAxis']['data']
      page = page ?? 1
      pagesize = pagesize ?? 100
      for (var i = 0; i < userlist.length; i++) {
        let username = userlist[i]
        username = (i + 1 + (page - 1) * pagesize) + '.' + username
        // 再获取结案率
        const caseend = data['data'][i]['col4']
        username += '(' + caseend + '%)'
        data['chart']['yAxis']['data'][i] = username
      }
    }

    return data
  },

  // 获取报表列表
  async getReportList() {
    const res = await postdata(this.ACTION.list)
    return res.data
  },

  async getData_LA() {
    const data = await this.getData(this.CODE.la)

    return data
  },
  async getData_MS(page, pagesize) {
    const data = await this.getData(this.CODE.ms, page, pagesize)

    // 1.调整名称，将姓名加上序号以及结案率
    // 2.如果pagesize和page不为空，则将标题变更为（第1~5名）

    if (page && pagesize) {
      // let chart = data.chart;
      const title = '(第' + ((page - 1) * pagesize + 1) + '~' + (page * pagesize) + '名)'
      data.chart['title']['text'] = data.chart['title']['text'] + title

      // 设置名称
      const userlist = data['chart']['yAxis']['data']
      for (var i = 0; i < userlist.length; i++) {
        let username = userlist[i]
        username = (i + 1 + (page - 1) * pagesize) + '.' + username
        // 再获取结案率
        const caseend = data['data'][i]['col4']
        username += '(' + caseend + '%)'
        data['chart']['yAxis']['data'][i] = username
      }
    }

    return data
  },
  /**
     * 获取最新的备注信息
     * @param {int} id
     * @returns
     */

  async getLastnote(code) {
    const param = { report: code }
    const res = await postdata(this.ACTION.lastnote, param)
    return res.data
  },
  async getCasebillList(query) {
    const res = await postdata(this.ACTION.casebill, query)
    return res.data
  },
  /**
   *  获取代管款余额情况表
   * @param {object} query
   * @returns
   */
  async getCaseYeReport(query) {
    const res = await postdata(this.ACTION.caseye, query)
    return res.data
  },

  /**
   * 根据案号或收据号获取单据的收退明细，条件不足则为空
   * @param {object} query
   * @returns
   */
  async getCaseStList(query) {
    const res = await postdata('/report/stlist', query)
    return res.data
  },

  async getCaseYeBill(query) {
    const res = await postdata(this.ACTION.caseye_billno, query)
    return res.data
  },

  // 求带预警的
  async getCaseYeBill_warning(query) {
    const res = await postdata(this.ACTION.caseye_billno_warning, query)
    return res.data
  },
  async getCaseYeBill_count(query) {
    const res = await postdata(this.ACTION.caseye_billno_count, query)
    return res.data
  },
  async getCaseYeBill_count_warning(query) {
    const res = await postdata(this.ACTION.caseye_billno_count_warning, query)
    return res.data
  },
  async getCaseYeCase(query) {
    const res = await postdata(this.ACTION.caseye_caseinfo, query)
    return res.data
  },
  /**
   *  收款明细表
   * @param {object} query
   * @returns
   */
  async getCaseSkList(query) {
    const res = await postdata('/report/sklist', query)
    return res.data
  },
  async getCaseTkList(query) {
    const res = await postdata('/report/tklist', query)
    return res.data
  },
  // 获取款项入账余额
  async getCasebillCount(query) {
    const res = await postdata('/report/casebillcount', query)
    return res.data
  },

  // 获取收退款明细表
  async getstklist(query) {
    const res = await postdata('/report/stklist', query)
    return res.data
  },

  /**
   * 获取五年上缴的报表数据
   * @param {object} query
   * @returns
   */
  async getOldcaseList(query) {
    // const res = await postdata(this.ACTION.oldcase, query)
    // console.log('function this:', this)
    const action = this ? this.ACTION.oldcase : '/report/oldcase'
    // note: 注意，如果是传址函数调用时，无法读到this.ACTION，且this为空。所以需要判断this是否为空。或者直接把调用接口写成文本而非this.ACTION方式调用

    const res = await postdata(action, query)

    return res.data
  },
  async casebill_flashye(query) {
    const res = await postdata(this.ACTION.casebill_flashye, query)
    return res
  },
  // 代管款刷新余额
  async caseye_fleshye(query) {
    const res = await postdata(this.ACTION.caseye_fleshye, query)
    return res
  },
  async caseye_bycase_fleshye(query) {
    const res = await postdata(this.ACTION.caseye_bycase_fleshye, query)
    return res
  },

  // 闵行法院高级统计报表
  async casebill_adv_report(query) {
    const res = await postdata(this.ACTION.casebill_adv_report, query)
    return res.data
  },
  // 闵行法院高级统计报表 代管款
  async report_adv_caseyebill(query) {
    const res = await postdata(this.ACTION.report_adv_caseyebill, query)
    return res.data
  },
  // 闵行法院高级统计报表
  async report_adv_casebill_step(query) {
    const res = await postdata(this.ACTION.report_adv_casebill_step, query)
    return res.data
  },
  // 闵行法院高级统计报表
  async report_adv_casebill_gettime(query) {
    const res = await postdata(this.ACTION.report_adv_casebill_gettime, query)
    return res.data
  },

  // 生成代管款数据
  async dgk_report_createtemp(query) {
    // const param = { step: step, endtime: endtime }

    const res = await postdata(this.ACTION.dgk_report_createtemp, query)
    return res.data
  },

  async report_dgk_gettime() {
    const res = await postdata('/report/report_dgk_gettime')
    return res.data
  },
  // 刷新代管款指定时间内的空部门数据（根据承办人名称匹配）
  // 需要传入starttime和 endtime 两个字段
  async dgk_report_updateNullDept(param) {
    const res = await postdata(this.ACTION.dgk_report_updateNullDept, param)
    return res.data
  },

  // 未认领代管款账龄分析总表  相关功能
  async report_casebill_CasebillByDept(param) {
    const res = await postdata(this.ACTION.report_casebill_CasebillByDept, param)
    return res.data
  },
  async report_casebill_CasebillByDept_cbr(param) {
    const res = await postdata(this.ACTION.report_casebill_CasebillByDept_cbr, param)
    return res.data
  },
  async advcasebill_updateCaseByBankzh(ids) {
    const param = { id: ids }
    const res = await postdata(this.ACTION.advcasebill_updateCaseByBankzh, param)
    return res.data
  },
  async report_casebill_days_ByDept_exportExcel(param) {
    const res = await postdata(this.ACTION.report_casebill_days_ByDept_exportExcel, param)
    return res.data
  },
  async report_casebill_getList(param) {
    const res = await postdata(this.ACTION.report_casebill_getList, param)
    return res.data
  },
  async report_casebill_getendtime(param) {
    const res = await postdata(this.ACTION.report_casebill_getendtime, param)
    return res.data
  },
  async advcasebill_updatecbrinfo(ids, type) {
    let str = store.get('freshConfig')
    // console.log('config', config)
    let config = { case_zx: 2, case_ms: 1 }
    if (str) {
      try {
        config = JSON.parse(str)
      } catch (e) {
        console.log('default config')
      }
    }

    const param = { id: ids, type: type, config: config }
    const res = await postdata(this.ACTION.advcasebill_updatecbrinfo, param)
    return res.data
  },
  async dgk_report_updateDeptBycbr(step) {
    const param = { step: step }
    const res = await postdata(this.ACTION.dgk_report_updateDeptBycbr, param)
    return res.data
  },
  async dgk_report_getList_detail(param) {
    const res = await postdata(this.ACTION.dgk_report_getList_detail, param)
    return res.data
  },
  async update_report_deptcbr_bycaseinfo(caseinfo) {
    const param = { caseinfo: caseinfo }
    const res = await postdata(this.ACTION.update_report_deptcbr_bycaseinfo, param)
    return res.data
  },
  async report_advcasebill2_getcount(query) {
    const res = await postdata(this.ACTION.report_advcasebill2_getcount, query)
    return res.data
  },
  async report_advcasebill2_getdata(param) {
    const res = await postdata(this.ACTION.report_advcasebill2_getdata, param)
    return res.data
  },
  async advcasebill_getid(param) {
    const res = await postdata(this.ACTION.advcasebill_getid, param)
    return res.data
  },
  async report_Casebill_createtable(param) {
    const res = await postdata(this.ACTION.report_Casebill_createtable, param)
    return res.data
  },
  // 刷新缓存表实时余额

  async casebill_temp_updateye3() {
    const res = await postdata(this.ACTION.casebill_temp_updateye3)
    return res.data
  },

  async advdgkreport_update_key_caseinfo(query) {
    const res = await postdata(this.ACTION.advdgkreport_update_key_caseinfo, query)
    return res.data
  },
  async advdgkreport_update_key_caseinfo_caseye_caseinfo(query) {
    const res = await postdata(this.ACTION.advdgkreport_update_key_caseinfo_caseye_caseinfo, query)
    return res.data
  },
  async advcasebill_dept_config_get() {
    const res = await postdata(this.ACTION.advcasebill_dept_config_get)
    return res.data
  },
  async advcasebill_dept_config_set(param) {
    const res = await postdata(this.ACTION.advcasebill_dept_config_set, param)
    return res.data
  },

  async advcasebill_dept_deptlist_get(param) {
    const res = await postdata(this.ACTION.advcasebill_dept_deptlist_get, param)
    return res.data
  },
  async advcasebill_dept_deptlist_set(param) {
    const res = await postdata(this.ACTION.advcasebill_dept_deptlist_set, param)
    return res.data
  },
  async advdgkreport_update_key_casechange(param) {
    const res = await postdata(this.ACTION.advdgkreport_update_key_casechange, param)
    return res.data
  },
  async caseye_getReasonList(param) {
    const res = await postdata(this.ACTION.caseye_getReasonList, param)
    return res.data
  },
  async report_dgkye_bybill_view_cbrnum(param) {
    const res = await postdata(this.ACTION.report_dgkye_bybill_view_cbrnum, param)
    return res.data
  },
  async casebill_report(param) {
    const res = await postdata(this.ACTION.casebill_report, param)
    return res.data
  },
  async report8day_report_casebill_CasebillByDept(param) {
    const res = await postdata(this.ACTION.report8day_report_casebill_CasebillByDept, param)
    return res.data
  },
  async report8day_report_casebill_getList(param) {
    const res = await postdata(this.ACTION.report8day_report_casebill_getList, param)
    return res.data
  },
  async report8day_report_casebill_days_ByDept_exportExcel(param) {
    const res = await postdata(this.ACTION.report8day_report_casebill_days_ByDept_exportExcel, param)
    return res.data
  },
    async report8day_report_casebill_getendtime(param) {
    const res = await postdata(this.ACTION.report8day_report_casebill_getendtime, param)
    return res.data
  },
}

export default report
