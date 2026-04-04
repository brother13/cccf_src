/* jshint esversion: 8 */
/* jshint esversion: 8 */

import {
  postdata
} from './common'
import md5 from 'js-md5'
import Cookies from 'js-cookie'
import store from './store'
var user = {
  ACTION: {
    info: '/user/info',
    login: '/user/login',
    changePwd: '/user/changePwd',
    updateinfo: '/user/updateMyinfo',
    applyauth: '/user/applyauth', // 申请授权
    checkauth: '/user/checkauth', // 检查授权剩余时间
    countLogin: '/log/countLogin', // 获取用户登录排名,
    status: '/user/status',
    getUseRoomList:'/user/getUseRoomList'

  },
  salt: '_RLF2020', // 密码加密盐值
  dwid: 1, // 当前的单位主键
  cookiekey: 'WebToken',
  expires: 30, // 过期时间
  // 获取个人信息
  async info() {
    const res = await postdata(this.ACTION.info)
    if (res.code !== 20000) {
      return false
    }
    const userinfo = res.data
    return userinfo
  },

  // 获取用户信息
  async getUserinfo() {
    // 获取用户信息
    // 先获取本地用户信息
    let data = store.get('userinfo')
    // let username = store.get("username");
    // console.log('getUserinfo',data,username);
    if (data) {
      data = JSON.parse(data)
      return data
    } else {
      return false
    }
  },

  /**
     * 获取本地存储的用户信息
     */
  async getLocalLoginInfo() {
    let userinfo = {
      username: '',
      password: '',
      savepwd: false
    }
    userinfo.username = store.get('username')
    userinfo.password = store.get('password')
    userinfo.mobile = store.get('mobile')
    userinfo.savepwd = store.get('savepwd') === 'true'
    userinfo.saveusername = store.get('saveusername') === 'true'

    return userinfo
  },
  // 生成加密后的密码
  genPwd(pass) {
    return md5(pass + this.salt)
  },

  // 用户登录
  async login_by_username(username, userpass, savepwd) {
    let newpass = md5(userpass + this.salt)
    if (userpass.length === 32) {
      // 说明是md5格式的
      newpass = userpass
    }
    const param = {
      username: username,
      password: newpass,
      dwid: this.dwid
    }
    const res = await postdata(this.ACTION.login, param)

    if (res.code === 0) {
      // 数据错误
      this.clearCache()
      return res
      // Message({
      //     message: res.message || '出错',
      //     type: 'error',
      //     duration: 5 * 1000
      // })

      // 登录失败，清空登录信息

      // this.clearCache();

      // return false;
    }

    const userinfo = res.data
    // console.log("正在存储数据：", userinfo);
    // console.log(JSON.stringify(userinfo));
    // 将userinfo 保存进本地存储中
    store.set('userinfo', JSON.stringify(userinfo))
    let token = userinfo.token
    Cookies.set(this.cookiekey, token, {
      expires: this.expires
    })
    store.set('token', token)

    // 如果勾选savepwd，则保存密码及用户
    if (savepwd) {
      store.set('username', username)
      store.set('password', newpass)
      store.set('savepwd', true)
    } else {
      store.remove('username')
      store.remove('password')
      store.remove('savepwd')
    }

    return res
  },
  // 根据手机号码登录
  async login_by_mobile(mobile, userpass, saveusername, savepwd) {
    let newpass = md5(userpass + this.salt)
    if (userpass.length === 32) {
      // 说明是md5格式的
      newpass = userpass
    }
    const param = {
      mobile: mobile,
      password: newpass,
      dwid: this.dwid
    }
    const res = await postdata(this.ACTION.login, param)

    if (res.code === 0) {
      // 数据错误
      this.clearCache()
      return res
    }

    const userinfo = res.data
    // console.log("正在存储数据：", userinfo);
    // console.log(JSON.stringify(userinfo));
    // 将userinfo 保存进本地存储中
    store.set('userinfo', JSON.stringify(userinfo))
    let token = userinfo.token
    Cookies.set(this.cookiekey, token, {
      expires: this.expires
    })
    store.set('token', token)

    // 如果勾选savepwd，则保存密码及用户
    if (saveusername) {
      store.set('mobile', mobile)
      store.set('saveusername', 'true')
    } else {
      store.remove('mobile')
      store.remove('saveusername')
    }
    if (savepwd) {
      store.set('mobile', mobile)
      store.set('password', newpass)
      store.set('savepwd', true)
    } else {
      store.remove('password')
      store.remove('savepwd')
    }

    return res
  },
  clearCache() {
    // store.remove('username');
    // store.remove('password');
    // store.remove('savepwd');
    // 删除Token
    store.remove('token')
    Cookies.remove(this.cookiekey)
    // 删除用户信息
    store.remove('userinfo')
  },
  logout() {
    this.clearCache()
    return true
  },

  /**
     * 修改用户密码
     * @param {string} oldpass
     * @param {string} newpass1
     * @param {string} newpass2
     * @returns
     */
  async changePwd(oldpass, newpass1, newpass2) {
    // console.log("changePwd",oldpass,newpass1,newpass2);

    const param = {
      oldpass: this.genPwd(oldpass),
      newpass1: this.genPwd(newpass1),
      newpass2: this.genPwd(newpass2)
    }
    const res = await postdata(this.ACTION.changePwd, param)
    return res
  },
  async updateinfo(data) {
    const res = await postdata(this.ACTION.updateinfo, data)

    return res
  },
  /**
     * 申请临时授权
     * @param {string} type
     * @param {string} pass
     * @returns
     */
  async applyauth(type, pass) {
    const newpass = this.genPwd(pass)
    const data = { type: type, pass: newpass }
    const res = await postdata(this.ACTION.applyauth, data)

    return res
  },
  /**
     * 检查临时授权
     * @param {string} type
     * @returns
     */
  async checkauth(type) {
    const data = { type: type }
    const res = await postdata(this.ACTION.checkauth, data)
    return res
  },

  async countLogin() {
    const res = await postdata(this.ACTION.countLogin)
    return res.data
  },
  /**
     * 判断用户是否在线
     * @returns
     */
  async checkStatus() {
    const res = await postdata(this.ACTION.status)
    return res.code === 20000
  },
  async getUseRoomList(query) {
    const res = await postdata(this.ACTION.getUseRoomList,query)
    return res.data;
  }

}

export default user
