<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-dialog v-dialogDrag :visible.sync="showWindow" title="打印窗口" :close-on-click-modal="false">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="margin-left: 50px; margin-right: 50px"
      >
        <el-form-item label="打印模板" prop="templateid">
          <template v-if="basedata.templateList.length > 0">
            <el-select v-model="temp.templateid" class="form-item" placeholder="打印模板" @change="changeTemplate">
              <el-option
                v-for="(item, index) in basedata.templateList"
                :key="index"
                :label="item.tplname"
                :value="item.id"
              />
            </el-select>
          </template>
          <template v-else>
            <span>无可用模板，请先配置单据模板</span>
          </template>
        </el-form-item>
        <el-form-item label="已打印次数">
          <span v-if="printinfo.printnum == 0">首次打印</span>
          <span v-else>已打印{{ printinfo.printnum }}次，上次打印时间：{{ printinfo.lastprint }}</span>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <div style="float: left;margin-left: 50px;">
          <el-checkbox v-model="autoInfo.enable" @change="saveConfig">自动打印</el-checkbox>
        </div>
        <!-- <el-button @click="showWindow = false"> 取消 </el-button> -->
        <el-button icon="el-icon-close" @click="closeWin"> 取消 </el-button>

        <el-button
          ref="btn-print"
          type="primary"
          icon="el-icon-printer"
          :disabled="basedata.templateList.length == 0 || !temp.templateid"
          @click="doPrint"
        >
          打印<template v-if="autoInfo.timing && autoInfo.enable && autoInfo.left > 0">({{ (autoInfo.left / 1000).toFixed(1) }}s)</template>
        </el-button>
      </div>

      <el-dialog v-dialogDrag append-to-body :visible.sync="showPreview">
        <printPreview ref="preView" @close="closePrint" @print="logPrint" @pdf="logPrint" />
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import caseapi from '@/courtcase/api'
// import $ from 'jquery'
import printPreview from './preview'

import { hiprint } from '../../vue-plugin-hiprint/src/index'
// hiPrintPlugin.disAutoConnect()
export default {
  name: 'PrintTemplate',
  components: { printPreview },

  props: {},
  data() {
    return {
      showWindow: false,
      showPreview: false,
      basedata: {
        templateList: []
      },

      temp: {
        templateid: undefined,
        typeid: 0,
        id: 0
      },
      printinfo: {
        lastprint: '',
        printnum: 0
      },
      config: null,
      autoInfo: {
        enable: true, // 自动打印
        key: 'courtcase_print_auto', // 是否自动打印的框
        cancel: false, // 默认不取消，如果是true则取消自动打印
        timeout: 2000, // 如果有超过1个模板时，默认等待2秒，如果没有反应则自动打印,
        left: 0,
        timing: false, // 是否在计时
        intval: 100, // 100ms
        handle: null // 句柄
      }
    }
  },
  computed: {},

  mounted() {
    // disAutoConnect()
    caseapi.base.getBillConfig().then((data) => {
      this.config = data
    })
    this.init()
  },
  methods: {

    init() {
      const value = caseapi.store.get(this.autoInfo.key)
      this.autoInfo.enable = value == '1'
    },
    saveConfig() {
      const value = this.autoInfo.enable ? '1' : '0'
      caseapi.store.set(this.autoInfo.key, value)
    },
    closeWin() {
      this.autoInfo.cancel = true
      this.showWindow = false
    },
    changeTemplate() {
      this.autoInfo.cancel = true // 选择模板之后，关闭自动开始的任务
    },
    showPrint(typeid, id) {
      this.showPreview = false
      if (typeid === 111) { // 监狱罚没款
        typeid = 103 // 和罚没款同一个
      }
      this.temp.typeid = typeid

      this.temp.id = id
      this.printinfo.printnum = 0
      this.printinfo.lastprint = ''

      // 获取上一次保存的templateid

      this.getPrintNum(typeid, id)
      if (typeid && id) {
        this.getBasedata().then((res) => {
          this.showWindow = true
          // this.focusBtn()
        })
      }
    },

    async focusBtn() {
      // console.log("focusBtn");
      const timeout = 1000
      setTimeout(() => {
        const obj = this.$refs['btn-print']
        if (obj) {
          // console.log("obj",obj);
          // console.log("find btn-print")
          try {
            // obj.$el.focus();
          } catch (e) {
            console.log('print focusBtn error', e)
          }
        }
        // this.$refs.btnPrint.$el.focus()
      }, timeout)
    },

    getTemplateid(typeid) {
      const key = 'printtemplate_' + typeid
      const tplid = caseapi.store.get(key)
      console.log('getTemplateid', key, tplid)
      if (tplid) {
        return tplid - 0
      }
      return null
    },
    saveTemplateid(typeid, templateid) {
      caseapi.store.set('printtemplate_' + typeid, templateid)
    },

    /**
     * 获取基础资料，可用模板内容
     *
     */
    async getBasedata() {
      // 获取模板列表
      const param = { typeid: this.temp.typeid, tpltype: 'html', nomachine: true }
      this.basedata.templateList = []

      const res = await caseapi.template.getList(param)
      this.basedata.templateList = res.items

      const tplid = this.getTemplateid(this.temp.typeid)

      if (tplid) {
        this.temp.templateid = tplid
      }
      if (
        res.items.length > 0 &&
        (this.temp.templateid === 0 ||
          this.temp.templateid === null ||
          this.temp.templateid === undefined)
      ) {
        this.temp.templateid = res.items[0].id
      }

      // 判断是否需要自动打印
      if (this.config.autoPrint) {
        if (res.items.length === 1) {
          // 仅在模板只有一个的时候，自动打印
          this.doPrint()
        } else {
          // 启用设置

          if (this.autoInfo.enable) {
            this.autoInfo.left = this.autoInfo.timeout
            this.autoInfo.timing = true
            this.autoInfo.cancel = false
            this.autoInfo.handle = setInterval(() => {
              this.showTimeLeft()
            }, this.autoInfo.intval)
          }
        }
      }

      return true
    },
    async showTimeLeft() {
      // console.log("showTimeLeft");
      if (this.autoInfo.cancel || !this.autoInfo.enable) {
        if (this.autoInfo.handle) {
          clearInterval(this.autoInfo.handle)
          this.autoInfo.handle = null
        }
        this.autoInfo.timing = false
        this.autoInfo.cancel = true
        return false
      }
      if (this.autoInfo.left <= 0) {
        this.autoInfo.left = 0
        this.autoInfo.timing = false
        this.autoInfo.cancel = true
        this.doPrint()
      } else {
        this.autoInfo.left -= this.autoInfo.intval
      }
    },

    async doPrint() {
      if (!this.temp.templateid) {
        this.$message.error('请选择模板！')
        return false
      }

      this.autoInfo.cancel = true // 停用自动打印功能

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
      const template = data

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
      const hiprintTemplate = new hiprint.PrintTemplate({
        template: template
      })

      this.saveTemplateid(this.temp.typeid, this.temp.templateid)

      hiprintTemplate.print(printdata, {}, {
        callback: () => {
          this.logPrint()
        }
      })

      // 调用打印
      // const width = template.panels.width ? template.panels.width : 210

      // // console.log('已获取完模板和数据，正在准备打印预览', this.$refs['preView'])
      // this.showPreview = true
      // this.$nextTick(() => {
      //   this.$refs['preView'].show(hiprintTemplate, printdata, width)
      // })

      return true
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
      const template = data

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
      const hiprintTemplate = new hiprint.PrintTemplate({
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
