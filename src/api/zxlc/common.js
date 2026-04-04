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
