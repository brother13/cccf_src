<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <el-button
      type="success"
      class="filter-item"
      style="margin-left: 10px"
      :disabled="!bankbillno"
      icon="el-icon-view"
      @click="showbill"
    >查看回单</el-button>
    <el-dialog
      v-dialogDrag
      v-loading="loading"
      :title="title"
      :visible.sync="showWindow"
      :close-on-click-modal="false"
      append-to-body
      width="90%"
    >
      <iframe ref="pdfiframe" class="pdfiframe" src="about:blank" style="height: 100%; width: 100%; min-height: 600px" />

      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-close" @click="showWindow = false"> 取消 </el-button>

        <el-button type="primary" icon="el-icon-printer" @click="doPrint">
          打印
        </el-button>

      </div>

    </el-dialog>
  </div>

</template>
<script>
import caseapi from '@/courtcase/api'
// import Moneyinput from '@/components/Courtcase/MoneyInput' // secondary package based on el-pagination
// import Operdate from '@/components/Courtcase/Operdate' // secondary package based on el-pagination
import { mapGetters } from 'vuex'
const PAGECONOFIG = {
  typename: '文件预览',
  typeid: 310
}
export default {
  name: 'SsfbankpdfPreview',
  inheritAttrs: false,
  // components: { Moneyinput, Operdate },

  props: {
    title: {
      type: String,
      default: '预览'
    },
    bankbillno: {
      type: String,
      default: ''
    }

  },
  data: () => {
    return {
      showWindow: false,

      loading: false

    }
  },
  computed: {
  },
  computed: {},
  watch: {},

  mounted() {
    // this.init()
  },
  methods: {
    async doPrint() {
      this.$refs['pdfiframe'].contentWindow.print()
    },

    async showbill() {
      if (!this.bankbillno || this.bankbillno.length < 1) {
        return false
      }
      this.showBankpdf(this.bankbillno)
    },
    async showFile(fileinfo) {
      if (fileinfo.filedata && !fileinfo.id) {
        // base64形式
        const pdf = caseapi.util.pdf_base64_to_byte(fileinfo.filedata)
        const url = caseapi.util.pdf_getObjectURL(pdf)
        this.showPdf(url)
      }
      if (fileinfo.table == 'attachment' && fileinfo.id) {
        const info = await caseapi.bankpdf.getFile({ id: fileinfo.id, getfile: true })
        const pdfdata = info.filedata
        const pdf = caseapi.util.pdf_base64_to_byte(pdfdata)
        const url = caseapi.util.pdf_getObjectURL(pdf)
        this.showPdf(url)
      }

      // else if (!fileinfo.filedata && fileinfo.id) {
      //   const info = await caseapi.bankpdf.getBankpdf({ id: fileinfo.id,getfile:true });
      //   const pdfdata = info.pdfdata;
      //   const pdf = caseapi.util.pdf_base64_to_byte(pdfdata);
      //   const url = caseapi.util.pdf_getObjectURL(pdf)
      //   this.showPdf(url);
      // }
    },
    async showBankpdf(bankbillno) {
      const info = await caseapi.bankpdf.getBankpdf({ bankbillno: bankbillno, getfile: true })
      console.log('showBankpdf', bankbillno)
      const pdfdata = info.pdfdata
      const pdf = caseapi.util.pdf_base64_to_byte(pdfdata)
      const url = caseapi.util.pdf_getObjectURL(pdf)
      this.showPdf(url)
    },
    async showPdf(url) {
      this.loading = true
      this.showWindow = true
      this.$nextTick(() => {
        this.$refs['pdfiframe'].src = url
        this.loading = false
      })
    }

  }
}
</script>
<style>
.form-item {
  width: 100%;
}

.pdfiframe {
  height: 500px;
  width: 100%;
  border: 0;
}

.checklist {
  height: 40px;
  line-height: 40px;
}
</style>
