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
