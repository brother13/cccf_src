import request from '@/utils/request'

export function postdata(url, data) {
  var temp = { 'action': '', 'data': [] }
  temp.action = url
  temp.data = data
  return request({
    url: 'index.php',
    method: 'post',
    data: temp
  })
}

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


export function cflist(data) {
  const action = '/data/cflist'
  return postdata(action, data)
}
export function cflistupdate(data) {
  const action = '/data/cflistupdate'
  return postdata(action, data)
}
export function cflistadd(data) {
  const action = '/data/cflistadd'
  return postdata(action, data)
}
export function cflistdel(cflistid) {
  const action = '/data/cflistdel'
  const data = { 'cflistid': cflistid }
  return postdata(action, data)
}
