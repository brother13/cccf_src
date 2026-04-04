/* jshint esversion: 8 */

/**
 * 审判动态报表相关信息
 */
import {
  postdata
} from './common'

var basedata = {
  ACTION: {
    info: '/userconfig/info',
    save: '/userconfig/save',
    list: '/userconfig/list',
    accountList: '/account/list',
    dataList: '/data/list',
    account: '/userconfig/account',
    // 诉讼费退库相关接口

    ssftk_field: '/userconfig/ssftk_field',
    ssftk_get: '/userconfig/ssftk_get',
    ssftk_save: '/userconfig/ssftk_save',
    // 通用的代码
    getConfig: '/userconfig/info2',
    saveConfig: '/userconfig/save2',

    ssfpetty_get: '/userconfig/ssfpetty_get',
    ssfpetty_save: '/userconfig/ssfpetty_save',

    // 凭证相关配置
    voucher_get: '/userconfig/voucher_get',
    voucher_save: '/userconfig/voucher_save',

    getConfig_stlist: '/userconfig/getConfig_stlist',

    getConfig_casestk: '/userconfig/getConfig_casestk',


    dgktime_get: '/userconfig/dgktime_get',
    dgktime_set: '/userconfig/dgktime_set'

  },
  configType: {
    account: 'account', // 默认收退款方式,
    ssftk: 'ssftk', // 诉讼费退库配置
    closedate: 'closedate' // 结账日期管理
  },
  /**
   * 获取配置信息
   * @param {string} code
   * @param {integer} userid
   * @returns
   */

  async getList(code, userid) {
    const query = {
      configtype: code,
      userid: userid
    }
    const res = await postdata(this.ACTION.list, query)
    return res.data
  },
  async getInfo(code, userid) {
    const query = {
      code: code,
      userid: userid
    }
    const res = await postdata(this.ACTION.info, query)
    return res.data
  },
  /**
   * 保存配置
   * @param {*} code
   * @param {*} userid
   * @param {*} data
   * @returns
   */
  async saveConfig(code, userid, data) {
    const query = {
      code: code,
      userid: userid,
      detail: data
    }
    const res = await postdata(this.ACTION.save, query)
    return res
  },

  async getAccountList() {
    const res = await postdata(this.ACTION.accountList)
    return res.data.items
  },
  async getTypeList() {
    const res = await postdata(this.ACTION.dataList, {
      type: 'typeid'
    })
    return res.data.items
  },

  async getDefaultAccountId(typeid) {
    const query = {
      configtype: this.configType.account,
      configcode: typeid
    }
    const res = await postdata(this.ACTION.info, query)
    const accountid = res.data - 0
    return accountid
  },

  // 获取
  getAccountInfo(data, typeid) {
    let info = {
      id: 0,
      label: ''
    }
    try {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === typeid) {
          return {
            id: data[i].id,
            label: data[i].accountname
          }
        }
      }
    } catch (e) {
      console.log(e)
    }

    return info
  },
  // 获取用户的账号ID
  getConfigAccountInfo(data, typeid) {
    let id = 0
    try {
      for (let i = 0; i < data.length; i++) {
        if (data[i].configcode === typeid) {
          return data[i]
        }
      }
    } catch (e) {
      console.log(e)
    }

    return id
  },

  /**
   * 获取默认的单据类型
   */
  async getAccountConfig(userid) {
    let newdata = []
    let list_account = await this.getAccountList()
    let list_type = await this.getTypeList()
    // console.log('list_type', list_type)
    let res = await this.getList(this.configType.account, userid)
    const list_config = res.items

    // console.log(list_config)
    for (let i = 0; i < list_type.length; i++) {
      let row = {}
      const temp = list_type[i]

      row['typeid'] = temp['classcode']
      row['typename'] = temp['classname']
      row['accountid'] = 0 // 先设为0
      row['accountname'] = '<未设置>'
      row['updatetime'] = ''

      let configinfo = this.getConfigAccountInfo(list_config, row['typeid'])
      // console.log(accountid)
      if (configinfo) {
        let accountid = configinfo.configvalue - 0
        // console.log(configinfo, accountid)
        row['updatetime'] = configinfo['updatetime']
        if (accountid) {
          let info = this.getAccountInfo(list_account, accountid)
          // console.log(info)
          if (info.id) {
            row['accountid'] = info.id
            row['accountname'] = info.label
          }
        }
      }

      newdata.push(row)
    }
    return newdata
  },

  /**
   * 以下是诉讼费退库相关的配置处理
   */
  async ssftk_field() {
    const res = await postdata(this.ACTION.ssftk_field)
    return res.data
  },
  async ssftk_getConfig() {
    const res = await postdata(this.ACTION.ssftk_get)
    return res.data
  },
  async ssftk_saveConfig(data) {
    const res = await postdata(this.ACTION.ssftk_save, data)
    return res
  },

  /**
   * 以下是单据结账日期的管理
   */

  /**
   * 获取默认的单据类型
   */
  async getCloseDateConfig() {
    let newdata = []
    let list_type = await this.getTypeList()
    // console.log('list_type', list_type)
    let res = await this.getList(this.configType.closedate, 0)
    const list_config = res.items

    // console.log(list_config)
    for (let i = 0; i < list_type.length; i++) {
      let row = {}
      const temp = list_type[i]

      row['typeid'] = temp['classcode']
      row['typename'] = temp['classname']
      row['closedate'] = '' // 先设为0
      row['updatetime'] = ''

      let configinfo = this.getConfigAccountInfo(list_config, row['typeid'])
      // console.log(accountid)
      if (configinfo) {
        let closedate = configinfo.configvalue
        row['closedate'] = closedate
        row['updatetime'] = configinfo['updatetime']
      }

      newdata.push(row)
    }
    return newdata
  },

  // 保存在同一个字段里
  async getConfig(type, code, userid = 0) {
    const query = {
      type: type,
      code: code,
      userid: userid
    }
    const res = await postdata(this.ACTION.getConfig, query)
    return res.data
  },
  async setConfig(type, code, data = {}, userid = 0) {
    const query = {
      type: type,
      code: code,
      userid: userid,
      detail: data
    }
    const res = await postdata(this.ACTION.saveConfig, query)
    return res
  },

  async Tkcommon_getList(query) {
    const res = await postdata('/userconfig/tkcommon_list', query)
    return res.data
  },
  async Tkcommon_getdata() {
    const res = await postdata('/userconfig/tkcommon_my')
    return res.data
  },
  async Tkcommon_save(data) {
    const res = await postdata('/userconfig/tkcommon_save', data)
    return res
  },

  // 获取备用金配置
  async ssfpetty_get() {
    const res = await postdata(this.ACTION.ssfpetty_get)
    return res.data
  },
  // 保存备用金配置
  async ssfpetty_save(data) {
    const res = await postdata(this.ACTION.ssfpetty_save, data)
    return res.data
  },

  // 获取备用金配置
  async voucher_get() {
    const res = await postdata(this.ACTION.voucher_get)
    return res.data
  },
  // 保存备用金配置
  async voucher_save(data) {
    const res = await postdata(this.ACTION.voucher_save, data)
    return res.data
  },
  // 获取收退费情况表配置，是否显示天数列
  async getConfig_stlist() {
    const res = await postdata(this.ACTION.getConfig_stlist)
    return res.data
  },
  async getConfig_casestk() {
    const res = await postdata(this.ACTION.getConfig_casestk)
    return res.data
  },
  // 获取代管款未发还理由及不上缴理由的时间设置
  async dgktime_get() {
    const res = await postdata(this.ACTION.dgktime_get)
    return res.data
  },
  // 设置代管款未发还理由及不上缴理由的时间
  async dgktime_set(query) {
    const res = await postdata(this.ACTION.dgktime_set,query)
    return res.data
  },
}

export default basedata
