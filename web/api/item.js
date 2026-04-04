import { postdata } from './common'

export function ItemList(data) {
  const action = '/item/list'
  return postdata(action, data)
}

export function ItemSave(data) {
  const action = '/item/save'
  return postdata(action, data)
}
export function ItemAdd(data) {
  const action = '/item/add'
  return postdata(action, data)
}
export function ItemDel(data) {
  const action = '/item/del'
  return postdata(action, data)
}
export function ItemInfo(data) {
  const action = '/item/info'
  return postdata(action, data)
}
