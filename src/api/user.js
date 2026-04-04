// import request from '@/utils/request'
import { postdata } from '@/api/common'

export function login(data) {
  const action = '/user/login'
  return postdata(action, data)
}

export function getInfo(token) {
  const action = '/user/info'
  const data = { token: token }

  return postdata(action, data)

  // return request({
  //   url: '/vue-element-admin/user/info',
  //   method: 'get',
  //   params: { token }
  // })
}

export function logout() {
  const action = '/user/logout'
  return postdata(action)

  // return request({
  //   url: '/vue-element-admin/user/logout',
  //   method: 'post'
  // })
}
