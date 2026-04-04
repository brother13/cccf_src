<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="showWindow"
    title="打印诉讼费电子票据"
    :close-on-click-modal="false"
    width="80%"
  >
    <template v-if="temp.src">

      <iframe id="printimage" :src="temp.src" frameborder="0" width="100%" height="600px" />

    </template>
    <template v-else>
      <h3>未找到【{{ temp.billno }}】的电子票据</h3>
    </template>
    <div slot="footer" class="dialog-footer">
      <el-button @click="showWindow = false"> 取消 </el-button>
      <el-button type="primary" icon="el-icon-edit" @click="doPrint">
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
      }
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
    async showSsf(billno) {
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

    insertHtml(id, html) {
      const obj = document.getElementById(id)
      const doc = obj.contentDocument || obj.contentWindow.document

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
