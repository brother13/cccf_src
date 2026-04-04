<template>
  <el-dialog v-loading="loading" :visible.sync="showHiPrint" title="模板编辑" :fullscreen="true">

    <el-card>
      <el-row :gutter="24" style="margin-bottom: 10px">

        <el-col :span="24">
          <!-- 纸张设置 -->
          <el-button-group>
            <template v-for="(value, type) in paperTypes">
              <el-button
                :key="type"
                :type="curPaperType === type ? 'primary' : 'info'"
                @click="setPaper(type, value)"
              >
                {{ type }}
              </el-button>
            </template>

            <el-popover
              v-model="paperPopVisible"
              title="设置纸张宽高(mm)"
              trigger="click"
            >
              <div>
                <el-input
                  v-model="paperWidth"
                  type="number"
                  style="width: 100px; text-align: center"
                  placeholder="宽(mm)"
                />
                ~
                <el-input
                  v-model="paperHeight"
                  type="number"
                  style="width: 100px; text-align: center; border-left: 0"
                  placeholder="高(mm)"
                />
                <el-button
                  type="primary"
                  style="width: 100%"
                  @click="otherPaper"
                >确定</el-button>
              </div>

              <el-button slot="reference" :type="'other' == curPaperType ? 'primary' : ''">自定义纸张</el-button>

            </el-popover>
          </el-button-group>
          <!-- 预览/打印 -->
          <el-button-group>
            <el-button type="primary" icon="el-icon-view" @click="preView">
              预览
            </el-button>
            <!-- <el-button type="primary" @click="print">
              直接打印
              <el-icon type="printer" />
            </el-button> -->
          </el-button-group>
          <!-- 保存/清空 -->
          <el-button-group>
            <el-button type="primary" icon="el-icon-check" @click="saveTemplate"> 保存 </el-button>
            <el-button type="primary" icon="el-icon-edit" @click="showTempJson"> 查看/编辑代码 </el-button>
            <el-button type="primary" icon="el-icon-close" @click="showHiPrint=false"> 关闭 </el-button>
            <el-popconfirm
              title="是否确认清空?"
              ok-type="danger"
              ok-text="确定清空"
              @confirm="clearPaper"
            >
              <el-icon slot="icon" type="question-circle-o" style="color: red" />
              <el-button type="danger">
                清空
                <el-icon type="close" />
              </el-button>
            </el-popconfirm>
          </el-button-group>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="4">
          <el-card style="height: 100vh">
            <el-row>
              <el-col
                :span="24"
                class="rect-printElement-types"
              >
                <div class="hiprintEpContainer" />
              </el-col>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="14">
          <el-card class="card-design">
            <div id="hiprint-printTemplate" class="hiprint-printTemplate" />
          </el-card>
        </el-col>
        <el-col :span="6" class="params_setting_container">
          <el-card>
            <el-row class="hinnn-layout-sider">
              <div id="PrintElementOptionSetting" />
            </el-row>
          </el-card>
        </el-col>
      </el-row>
      <!-- 预览 -->
      <print-preview ref="preView" />
    </el-card>

    <span slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        @click="showHiPrint = false"
      >关闭</el-button>
    </span>

    <el-dialog
      append-to-body
      :visible.sync="showJsonWin"
      title="模板代码"
    >
      <el-input v-model="templateJson" type="textarea" :rows="15" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-check" @click="changeJson"> 修改 </el-button>
        <el-button
          type="primary"
          @click="showJsonWin = false"
        >关闭</el-button>
      </span>
    </el-dialog>
  </el-dialog>

</template>

<script>
import $ from 'jquery'
import printPreview from './preview'

import { hiprint } from '../../vue-plugin-hiprint/src/index'
// import providers from './providers'
// import printData from './print-data'

import caseapi from '@/courtcase/api'

