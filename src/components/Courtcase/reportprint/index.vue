<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    title="打印"
    :close-on-click-modal="false"
    width="80%"
    :show-close="!loadstatus.loading"
    :close-on-press-escape="false"
  >

    <div class="printmain">

      <div id="printdiv" class="printdiv">
        <template v-if="temp.data && temp.field && temp.field.length">
          <div class="title">
            <h3 style="width: 100%; text-align: center">{{ temp.title }}</h3>
          </div>
          <div class="divtable">
            <table class="page-table">
              <thead>
                <!-- <th>序号</th> -->
                <template v-for="(field, index) in temp.field">
                  <th
                    :key="index"
                    class="tablehead page-table-td"
                    :style="{
                      width: (field.width ? field.width : 100) + 'px',
                      'font-size': '16px',
                    }"
                  >
                    {{ field.label }}
                  </th>
                </template>
              </thead>
              <tbody>
                <template v-for="(row, index) in temp.data">
                  <!-- <td :key="'key_'+index">{{ index+1 }}</td> -->
                  <tr :key="'tr_' + index">
                    <template v-for="(fld, idx) in temp.field">
                      <template v-if="fld.align && fld.align == 'right'">
                        <td
                          :key="'td_' + index + '_' + idx"
                          class="page-table-td"
                          style="text-align: right"
                          :style="{ width: (fld.width ? fld.width : 100) + 'px' ,textAlign:(fld.align ? fld.align : 'left')}"
                        >
                          {{ row[fld.field] ? formatNumber(row[fld.field]) : '' }}
                        </td>
                      </template>
                      <template v-else>
                        <td
                          :key="'td_' + index + '_' + idx"
                          class="page-table-td"
                          :style="{ width: (fld.width ? fld.width : 100) + 'px' ,textAlign:(fld.align ? fld.align : 'left')}"
                        >
                          {{ row[fld.field] ? row[fld.field] : '' }}
                        </td>
                      </template>
                    </template>
                  </tr>
                </template>
              </tbody>
            </table>
            <div style="line-height:12px;">&nbsp;</div>
          </div>

        </template>
        <template v-else>
          <h3>{{ process.text }}<template v-if="process.total && process.done">({{ process.done }}/{{ process.total }})</template></h3>
        </template>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="loadstatus.loading" @click="showWindow = false"> 取消 </el-button>
      <el-button v-print="printobj" type="primary" icon="el-icon-printer" :disabled="loadstatus.loading">
        打印
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'

