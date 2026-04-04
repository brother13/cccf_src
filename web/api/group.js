import { postdata } from './common'

export function GroupList(data) {
  const action = '/group/list'
  return postdata(action, data)
}

export function GroupSave(data) {
  const action = '/group/save'
  return postdata(action, data)
}
export function GroupAdd(data) {
  const action = '/group/add'
  return postdata(action, data)
}
export function GroupDel(data) {
  const action = '/group/del'
  return postdata(action, data)
}
export function GroupInfo(data) {
  const action = '/group/info'
  return postdata(action, data)
}
