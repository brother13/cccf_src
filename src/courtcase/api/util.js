import
getPageTitle
  from '@/utils/get-page-title.js'
import { MessageBox } from 'element-ui'

import {
  solar2lunar
} from './nongli'
// const sitetitle = setting.title;
var utils = {
  init() {
    console.log('load webapi init')
  },
  setTitle(title) {
    try {
      document.title = getPageTitle(title)
    } catch (e) {
      console.log(e)
    }
  },
  async downloadFile(id) {
    const url = './index.php/web/file/getfile/id/' + id
    window.open(url)
    return true
  },
  getImageUrl(id) {
    const url = './index.php/web/file/getImage/id/' + id
    return url
  },
  getLunar(year, month, day) {
    return solar2lunar(year, month, day)
  },
  getTodayDate(dateformat = '{yyyy}年{mm}月{dd}日 {weekday} 农历{nlmm}{nldd}') {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const hour = today.getHours() // 得到小时数
    const minute = today.getMinutes() // 得到分钟数
    const second = today.getSeconds() // 得到秒数
    const dateinfo = this.getLunar(year, month, day)
    const format = []
    format.push({
      text: 'yyyy',
      value: year
    })
    format.push({
      text: 'mm',
      value: month
    })
    format.push({
      text: 'dd',
      value: day
    })
    format.push({
      text: 'hh',
      value: hour
    })
    format.push({
      text: 'min',
      value: minute
    })
    format.push({
      text: 'ss',
      value: second
    })
    format.push({
      text: 'nlmm',
      value: dateinfo.IMonthCn
    })
    format.push({
      text: 'nldd',
      value: dateinfo.IDayCn
    })
    format.push({
      text: 'weekday',
      value: dateinfo.ncWeek
    })

    // let formatstr = '{yyyy}年{mm}月{dd}日 {weekday} 农历{nlmm}{nldd}'
    let formatstr = dateformat
    for (var i = 0; i < format.length; i++) {
      const f = format[i]
      let v = f.value
      const l = '{' + f.text + '}'
      if (v < 10) {
        v = '0' + v
      }
      formatstr = formatstr.replace(l, v)
    }

    return formatstr
  },
  getTodayTime() {
    const today = new Date()

    const hour = today.getHours() // 得到小时数
    const minute = today.getMinutes() // 得到分钟数
    const second = today.getSeconds() // 得到秒数
    const format = []

    format.push({
      text: 'hh',
      value: hour
    })
    format.push({
      text: 'min',
      value: minute
    })
    format.push({
      text: 'ss',
      value: second
    })

    let formatstr = '{hh}:{min}:{ss}'
    for (var i = 0; i < format.length; i++) {
      const f = format[i]
      let v = f.value
      const l = '{' + f.text + '}'
      if (v < 10) {
        v = '0' + v
      }
      formatstr = formatstr.replace(l, v)
    }

    return formatstr
  },
  cashToChinese(n) {
    if (n && typeof (n) === 'string' && n.indexOf(',') > -1) {
      n = n.replace(/\,/g, '')
    }
    var fraction = ['角', '分']
    var digit = [
      '零', '壹', '贰', '叁', '肆',
      '伍', '陆', '柒', '捌', '玖'
    ]
    var unit = [
      ['元', '万', '亿'],
      ['', '拾', '佰', '仟']
    ]
    var head = n < 0 ? '欠' : ''
    n = Math.abs(n)
    var s = ''
    for (let i = 0; i < fraction.length; i++) {
      let p3 = n * 10 * Math.pow(10, i);
      const p4 = Math.round(p3);
      const p5 = Math.abs(p3 - p4);
      // console.log("p3",p3,"p4",p4,"p5",p5);

      if (Math.abs(p3 - p4) < 0.0001) {
        // 有部分数字会因为精度问题，如 841.56，会变成 841.59999999999，如果无脑floor，会导致841.56变成841.5角5分。所以需要判断一下abs是否很小，如果是的话改用四舍五入

        p3 = Math.round(p3);
      }
      const p = Math.floor(p3);
      const p2 = p % 10;

      // console.log("p",p,"p2",p2);

      s += (digit[p2] + fraction[i]).replace(/零./, '')
      // console.log("s",s);
    }
    s = s || '整'
    n = Math.floor(n)
    for (let i = 0; i < unit[0].length && n > 0; i++) {
      var p = ''
      for (var j = 0; j < unit[1].length && n > 0; j++) {
        p = digit[n % 10] + unit[1][j] + p
        // console.log("p", p);
        n = Math.floor(n / 10);
        // console.log("n", n);
      }
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s
    }
    return head + s.replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整')
  },
  cashToChinese2(cash) {
    // cash = this.number_format(cash, 2, '.', '')
    var digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    var largeUnits = ['元', '万', '亿']
    var units = ['', '拾', '佰', '仟']
    var fractions = ['角', '分']
    let cStr = ''
    cash = cash.toString()
    if (cash === '' || cash === undefined || cash === null) {
      return cStr
    }
    const preCash = cash.split('.')[0] || ''
    const lastCash = cash.split('.')[1] || '00'
    if (preCash.length > 12 || lastCash.length > 2) {
      return cStr
    }
    // 遍历小数位
    for (let i = 0; i < fractions.length; i++) {
      cStr += (digits[lastCash.charAt(i)] + fractions[i]).replace(/零./, '')
    }
    cStr = cStr || '整'
    // 遍历整数位，用str来记录每4位的值
    for (let i = preCash.length - 1, n = 0, str = ''; i >= 0; i--) {
      let largeUnit = ''
      str = (digits[preCash[i]] + units[n % 4]) + str
      // 用n计数每隔4位，或者遍历到头的时候加单位（'元','万','亿'）
      if ((n + 1) % 4 === 0 || i === 0) {
        largeUnit = largeUnits[Math.floor(n / 4)]
        // 考虑替换末位全是0时替换位空 或者中间连续0时替换为零
        str = str.replace(/(零.)*零$/g, '').replace(/(零.)+/g, '零')
        str += largeUnit
        cStr = str + cStr
        str = ''
      }
      n++
    }
    // 考虑处理（'元','万','亿'）单位前为10的情况，和整数位为0的情况
    return cStr.replace(/壹拾(.){0,1}([元|万|亿])/g, '拾$1$2').replace(/^元/, '')
  },

  number_format(number, decimals, dec_point, thousands_sep) {
    /*
     * 参数说明：
     * number：要格式化的数字
     * decimals：保留几位小数
     * dec_point：小数点符号
     * thousands_sep：千分位符号
     * */

    number = (number + '').replace(/[^0-9+-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    var sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep
    var dec = (typeof dec_point === 'undefined') ? '.' : dec_point
    var s = ''
    var toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec)
      // return '' + Math.ceil(n * k) / k
      return '' + Math.round(n * k) / k
    }

    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.')
    var re = /(-?\d+)(\d{3})/
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, '$1' + sep + '$2')
    }

    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }
    return s.join(dec)
  },

  /**
   * 获取生成制单信息
   * @param {object} data
   * @returns
   */
  getDataInfo(data) {
    const username = data.username ? data.username : '<未知>'
    const opertime = data.createtime ? data.createtime : ''
    const updatetime = data.updatetime ? data.updatetime : ''
    let text = username + ' 制单于 ' + opertime
    if (updatetime !== '' && updatetime !== opertime) {
      text += '，上次修改时间 ' + updatetime
    }
    return text
  },

  formatNumber(num) {
    return this.number_format(num, 2)
  },

  formatJson(filterVal, jsonData) {
    return jsonData.map((v) =>
      filterVal.map((field) => {
        const j = field.field
        let value = v[j]
        if (field.align && field.align === 'right') {
          // 数字
          value = this.formatNumber(value)
          value = value.replace(/,/g, '')
          // console.log(value)
          if (value === '-') {
            value = 0
          }
          return value - 0
        }

        return value
      })
    )
  },

  // 检查是否有空格，包括半角空格和全角空格
  checkSpace(arr) {
    for (let i in arr) {
      const text = arr[i]
      if (!text) {
        continue
      }
      if (text.indexOf(' ') > -1) {
        return false
      }
      if (text.indexOf('　') > -1) {
        return false
      }
    }

    return true
  },
  // 去除空格
  replaceSpace(text) {
    let str = text
    let spaceList = [' ', '　']
    for (let k in spaceList) {
      const blank = spaceList[k]
      for (let i = 0; i < 99; i++) {
        if (str.indexOf(blank) > -1) {
          str = str.replace(blank, '')
        } else {
          break
        }
      }
    }

    return str
  },
  // 文本中是否包含中文信息
  strHasChinese(s) {
    var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi
    if (!patrn.exec(s)) {
      return false
    } else {
      return true
    }
  },

  /**
   * 将pdf数据转换成URL形式展示
   * @param {string} data
   * @returns
   */
  pdf_getObjectURL(data) {
    let url = null
    let file = new Blob([data], {
      type: 'application/pdf;chartset=utf-8'
    })
    if (window.createObjectURL !== undefined) {
      // 通用
      url = window.createObjectURL(file)
    } else if (window.webkitURL !== undefined) {
      // 兼容谷歌
      try {
        url = window.webkitURL.createObjectURL(file)
      } catch (error) {
        // console.log("test")

      }
    } else if (window.URL !== undefined) {
      // 兼容其他
      try {
        url = window.URL.createObjectURL(file)
      } catch (error) {
        // console.log("test")
      }
    }
    // 将转化后url赋值
    return url
  },
  // 解码base64
  pdf_base64_to_byte(data) {
    data = window.atob(data)
    // const mime = 'application/pdf'
    var ia = new Uint8Array(data.length)
    for (var i = 0; i < data.length; i++) {
      ia[i] = data.charCodeAt(i)
    }
    return ia

    // return new Blob([ia], {
    //   type: mime
    // })
  },

  formatDate(today, dateformat = '{yyyy}-{mm}-{dd}') {
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const hour = today.getHours() // 得到小时数
    const minute = today.getMinutes() // 得到分钟数
    const second = today.getSeconds() // 得到秒数
    const format = []
    format.push({
      text: 'yyyy',
      value: year
    })
    format.push({
      text: 'mm',
      value: month
    })
    format.push({
      text: 'dd',
      value: day
    })
    format.push({
      text: 'hh',
      value: hour
    })
    format.push({
      text: 'min',
      value: minute
    })
    format.push({
      text: 'ss',
      value: second
    })

    // let formatstr = '{yyyy}年{mm}月{dd}日 {weekday} 农历{nlmm}{nldd}'
    let formatstr = dateformat
    for (var i = 0; i < format.length; i++) {
      const f = format[i]
      let v = f.value
      const l = '{' + f.text + '}'
      if (v < 10) {
        v = '0' + v
      }
      formatstr = formatstr.replace(l, v)
    }

    return formatstr
  },

  copyToPaste(text) {
    var domUrl = document.createElement('textarea')

    domUrl.value = text
    domUrl.id = 'creatDom'
    document.body.appendChild(domUrl)
    domUrl.select() // 选择对象
    document.execCommand('Copy') // 执行浏览器复制命令
    const creatDom = document.getElementById('creatDom')
    creatDom.parentNode.removeChild(creatDom)
    MessageBox.alert('复制成功')
  },
  waitTime(delay = 100) {
    // 等待几秒后返回，用于async/await
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, delay)
    })
  },

  replaceAll(text, s1, s2) {
    return text.replace(new RegExp(s1, 'gm'), s2)
  },

  getChsDate(datetext) {
    // 将 yyyy-mm-dd的日期格式，改成 yyyy年mm月dd日
    if (datetext) {
      let date = new Date(datetext);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate() ;
      return year + '年' + month + '月' + day + '日';
    } else {
      return '';
    }
  },

  // 将文本用主键替换
  replaceWidhTemplate(template='',data={}){

    let text = template
    for (var f in data) {
      let v = data[f]
      const l = '{' + f + '}'
      
      text = text.replace(l, v)
    }
    return text;
  }

}

export default utils
