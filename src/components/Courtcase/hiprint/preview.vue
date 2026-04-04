<template>
  <el-dialog
    :visible.sync="visible"
    :width="width+'mm'"
    append-to-body
    @cancel="hideModal"
    @close="closeWin"
  >
    <div id="preview_content" />

    <template slot="title">

      <div style="margin-right: 20px">打印预览</div>

    </template>
    <template slot="footer">
      <el-button key="close" type="info" icon="el-icon-close" @click="hideModal">
        关闭
      </el-button>
      <el-button type="success" icon="el-icon-download" @click.stop="toPdf">下载PDF</el-button>
      <el-button type="primary" icon="el-icon-printer" @click.stop="print">打印</el-button>

    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'PrintPreview',
  props: {},
  data() {
    return {
      visible: false,
      spinning: true,
      waitShowPrinter: false,
      // 纸张宽 mm
      width: 0,
      // 模板
      hiprintTemplate: {},
      // 数据
      printData: {}
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
    this.printData = {}
  },
  methods: {
    hideModal() {
      this.visible = false
      this.$emit('close')
    },
    show(hiprintTemplate, printData, width = '210') {
      this.visible = true
      this.spinning = true
      this.width = width
      this.hiprintTemplate = hiprintTemplate
      this.printData = printData
      setTimeout(() => {
        // eslint-disable-next-line no-undef
        $('#preview_content').html(hiprintTemplate.getHtml(printData))

        this.$nextTick(() => {
          // this.print()
        })

        this.spinning = false
      }, 500)
    },
    print() {
      this.waitShowPrinter = true
      this.$emit('print')
      this.hiprintTemplate.print(this.printData, {}, {
        callback: () => {
          this.waitShowPrinter = false
          this.hideModal()
        }
      })
    },
    toPdf() {
      this.hiprintTemplate.toPdf(this.printData, '打印预览pdf')
      this.$emit('pdf')
      this.hideModal()
    },
    closeWin() {
      // this.visible = false
      this.hideModal()
      this.$emit('close')
    }
  }
}

</script>
<style lang="less" scoped>

/deep/ .ant-modal-body {
  padding: 0px;
}

/deep/ .ant-modal-content {
  margin-bottom: 24px;
}
</style>
