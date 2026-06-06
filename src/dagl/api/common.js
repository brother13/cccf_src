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
export function AqiList(data) {
  const action = '/data/aqilist'
  return postdata(action, data)
}
export function Dayschange(data) {
  const action = '/data/dayschange'
  return postdata(action, data)
}
export function HourAqiList(data) {
  const action = '/data/houraqiList'
  return postdata(action, data)
}
export function DayAqicount(data) {
  const action = '/data/dayaqicount'
  return postdata(action, data)
}
export function Qxhours(data) {
  const action = '/data/qxhours'
  return postdata(action, data)
}
export function Savecccf(data) {
  const action = '/data/savecccf'
  return postdata(action, data)
}
export function cflist(data) {
  const action = '/data/cflist'
  return postdata(action, data)
}
export function cflistGrouped(data) {
  const action = '/data/cflist_grouped'
  return postdata(action, data)
}
export function cftype(data) {
  const action = '/data/cftype'
  return postdata(action, data)
}

export function cflist_total(data) {
  const action = '/data/cflist_total'
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
export function cflistdel(userid) {
  const action = '/data/cflistdel'
  const data = { 'cflistid': userid }
  return postdata(action, data)
}
export function saveCflistusername(data) {
  const action = '/data/saveCflistusername'
  return postdata(action, data)
}

export function dxmsg(data) {
  const action = '/data/sendmsg'
  const str = '{"value1":"' + data['cbr'] + '","value2":"' + data['ah'] + '","value3":"' + data['bzxr'] + '","value4":"' + data['type'] + 'https://renapp.top/cfapp/index.html?id=' + data['cflistid'] + '，","value5":"' + data['enddate'] + '","templateId":2203195,"phone":[{"phonenum":"' + data['mobile'] + '"}]}'
  console.log(str)
  const str1 = textToHex(str)

  return postdata(action, str1)
}

export function textToHex(text) {
  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(text)
  let hex = ''
  uint8Array.forEach(function(byte) {
    hex += byte.toString(16).padStart(2, '0')
  })
  return hex
}
export function getajjbxx(data) {
  const action = '/data/getajjbxx'
  return postdata(action, data)
}
export function uploadfile(data) {
  const action = '/data/uploadfile'
  return postdata(action, data)
}
export function getuploadfile(data) {
  const action = '/data/getuploadfile'
  return postdata(action, data)
}
export function deluploadfile(data) {
  const action = '/data/deluploadfile'
  return postdata(action, data)
}
export function rpalist(data) {
  const action = '/data/rpalist'
  return postdata(action, data)
}

export function rpalist_total(data) {
  const action = '/data/rpalist_total'
  return postdata(action, data)
}

export function rpalistupdate(data) {
  const action = '/data/rpalistupdate'
  return postdata(action, data)
}
export function rpalistadd(data) {
  const action = '/data/rpalistadd'
  return postdata(action, data)
}
export function rpalistdel(rpalistid) {
  const action = '/data/rpalistdel'
  const data = { 'rpalistid': rpalistid }
  return postdata(action, data)
}
export function xdlistupdate(data) {
  const action = '/data/xdlistupdate'
  return postdata(action, data)
}
export function xdlistadd(data) {
  const action = '/data/xdlistadd'
  return postdata(action, data)
}
export function xdlistdel(xdlistid) {
  const action = '/data/xdlistdel'
  const data = { 'xdlistid': xdlistid }
  return postdata(action, data)
}
export function xdlist(data) {
  const action = '/data/xdlist'
  return postdata(action, data)
}
export function zxklist(data) {
  const action = '/data/zxklist'
  return postdata(action, data)
}
