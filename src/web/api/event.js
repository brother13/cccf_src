import { postdata } from './common'

export function EventList(data) {
  const action = '/event/list'
  return postdata(action, data)
}

export function EventSave(data) {
  const action = '/event/save'
  return postdata(action, data)
}
export function EventAdd(data) {
  const action = '/event/add'
  return postdata(action, data)
}
export function EventDel(data) {
  const action = '/event/del'
  return postdata(action, data)
}
export function EventInfo(data) {
  const action = '/event/info'
  return postdata(action, data)
}
