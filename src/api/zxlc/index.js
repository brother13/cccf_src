import { postdata } from './common'

export function DataList(data) {
  const action = '/data/list'
  return postdata(action, data)
}