export default {
  name: 'ReportPrint',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框
      // 进度
      process: {
        total: 0,
        done: 0,
        text: '加载数据中'

      },
      loadstatus: {
        loading: false,

        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 100 // 默认分页数
      },

      temp: {
        title: '',
        field: [],
        data: [],
        time: ''
      },
      printobj: {
        id: 'printdiv',
        popTitle: '打印'
      }
    }
  },
  computed: {},
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {},

    // 显示打印窗口
    showPrint(title = '', field = [], data = [], sumfield = []) {
      this.temp.title = title

      // 加工数据，求和

      let printfield = []
      for (let i = 0; i < field.length; i++) {
        if (field[i]['print']) {
          printfield.push(field[i])
        }
      }

      const suminfo = this.calcSum(data, sumfield, printfield)
      console.log(suminfo)
      let newdata = [...data]
      this.temp.data = newdata

      if (suminfo) {
        this.temp.data.push(suminfo)
      }

      // 加工field，只保留需要打印的字段

      this.temp.field = printfield
      // console.log(this.temp)

      this.$nextTick(() => {
        this.showWindow = true
      })
    },
    /**
     * 传入函数，自动分布计算
     */
    // showPrintData(title = '', field = [], sumfield = [], func, param, data = []) {
    //   const total = query.total
    //   if (total <= query.pagesize && query.page === 1) {
    //     // 说明不用分页,直接用当前数据即可
    //     this.showPrint(title, field, data, sumfield)
    //     return true
    //   }

    //   // 如果大于，则需要做分页

    // },

    async showPrintData(
      {
        title = '',
        field = [],
        data = [],
        sumfield = ['je'],
        total = 0,
        func,
        param
      }
    ) {
      // console.log('exportTable', param, func)
      console.log('showPrintData', param, total)

      // const total = param.total || 0
      const maxnum = 500
      const pagemax = 500

      param['sort'] = 'operdate,id' // 改成正序

      if (total > maxnum) {
        // 做提示
        try {
          let confirm = await this.$confirm('当前记录数超过' + maxnum + '笔,打印较慢,是否继续打印?', '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
          console.log(confirm)
        } catch (e) {
          // 说明点击了取消
          return
        }
      }

      // if (data && data.length < param.pagesize && param.pagesize === 1) {
      //   // 说明数据是完整的，不需要另外分页去读
      //   this.showPrint(title, field, data, sumfield)
      //   return true
      // }

      if (total <= pagemax && total) {
        let query = Object.assign({}, param)
        // query.flesh = 0
        this.isExporting = true // 标志 是否正在导出

        query.page = 1
        query.pagesize = pagemax
        const res = await func(query)
        // console.log('after call func', func)
        const data = res.items
        this.showPrint(title, field, data, sumfield)
        return
      } else {
        // 开始分页读取数据

        // console.log('start loading')
        this.loadstatus.total = total
        this.loadstatus.done = 0
        this.loadstatus.page = 1
        this.loadstatus.totalpage = Math.floor(total / this.loadstatus.pagesize)
        if (total > this.loadstatus.pagesize * this.loadstatus.totalpage) {
          this.loadstatus.totalpage++ // 判断分页
        }
        console.log('totalpage', this.loadstatus.totalpage)
        let alldata = []
        this.loadstatus.loading = true // 标志 是否正在读取数据

        this.showWindow = true

        this.showProgress('正在读取数据', this.loadstatus.done, this.loadstatus.total)
        for (let i = 1; i <= this.loadstatus.totalpage; i++) {
          let query = Object.assign({}, param)
          // query.flesh = 0
          query.page = i
          query.pagesize = this.loadstatus.pagesize
          // console.log('before call func', func, query)
          const res = await func(query)
          // console.log('after call func', func)
          const data = res.items
          for (let idx = 0; idx < data.length; idx++) {
            let row = data[idx]
            row['_index'] = (i - 1) * this.loadstatus.pagesize + idx + 1
            alldata.push(row)
          }
          this.loadstatus.done += data.length
          // alldata = alldata.concat(data) // 合并数组
          this.showProgress('正在读取数据', this.loadstatus.done, this.loadstatus.total)
        }

        this.loadstatus.loading = false

        // 开始生成数据
        this.showPrint(title, field, alldata, sumfield)
      }
    },

    showProgress(title, done, total) {
      this.process.text = title
      this.process.done = done
      this.process.total = total
      // console.log(this.process)
    },

    calcSum(data = [], sumfield = [], field = []) {
      let sumje = {}
      if (sumfield.length < 1) {
        return null
      }

      // 获取第一列名
      const col1 = field[0].field || null
      const col2 = field[1].field || null
      if (col1) {
        sumje[col1] = '合计'
      }
      if (col2) {
        sumje[col2] = data.length
      }

      for (let i = 0; i < sumfield.length; i++) {
        sumje[sumfield[i]] = 0
      }
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < sumfield.length; j++) {
          const f = sumfield[j]

          sumje[f] += data[i][f] - 0
        }
      }

      return sumje
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },

    insertHtml(id, html) {
      let obj = document.getElementById(id)
      let doc = obj.contentDocument || obj.contentWindow.document

      // console.log('insertHTML', doc)
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
        // obj.contentWindow.contents = html
      }
    },

    async doPrint() {
      // document.getElementById('reportprint').contentWindow.print()
    }
  }
}
</script>
<style>
.page-table-td {
  border: 1px solid #000;

  height: 100%;
  line-height: 22px;
  padding-left: 2px;
  padding-right: 2px;
}
.tablehead {
  background-color: #ddd;
  /** */
}
.printmain{

  height:500px;
  overflow-y:auto;
}
.page-table {
  /* width: 100%; */
  border-width: 1px;
  border-style: solid;
  border-color: rgb(0, 0, 0);
  border-collapse: collapse;
  font-size: 12px;
  margin:auto;
}
</style>
