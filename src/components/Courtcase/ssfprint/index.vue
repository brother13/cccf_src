<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    title="打印诉讼费电子票据"
    :close-on-click-modal="false"
    width="80%"
  >
    <template v-if="!loading">
      <template v-if="temp.billno">

        <iframe id="printimage" src="about:blank" frameborder="0" width="100%" height="600px" />

      </template>
      <template v-else>
        <h3>未找到电子票据</h3>
      </template>
    </template>

    <template v-if="loading">
      <h4 style="text-align:center;">{{ tiptext }}</h4>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" :disabled="loading" @click="doPrint">
        打印
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'

export default {
  name: 'SsfPrint',
  inheritAttrs: false,
  props: {},
  data: () => {
    return {
      showWindow: false, // 是否显示提示框，
      temp: {
        billno: '',
        src: ''
      },
      loading: false, // 是否在加载中
      tiptext: '正在加载' // 显示的提示
    }
  },
  computed: {},
  watch: {},

  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.temp.src = ''
      this.temp.billno = ''
    },
    async showSsf_bak(billno) {
      caseapi.casesk.getSsfBill(billno).then((data) => {
        if (!data) {
          this.$alert('未找到电子票据信息')
          return
        }

        // 加载数据
        this.temp.src = data.localurl
        this.temp.billno = billno

        this.showWindow = true
      })
    },
    async showSsf(billno) {
      if (Array.isArray(billno)) {
        this.showSsf_batch(billno) // 转成批量模式
        return
      }
      this.loading = true

      caseapi.casesk.getSsfBill(billno).then((data) => {
        if (!data) {
          this.$alert('未找到电子票据信息')
          return
        }

        // 加载数据

        const html = this.getSSFHtml(data.localurl)

        // this.temp.src = data.localurl
        this.temp.billno = billno

        this.showWindow = true
        this.$nextTick(() => {
          this.insertHtml('printimage', html)
          this.loading = false
        })
      })
    },

    async showSsf_batch(billnoList) {
      const total = billnoList.length

      this.loading = true
      this.showWindow = true

      let allurl = []
      for (let i = 0; i < billnoList.length; i++) {
        const billno = billnoList[i]
        this.tiptext = '正在获取【' + billno + '】的电子票据 (' + (i + 1) + '/' + total + ')'

        try {
          const resdata = await caseapi.casesk.getSsfBill(billno)
          if (!resdata) {
            this.$alert('未找到电子票据【' + billno + '】信息')
            return
          }

          allurl.push(resdata.localurl)
        } catch (e) {
          // console.log('error', e)
          this.$alert('获取电子票据【' + billno + '】失败！')
          this.loading = false

          return false
        }
      }

      this.loading = false

      // 加载数据

      const html = this.getSSFHtml_batch(allurl)

      // this.temp.src = data.localurl
      this.temp.billno = billnoList

      this.showWindow = true
      this.$nextTick(() => {
        this.insertHtml('printimage', html)
      })
    },

    getSSFHtml(src) {
      let html = "<html><head><style>.printimage{max-width:960px}</style></head><body><img src='" + src + "' class='printimage'></body></html>"

      return html
    },

    getSSFHtml_batch(srcList) {
      let html = '<html><head><style>.printimage{max-width:960px}.mainpage{page-break-after: always;}</style></head><body>'

      for (let i = 0; i < srcList.length; i++) {
        const src = srcList[i]
        let div = "<div class='mainpage'><img src='" + src + "' class='printimage'></div>"
        html += div
      }
      html += '</body></html>'

      return html
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
      document.getElementById('printimage').contentWindow.print()
    }
  }
}
</script>
<style>
.form-item {
  width: 100%;
}
</style>
