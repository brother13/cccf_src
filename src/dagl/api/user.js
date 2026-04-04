/**
 * 关于用户操作相关的接口
 */
import { postdata } from './common'

export function login(data) {
  const action = '/user/login'
  return postdata(action, data)
}
/**
 * 获取单个用户信息
 */
export function getInfo(token) {
  const action = '/user/info'
  const data = { 'token': token }
  return postdata(action, data)
}
export function getUserDetail(id) {
  const data = { 'id': id }
  const action = '/user/detail'
  return postdata(action, data)
}
export function logout() {
  const action = '/user/logout'
  return postdata(action, {})
}

export function userlist(data) {
  const action = '/user/list'
  return postdata(action, data)
}

export function userupdate(data) {
  const action = '/user/update'
  return postdata(action, data)
}
export function useradd(data) {
  const action = '/user/add'
  return postdata(action, data)
}
export function userdel(userid) {
  const action = '/user/del'
  const data = { 'userid': userid }
  return postdata(action, data)
}

export function resetpwd(userid) {
  const action = '/user/resetpwd'
  const data = { 'userid': userid }
  return postdata(action, data)
}
export function checkMobile(mobile) {
  const action = '/user/checkmobile'
  const data = { 'mobile': mobile }
  return postdata(action, data)
}
export function sendCode(mobile) {
  // const action = '/test/gencode' // 测试环境，使用测试码
  const action = '/sms/sendcode' // 正式环境

  const data = { 'mobile': mobile }
  return postdata(action, data)
}
