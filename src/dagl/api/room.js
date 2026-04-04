import { postdata } from './common'

export function roomList(data) {
  const action = '/room/list'
  return postdata(action, data)
}

export function roomSave(data) {
  const action = '/room/save'
  return postdata(action, data)
}
export function roomAdd(data) {
  const action = '/room/add'
  return postdata(action, data)
}
export function roomDel(data) {
  const action = '/room/del'
  return postdata(action, data)
}
export function roomInfo(data) {
  const action = '/room/info'
  return postdata(action, data)
}
export function roomNewCode(data) {
  const action = '/room/newcode'
  return postdata(action, data)
}