let hiprintTemplate
export default {
  name: 'TemplateDesigner',
  components: { printPreview },

  data() {
    return {

      loading: false,
      // 模板选择
      mode: 0,
      modeList: [],
      // 当前纸张
      curPaper: {
        type: 'other',
        width: 220,
        height: 80
      },
      // 纸张类型

      pagerTypesList: [
        {
          name: '代管款',
          width: 192,
          height: 93
        },
        {
          name: '农行贷记',
          width: 225,
          height: 80
        },
        {
          name: '农行支票',
          widht: 225, height: 80
        },
        {
          name: '公告费',
          width: 210,
          height: 105
        },
        {
          name: '罚没款',
          width: 190,
          height: 102
        },
        {
          name: '电汇',
          width: 211, height: 148
        },
        {
          name: 'A5',
          width: 210,
          height: 147.6
        }

      ],
      paperTypes: {
        // A3: {
        //   width: 420,
        //   height: 296.6
        // },

        代管款: {
          width: 192,
          height: 93
        },
        农行贷记: {
          width: 225,
          height: 80
        },
        农行支票: {
          widht: 225, height: 80
        },
        公告费: {
          width: 210,
          height: 105
        },
        罚没款: {
          width: 190,
          height: 102
        },
        电汇: {
          width: 211, height: 148
        },
        A4: {
          width: 210,
          height: 296.6
        },
        A5: {
          width: 210,
          height: 147.6
        }
        // B3: {
        //   width: 500,
        //   height: 352.6
        // },
        // B4: {
        //   width: 250,
        //   height: 352.6
        // },
        // B5: {
        //   width: 250,
        //   height: 175.6
        // }
      },
      // 自定义纸张
      paperPopVisible: false,
      paperWidth: '220',
      paperHeight: '80',

      showHiPrint: false,
      showJsonWin: false,
      templateJson: '',

      temp: {
        id: 0,
        typeid: 0,
        tplname: '',
        tpltype: '',
        tpldata: '',
        tplsize: 0

      },
      // 模板数据
      template: {
        name: '',
        value: '',
        type: 0,
        f: { addElementTypes: () => {} }
      }
    }
  },
  computed: {
    curPaperType() {
      let type = 'other'
      let types = this.pagerTypesList

      for (let i = 0; i < types.length; i++) {
        let item = types[i]
        let { width, height } = this.curPaper
        // 四舍五入
        if (this.numberRound(item.width) === this.numberRound(width) && this.numberRound(item.height) === this.numberRound(height)) {
          type = types['name']
        }
      }
      // for (const key in types) {
      //   let item = types[key]
      //   let { width, height } = this.curPaper
      //   if (item.width === width && item.height === height) {
      //     type = key
      //   }
      // }
      return type
    }
  },
  mounted() {
    this.init()
    // this.otherPaper()
  },
  methods: {
    init() {
      this.getTemplateField(101).then((res) => {
        // console.log(res)

        this.initTemplateField()

        this.otherPaper()
      })
      // 默认初始化
    },

    numberRound(val) {
      return Math.round(val * 100) / 100
    },

    /**
     * 显示设计器
     */
    async showDesigner(id) {
      // this.typeid = typeid
      this.showHiPrint = true
      this.loading = true
      this.temp.id = id
      const data = await caseapi.template.getInfo(id)
      this.temp = data

      const typeid = data.typeid

      const res = await this.getTemplateField(typeid)
      if (!res) {
        console.log('获取失败！')
      }
      // console.log('加载模板字段完成', res)

      this.initTemplateField()

      this.otherPaper()
      this.loading = false

      // 展示数据
    },
    /**
     * 显示打印预览
     */
    showPreview(typeid, id) {},

    // init() {
    //   this.modeList = providers.map((e) => {
    //     return { type: e.type, name: e.name, value: e.value }
    //   })
    //   this.changeMode()
    // },
    // changeMode() {
    //   let { mode } = this
    //   let provider = providers[mode]
    //   hiprint.init({
    //     providers: [provider.f]
    //   })
    //   $('.hiprintEpContainer').empty()
    //   hiprint.PrintElementTypeManager.build(
    //     '.hiprintEpContainer',
    //     provider.value
    //   )
    //   $('#hiprint-printTemplate').empty()

    //   let templates = this.$ls.get('KEY_TEMPLATES', {})

    //   let template = templates[provider.value] ? templates[provider.value] : {}
    //   hiprintTemplate = new hiprint.PrintTemplate({
    //     template: template,
    //     settingContainer: '#PrintElementOptionSetting',
    //     paginationContainer: '.hiprint-printPagination'
    //   })
    //   hiprintTemplate.design('#hiprint-printTemplate')
    // },
    /**
     * 设置纸张大小
     * @param type [A3, A4, A5, B3, B4, B5, other]
     * @param value {width,height} mm
     */
    setPaper_old(type, value) {
      try {
        if (Object.keys(this.paperTypes).includes(type)) {
          this.curPaper = {
            type: type,
            width: value.width,
            height: value.height
          }
          hiprintTemplate.setPaper(value.width, value.height)
        } else {
          this.curPaper = {
            type: 'other',
            width: value.width,
            height: value.height
          }
          hiprintTemplate.setPaper(value.width, value.height)
        }
      } catch (error) {
        this.$message.error(`操作失败: ${error}`)
      }
    },

    setPaper(type, value) {
      try {
        const types = this.pagerTypesList
        for (let i = 0; i < types.length; i++) {
          const item = types[i]
          if (item.name === type) {
            this.curPaper = {
              type: type,
              width: value.width,
              height: value.height
            }
            hiprintTemplate.setPaper(value.width, value.height)
            return true
          }
        }

        hiprintTemplate.setPaper(value.width, value.height)
      } catch (error) {
        this.$message.error(`操作失败: ${error}`)
      }
    },
    otherPaper() {
      let value = {}
      value.width = this.paperWidth
      value.height = this.paperHeight
      value.name = 'other'
      this.paperPopVisible = false
      this.setPaper('other', value)
    },
    preView() {
      let { width } = this.curPaper

      caseapi.template.getPreviewData(this.temp.typeid).then((data) => {
        // this.$refs.preView.show(hiprintTemplate, printData, width)
        this.$refs.preView.show(hiprintTemplate, data, width)
      })
    },
    print() {
      if (window.hiwebSocket.opened) {
        // const printerList = hiprintTemplate.getPrinterList()
        // console.log(printerList)
        // hiprintTemplate.print2(printData, {
        //   printer: '',
        //   title: 'hiprint测试打印'
        // })
        return
      }
      this.$message.error('客户端未连接,无法直接打印')
    },
    // save() {
    //   let { mode } = this
    //   let provider = providers[mode]
    //   this.setTemplate({
    //     name: provider.value,
    //     json: hiprintTemplate.getJson()
    //   })
    // },
    // setTemplate(payload) {
    //   let templates = this.$ls.get('KEY_TEMPLATES', {})
    //   // console.log(payload.json)
    //   templates[payload.name] = payload.json
    //   this.$ls.set('KEY_TEMPLATES', templates)
    //   this.$message.info('保存成功')
    // },
    clearPaper() {
      try {
        hiprintTemplate.clear()
      } catch (error) {
        this.$message.error(`操作失败: ${error}`)
      }
    },
    showTempJson() {
      this.showJsonWin = true
      this.templateJson = JSON.stringify(hiprintTemplate.getJson())
    },
    changeJson() {
      // 做提醒
      let json = JSON.parse(this.templateJson)
      // $('.hiprintEpContainer').empty()
      // $('#hiprint-printTemplate').empty()
      $('#hiprint-printTemplate').empty()
      hiprintTemplate = new hiprint.PrintTemplate({
        template: json,
        settingContainer: '#PrintElementOptionSetting',
        paginationContainer: '.hiprint-printPagination'
      })

      hiprintTemplate.design('#hiprint-printTemplate')
      // hiprintTemplate.design('#hiprint-printTemplate')

      this.showJsonWin = false
    },

    async getTemplateField(typeid) {
      let data = await caseapi.template.getTemplateField(typeid)

      this.template.name = data.name
      this.template.value = data.code
      this.template.type = 1

      const items = data.items

      // console.log('可用字段列表:', items)

      // 初始化函数
      const func = function(ops) {
        var addElementTypes = function(context) {
          // console.log(data.code, items)
          const module = data.code + 'Module'
          context.removePrintElementTypes(module)
          context.addPrintElementTypes(
            module, [
              new hiprint.PrintElementTypeGroup('线条', [
                {
                  tid: 'aProviderModule.hline',
                  title: '横线',
                  type: 'hline'
                },
                {
                  tid: 'aProviderModule.vline',
                  title: '竖线',
                  type: 'vline'
                },
                {
                  tid: 'aProviderModule.rect',
                  title: '矩形',
                  type: 'rect'
                },
                {
                  tid: 'aProviderModule.oval',
                  title: '椭圆',
                  type: 'oval'
                }
              ]),
              new hiprint.PrintElementTypeGroup('文本', [
                { tid: module + '.customText', title: '文本', customText: '自定义文本', custom: true, type: 'text' },
                {
                  tid: module + '.longText', title: '长文本', type: 'longText', options: {

                    width: 200,
                    testData: '长文本'
                  }
                }]),
              new hiprint.PrintElementTypeGroup('字段', items)

            ])
        }
        return {
          addElementTypes: addElementTypes
        }
      }

      this.template.f = func()

      // console.log('getTemplateField', this.template)

      return true
    },

    initTemplateField() {
      let provider = this.template

      const fields = [provider.f]

      // console.log('initTemplateField', provider, fields)
      hiprint.init({
        providers: fields
      })

      // hiprint.init()
      $('.hiprintEpContainer').empty()
      hiprint.PrintElementTypeManager.build(
        '.hiprintEpContainer',
        provider.value + 'Module'
      )
      $('#hiprint-printTemplate').empty()

      // 获取模板数据

      // let templates = this.$ls.get('KEY_TEMPLATES', {})
      let data = this.temp.tpldata
      if (!data || data === null || data === '') {
        data = '{}'
      }
      // console.log(data)
      let tpldata = JSON.parse(data)
      console.log('tpldata', tpldata)
      let template = tpldata
      hiprintTemplate = new hiprint.PrintTemplate({
        template: template,
        settingContainer: '#PrintElementOptionSetting',
        paginationContainer: '.hiprint-printPagination'
      })

      // hiprintTemplate.design('#hiprint-printTemplate')

      try {
        hiprintTemplate.design('#hiprint-printTemplate')
      } catch (e) {
        console.log(e)
      }
    },

    saveTemplate() {
      let id = this.temp.id
      let tpldata = hiprintTemplate.getJson()

      // console.log('saveTemplate', id, tpldata)
      caseapi.template.saveTemplate(id, tpldata).then((res) => {
        if (res.code === 20000) {
          this.$message.info('保存成功')
        } else {
          this.$message.error('保存模板失败：' + res.message)
        }
      })
    }

  }
}
</script>
<style lang="less" scoped>
// build 拖拽
/deep/ .hiprint-printElement-type > li > ul > li > a {
  padding: 4px 4px;
  color: #1296db;
  line-height: 1;
  height: auto;
  text-overflow: ellipsis;
}

// 默认图片
/deep/ .hiprint-printElement-image-content {
  img {
    content: url('~@/assets/images/logo.png');
  }
}

// 设计容器
.card-design {
  overflow: hidden;
  overflow-x: auto;
  overflow-y: auto;
}
</style>
