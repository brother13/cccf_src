import { postdata } from './common'

export function DataList(data) {
  const action = '/data/list'
  return postdata(action, data)
}
export function DwList() {
  const action = '/data/dwlist'
  return postdata(action, {})
}
export function LabelList() {
  const action = '/data/labellist'
  return postdata(action, {})
}
