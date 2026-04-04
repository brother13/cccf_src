import { postdata } from './common'

export function CmmbList(data) {
  const action = '/cmmb/list'
  return postdata(action, data)
}

export function CmmbSave(data) {
  const action = '/cmmb/save'
  return postdata(action, data)
}
export function CmmbAdd(data) {
  const action = '/cmmb/add'
  return postdata(action, data)
}
export function CmmbDel(data) {
  const action = '/cmmb/del'
  return postdata(action, data)
}
export function CmmbInfo(data) {
  const action = '/cmmb/info'
  return postdata(action, data)
}
export function CmmbNewCode(data) {
  const action = '/cmmb/newcode'
  return postdata(action, data)
}
