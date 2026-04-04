import { postdata } from './common'

export function DeptList(data) {
  const action = '/dept/list'
  return postdata(action, data)
}

export function DeptSave(data) {
  const action = '/dept/save'
  return postdata(action, data)
}
export function DeptAdd(data) {
  const action = '/dept/add'
  return postdata(action, data)
}
export function DeptDel(data) {
  const action = '/dept/del'
  return postdata(action, data)
}
export function DeptInfo(data) {
  const action = '/dept/info'
  return postdata(action, data)
}
export function DeptNewCode(data) {
  const action = '/dept/newcode'
  return postdata(action, data)
}
