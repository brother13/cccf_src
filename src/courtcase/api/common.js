import request from '@/utils/request'
import rc4 from '@/utils/rc4'

const enableDecrypt = false
// const enableDecrypt = process.env.NODE_ENV=='production'
// console.log("enableDecrypt",enableDecrypt)`
// console.log("process.env",process.env)
const enableDebug = false

export function postdata(url, data) {
  if (enableDecrypt) {
    return postdata_decrypt(url, data)
  } else {
    return postdata_undecrypt(url, data)
  }
}
export function postdata_undecrypt(url, data) {
  var temp = { 'action': '', 'data': [] }
  temp.action = url
  temp.data = data || {}
  return request({
    url: 'index.php',
    method: 'post',
    data: temp
  })
}

export function postdata_decrypt(url, data) {
  // 先做加密
  const key = 'wilson2025@sh'
  const pass = generateRandomString()
  var postinfo = { 'action': '', 'data': [] }
  postinfo.action = url
  postinfo.data = data || {}

  // let postinfo = temp
  const poststr = JSON.stringify(postinfo)
  const newinfo = {}
  newinfo.pass = encodeString(pass, key)
  newinfo.data = encodeString(poststr, pass)

  const func = new Promise((resolve, reject) => {
    if (enableDebug) {
      console.log('send', data)
    }
    request({
      url: 'index.php',
      method: 'post',
      data: newinfo
    }).then((res) => {
      const rtdata = res.data
      const newpass = decodeString(rtdata.key, key)
      const newdata = decodeString(rtdata.data, newpass)
      const newobj = JSON.parse(newdata)
      if (enableDebug) {
        console.log('res:', newobj)
      }
      resolve(newobj)
    }).catch((err) => {
      reject(err)
    })
  })

  return func
}

// 生成10位随机密码
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

// 根据密码解码数据
function decodeString(str, pass) {
  // 先base64解码
  // console.log("decodeString > str",str,pass);
  const passarr = decodeBase64(str)
  // console.log("decodeString > passarr",passarr);
  const pass1 = rc4.crypt(pass, passarr, false)
  const newstr = uint8ArrayToString(pass1)

  return newstr
}
// 根据密码加密数据
function encodeString(str, pass) {
  // console.log("encodeString",str,pass)
  // 先base64编码
  // const str = JSON.stringify(obj);
  const ssstr = rc4.crypt(pass, str, false)
  // console.log("encodeString > crypt",ssstr,ssstr.length)
  const newstr = encodeBase64(ssstr)
  // console.log("encodeString > newstr",newstr)
  return newstr
}
function uint8ArrayToString(uint8Array) {
  return new TextDecoder('utf-8').decode(uint8Array)
}
function uint8ArrayToBase64(uint8Array) {
  // 将 Uint8Array 转换为二进制字符串
  let binary = ''
  const len = uint8Array.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  // 使用 btoa 编码为 Base64
  return btoa(binary)
}
function encodeBase64(str) {
  // if (typeof Buffer !== 'undefined') {
  //   return Buffer.from(str).toString('base64');
  // }
  // return btoa(unescape(encodeURIComponent(str)));
  return uint8ArrayToBase64(str)
}
function base64ToUint8Array(base64) {
  // 解码 Base64 得到二进制字符串
  const binaryString = atob(base64)
  // 创建 Uint8Array
  const len = binaryString.length
  const uint8Array = new Uint8Array(len)

  // 填充数据
  for (let i = 0; i < len; i++) {
    uint8Array[i] = binaryString.charCodeAt(i)
  }
  return uint8Array
}

// Base64 解码
function decodeBase64(base64Str) {
  // if (typeof Buffer !== 'undefined') {
  //   return Buffer.from(base64Str, 'base64').toString();
  // }
  // return decodeURIComponent(escape(atob(base64Str)));
  return base64ToUint8Array(base64Str)
}

