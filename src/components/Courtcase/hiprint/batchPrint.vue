<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <link rel="stylesheet" type="text/css" media="print" href="./assets/print-lock.css">
    <el-dialog title="批量打印" :visible.sync="batchPrint.showWin" width="800" :close-on-click-modal="false">
      <el-form ref="dataForm_printfmk" label-position="left" label-width="80px" style="width: 90%; margin-left: 20px">

        <el-form-item label="数据信息">
          <div>共有{{ batchPrint.ids.length }}笔数据
            <template v-if="checkedInfo.emptybill">，共有 {{ checkedInfo.emptybill }} 张未生成单据号</template>
            <!-- <template v-if="checkedInfo.billnum">，共有{{ checkedInfo.billnum }}张单据号，分别为{{ checkedInfo.billnoList.join("、") }}</template> -->
            <template v-if="checkedInfo.billnum">，共有{{ checkedInfo.billnum }}张单据号，分别为{{
              showBillText(checkedInfo.billnoList) }}</template>


          </div>
        </el-form-item>
        <el-form-item label="数据预览">
          <el-button @click="showSSfTable = !showSSfTable">{{
            !showSSfTable ? '预览内容' : '隐藏预览'
          }}</el-button>
        </el-form-item>
        <transition name="fade">
          <el-table v-show="showSSfTable" key="ssftemp" :data="batchData" border fit highlight-current-row
            style="width: 100%" height="250" size="mini">
            <el-table-column type="index" width="80" align="center" label="序号">
              <template slot-scope="{ $index }">
                {{ $index + 1 }}
              </template>
            </el-table-column>

            <template v-for="field in fieldList">
              <template v-if="field.show">
                <el-table-column :key="field.field" :label="field.label" :prop="field.field"
                  :align="field.align ? field.align : 'center'" :width="field.width ? field.width : 120"
                  :sortable="field.order ? field.order : false">
                  <template slot-scope="{ row }">
                    <template v-if="field.align == 'right'">
                      {{ formatNumber(row[field.field]) }}
                    </template>
                    <template v-else-if="field.type && field.type == 'switch'">
                      {{ row[field.field] == 1 ? '√' : '' }}
                    </template>
                    <template v-else>
                      {{ row[field.field] }}
                    </template>
                  </template>
                </el-table-column>
              </template>
            </template>
          </el-table>
        </transition>

        <!-- <el-form-item label="起始号码" prop="billno">
          <el-input v-model="batchPrint.billno" style="width:100%;" />
        </el-form-item> -->

        <el-form-item label="打印模板" prop="accountid">
          <el-select v-model="batchPrint.templateid" style="width: 100%" filterable>
            <el-option v-for="aj in basedata.templateList" :key="aj.id" :value="aj.id" :label="aj.tplname" />
          </el-select>
        </el-form-item>
        <el-form-item label="打印方式">
          <el-select v-model="batchPrint.printaction" style="width: 100%" filterable>

            <template v-for="aj in basedata.printActionList">
              <el-option v-if="aj.show" :key="aj.value" :value="aj.value" :label="aj.label" />
            </template>

          </el-select>
        </el-form-item>
        <template v-if="batchPrint.printaction == 3 || batchPrint.printaction == 4">
          <el-form-item label="打印机" prop="printer_voucher">
            <el-select v-model="batchPrint.printer_voucher" style="width: 100%" placeholder="请选择" clearable>
              <el-option v-for="item in basedata.printerList" :key="item.name" :label="item.name" :value="item.name">{{
                item.name }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="打印间隔" prop="printer_speed">
            <el-select v-model="batchPrint.printer_speed" style="width: 100%" placeholder="打印每张票据的间隔时间" clearable>
              <el-option v-for="item in basedata.printSpeedList" :key="item.value" :label="item.label"
                :value="item.value">{{ item.label }}</el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="单批页数" prop="printer_batchnum" v-if="batchPrint.printaction == 4">
            <el-input v-model="batchPrint.printer_batchnum" style="width: 100%" type="number"
              placeholder="一次性发送的打印页数，建议为10页或20页，建议不要超过50页">
            </el-input>
          </el-form-item>


          <el-form-item v-if="batchPrintInfo.doing" label="打印进度">
            <span>
              {{ batchPrintInfo.title }}
            </span>

          </el-form-item>
        </template>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchPrint.showWin = false">取消</el-button>
        <el-button icon="el-icon-printer" type="primary"
          :disabled="!batchPrint.templateid || !batchPrint.ids.length || isPrinting " @click="doPrint">开始打印</el-button>

        <!-- <el-button @click="sendpaper_checkStatus">检查送纸器状态</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
// import $ from 'jquery'
// import printPreview from './preview'

import { hiprint } from '../../vue-plugin-hiprint/src/index'

// hiPrintPlugin.disAutoConnect()

const printSpeedList = [
  // { label: '比较快（3秒）', value: 3 },
  { label: '普通（5秒）', value: 5 },
  { label: '稍微慢（7秒）', value: 7 },
  { label: '较慢（10秒）', value: 10 },
  { label: '慢（15秒）', value: 15 }

]
const printAction = [
  { value: 1, label: '逐张打印', show: true },
  { value: 2, label: '批量打印', show: true },
  { value: 3, label: '*后进纸逐张打印', show: false }, // 只有判断连接了打印辅助工具之后，才会显示此选项
  { value: 4, label: '*后进纸小批量打印', show: false } // 只有判断连接了打印辅助工具之后，才会显示此选项

]

const fieldList = [
  { field: '_index', label: '序号', export: true, show: false },
  { field: '_status', label: '状态', export: true, show: false },
  // { field: 'typename', label: '款项类型', export: true, show: true, width: 130 },
  { field: 'billno', label: '单据号', export: true, show: true, order: true },
  {
    field: 'operdate',
    label: '制单日期',
    export: true,
    show: true,
    order: true
  },
  { field: 'jail', label: '监狱', export: true, show: true, width: 150 },
  { field: 'caseinfo', label: '案号', export: true, show: true, width: 220 },
  {
    field: 'dwname',
    label: '缴款人',
    export: true,
    show: true,
    width: 200,
    order: true
  },
  {
    field: 'je',
    label: '金额',
    export: true,
    show: true,
    align: 'right',
    order: true
  },

  {
    field: 'bankdate',
    label: '入账日期',
    export: true,
    show: true,
    order: true
  },

  { field: 'username', label: '操作员', export: true, show: true },
  { field: 'note', label: '备注', export: true, show: true, width: 200 }
]
export default {
  name: 'PrintTemplateBatch',
  // components: { printPreview },

  props: {},
  data() {
    return {
      showWindow: false,
      showPreview: false,
      fieldList: fieldList,
      basedata: {
        templateList: [],
        printActionList: printAction,
        printSpeedList: printSpeedList, // 打印速度
        printerList: [] // 打印机列表
      },
      showSSfTable: false,

      temp: {
        templateid: undefined,
        typeid: 0,
        id: 0
      },
      // 打印状态，是否正在打印

      isPrinting: false,

      printinfo: {
        lastprint: '',
        printnum: 0
      },
      checkedInfo: {
        num: 0,
        je: 0,
        id: [],
        billnum: 0,
        emptybill: 0,
        billnoList: []
      },

      batchPrint: {
        showWin: false,
        ids: [],
        billno: '',
        templateid: 0,
        printer_voucher: '',
        printer_speed: 10, // 默认普通速度

        printaction: 1, // 默认逐张打印（前进纸）
        printer_batchnum: 20, // 默认20张一打
      },
      batchData: [], // 数据情况

      config: null,

      batchPrintInfo: {
        done: 0,
        total: 0,
        title: '',
        doing: false

      }
    }
  },
  computed: {},

  mounted() {
    // disAutoConnect()

  },
  methods: {


    showBillText(billList) {
      let text = ''
      const maxnum = 10;
      const firstnum = 3;// 最前面最多只取5个
      const lastnum = 3;//最后面只取最多三个
      if (billList.length <= maxnum) {
        text = billList.join('、');
      } else {
        // 取前几项和后几项
        text = "从" + billList.slice(0, firstnum).join('、') + ' 一直到 ' + billList.slice(-lastnum).join('、')

      }


      return text
    },
    init() {
      caseapi.base.getBillConfig().then((data) => {
        this.config = data
      })
      const printer = this.getPrinter()
      if (printer) {
        this.batchPrint.printer_voucher = printer
      }

      this.isPrinting = false
      try {
        this.getPrintList()
      } catch (e) {
        console.log('无法获取打印机列表')
      }
    },
    showPrintBatch(typeid, id) {
      this.init()
      this.showPreview = false
      if (typeid === 111) {
        // 监狱罚没款
        typeid = 103 // 和罚没款同一个
      }
      this.temp.typeid = typeid

      this.temp.id = id
      this.printinfo.printnum = 0
      this.printinfo.lastprint = ''
      this.batchPrint.ids = id
      caseapi.template.getPrintData_Batch(typeid, id).then((res) => {
        this.batchData = res.data
        this.checkDataInfo(res.data)
        this.batchPrint.showWin = true
      })

      if (typeid && id) {
        this.getBasedata().then((res) => { })
      }
    },
    // 检查数据情况
    checkDataInfo(data) {
      let count = {
        num: 0,
        je: 0,
        id: [],
        billnum: 0,
        emptybill: 0,
        billnoList: []
      }
      count.num = data.length
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        count.je += row.je
        count.id.push(row.id)
        if (row.billno) {
          count.billnum++
          count.billnoList.push(row.billno)
        } else {
          count.emptybill++
        }
      }
      this.checkedInfo = count
    },

    /**
     * 获取基础资料，可用模板内容
     *
     */
    async getBasedata() {
      // 获取模板列表
      const param = { typeid: this.temp.typeid, tpltype: 'html' }
      this.basedata.templateList = []

      const res = await caseapi.template.getList(param)
      this.basedata.templateList = res.items

      if (
        res.items.length > 0 &&
        (this.batchPrint.templateid === 0 ||
          this.batchPrint.templateid === null ||
          this.batchPrint.templateid === undefined)
      ) {
        this.batchPrint.templateid = res.items[0].id
      }

      // 判断是否需要自动打印

      return true
    },

    async doPrint() {
      // 检查使用情况

      const printnum = await this.checkPrintstatus(this.temp.typeid, this.temp.id)
      console.log('printnum', printnum)
      if (printnum > 0) {
        try {
          const text = '有' + printnum + '张单据已打印过,是否重新打印?'
          const res1 = await this.$confirm(text, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          if (res1 === 'confirm') {
            console.log('OK')
          }
        } catch (e) {
          return false
        }
        //
      }
      this.isPrinting = true

      console.log('doPrint', this.batchPrint)

      if (!this.batchPrint.templateid) {
        this.$message.error('请选择模板！')
        setTimeout(() => {
          // 3秒后自动恢复按钮
          this.isPrinting = false
        }, 500)
        return false
      }
      // 获取模板
      const info = await caseapi.template.getTemplate(
        this.batchPrint.templateid
      )
      if (info.code !== 20000) {
        this.$message.error('获取模板数据失败：' + info.message)
        setTimeout(() => {
          // 3秒后自动恢复按钮
          this.isPrinting = false
        }, 500)
        return false
      }
      let data = info.data.tpldata
      if (!data || data === null || data === '') {
        data = {}
      }
      // let tpldata = data
      // console.log(tpldata)
      // console.log('已获取到模板', data)
      let template = data

      // 获取数据

      // console.log('getPrintData', resdata)

      // 准备调用打印

      // console.log('准备初始化模板组件')
      hiprint.init()
      let hiprintTemplate = new hiprint.PrintTemplate({
        template: template
      })

      // 1-逐张打印，2-批量打印

      const resdata = await caseapi.template.getPrintData_Batch(
        this.temp.typeid,
        this.temp.id
      )

      if (resdata.code !== 20000) {
        this.$message.error('获取打印数据失败：' + resdata.message)
        setTimeout(() => {
          // 3秒后自动恢复按钮
          this.isPrinting = false
        }, 500)

        return false
      }

      // setTimeout(() => {
      //   // 3秒后自动恢复按钮
      //   this.isPrinting = false
      // }, 5000)

      const printdata = resdata.data
      if (this.batchPrint.printaction === 1) {
        // 逐张打印
        for (let i = 0; i < printdata.length; i++) {
          const info = printdata[i]
          // console.log(info)

          const billno = info['billno'] || ''
          if (billno) {
            // 提示 请放入单据号为 XXX 的单据并按回车
            let text =
              '【' +
              (i + 1) +
              '/' +
              printdata.length +
              '】请将单据编号为【' +
              billno +
              '】的单据放入打印机，并按回车确认打印'
            try {
              const res1 = await this.$confirm(text, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
              if (res1 === 'confirm') {
                // 确认打印
                hiprintTemplate.print(
                  info,
                  {},
                  {
                    callback: () => {
                      // this.logPrint()
                    }
                  }
                )

                await this.waittime(2000) // 打完之后等待2秒再跳出
              } else {
                this.$alert('已取消')
                // this.isPrinting = false
                setTimeout(() => {
                  // 1秒后自动恢复按钮
                  this.isPrinting = false
                }, 1000)

                break
              }
            } catch (e) {
              console.log(e)
              this.$message.error('取消打印')
              setTimeout(() => {
                // 1秒后自动恢复按钮
                this.isPrinting = false
              }, 1000)
              break
            }
          }
        }
      } else if (this.batchPrint.printaction === 2) {
        // 批量打印
        hiprintTemplate.print(
          printdata,
          {},
          {
            callback: () => {
              setTimeout(() => {
                // 1秒后自动恢复按钮
                this.logPrint()
                this.isPrinting = false
              }, 1000)
            }
          }
        )
      } else if (this.batchPrint.printaction === 3) {
        this.setPrinter(this.temp.typeid, this.batchPrint.printer_voucher)
        // 批量自动打印

        this.batchPrintInfo.doing = true
        caseapi.machine.batchPrint(template, printdata, this.batchPrint.printer_voucher, this.batchPrint.printer_speed, (info) => {
          // 打印回调信息

          console.log('打印回调', info)
          this.batchPrintInfo.done = info.done
          this.batchPrintInfo.total = info.total
          // const row = info.row;
          // const billno = row['frombill'] ?? row['billno'];

          this.batchPrintInfo.title = info.title
        }).then((rr) => {
          this.batchPrintInfo.doing = false
        })

        // 输出打印成功
        console.log('打印完成！')
        setTimeout(() => {
          // 1秒后自动恢复按钮
          this.logPrint()
          this.isPrinting = false
        }, 1000)
      } else if (this.batchPrint.printaction === 4) {

        // @todo 20250109 批量发送打印任务，一次性打印N张纸
        const batchnum = this.batchPrint.printer_batchnum
        this.setPrinter(this.temp.typeid, this.batchPrint.printer_voucher)
        this.batchPrintInfo.doing = true

        caseapi.machine.batchPrint_batch(template, printdata, this.batchPrint.printer_voucher, this.batchPrint.printer_speed, this.batchPrint.printer_batchnum, (info) => {
          // 打印回调信息

          console.log('打印回调', info)
          this.batchPrintInfo.done = info.done
          this.batchPrintInfo.total = info.total
          // const row = info.row;
          // const billno = row['frombill'] ?? row['billno'];

          this.batchPrintInfo.title = info.title
        }).then((rr) => {
          this.batchPrintInfo.doing = false
        })

        // 输出打印成功
        console.log('打印完成！')
        setTimeout(() => {
          // 1秒后自动恢复按钮
          this.logPrint()
          this.isPrinting = false
        }, 1000)

        // 

      }

      // 调用打印
      // const width = template.panels.width ? template.panels.width : 210

      // // console.log('已获取完模板和数据，正在准备打印预览', this.$refs['preView'])
      // this.showPreview = true
      // this.$nextTick(() => {
      //   this.$refs['preView'].show(hiprintTemplate, printdata, width)
      // })

      return true
    },

    // 等待2秒
    waittime(timeout = 2000) {
      let func = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true)
        }, timeout)
      })
      return func
    },
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },

    async doPrint_preview() {
      if (!this.temp.templateid) {
        this.$message.error('请选择模板！')
        return false
      }
      // 获取模板
      const info = await caseapi.template.getTemplate(this.temp.templateid)
      if (info.code !== 20000) {
        this.$message.error('获取模板数据失败：' + info.message)
        return false
      }
      let data = info.data.tpldata
      if (!data || data === null || data === '') {
        data = {}
      }
      // let tpldata = data
      // console.log(tpldata)
      // console.log('已获取到模板', data)
      let template = data

      // 获取数据
      const resdata = await caseapi.template.getPrintData(
        this.temp.typeid,
        this.temp.id
      )
      // console.log('getPrintData', resdata)
      if (resdata.code !== 20000) {
        this.$message.error('获取打印数据失败：' + resdata.message)
        return false
      }
      const printdata = resdata.data

      // 准备调用打印

      // console.log('准备初始化模板组件')
      hiprint.init()
      let hiprintTemplate = new hiprint.PrintTemplate({
        template: template
      })
      // 调用打印
      const width = template.panels.width ? template.panels.width : 210

      // console.log('已获取完模板和数据，正在准备打印预览', this.$refs['preView'])
      this.showPreview = true
      this.$nextTick(() => {
        this.$refs['preView'].show(hiprintTemplate, printdata, width)
      })

      return true
    },

    getPrintNum(typeid, id) {
      caseapi.template.getPrintNum(typeid, id).then((data) => {
        this.printinfo.printnum = data.printnum ? data.printnum : 0
        this.printinfo.lastprint = data.lastprint ? data.lastprint : ''
      })
    },
    closePrint() {
      // console.log('closePrint')
      this.showPreview = false
      this.showWindow = false
      this.$emit('close')
    },
    logPrint() {
      // console.log('logPrint')
      this.$emit('doPrint', { typeid: this.temp.typeid, id: this.temp.id })

      caseapi.template
        .logPrintNum(this.temp.typeid, this.temp.id)
        .then((res) => {
          this.showWindow = false
          this.closePrint()
        })
    },

    async getPrintList() {
      caseapi.machine.connect()
      await caseapi.util.waitTime(500)
      const printerList = caseapi.machine.getPrintList()
      console.log('printerList', printerList)
      this.basedata.printerList = printerList
      this.basedata.printActionList[2].show = printerList.length > 0
      this.basedata.printActionList[3].show = printerList.length > 0

      return true
    },

    getPrinter(typeid) {
      const key = 'batchPrint_printer_typeid_' + typeid
      const printer = caseapi.store.get(key)
      return printer
    },
    setPrinter(typeid, printer) {
      const key = 'batchPrint_printer_typeid_' + typeid
      caseapi.store.set(key, printer)
    },

    // 检查打印次数
    async checkPrintstatus(typeid, id) {
      // 检查单据的打印状态

      const res = await caseapi.template.getPrintNum(typeid, id)
      return res
    },

    sendpaper_checkStatus() {
      const time1 = new Date()
      caseapi.machine.sendpaper_getstatus().then((res) => {
        const time2 = new Date()
        const time3 = time2 - time1

        console.log('sendpaper_checkStatus', res, time3)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  width: 100%;
}

.form-label {
  font-weight: bold;
  padding: 10px;
}
</style>
