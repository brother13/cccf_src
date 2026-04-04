<template>
  <el-dialog
    v-dialogDrag
    v-loading="pdfinfo.loading"
    title="文件列表"
    :visible.sync="showWindow"
    :close-on-click-modal="false"
    width="500px"
  >

    <ul class="fileul">
      <li v-for="(file,index) in pdflist" :key="index" class="file-item"><el-link :href="file.url" icon="el-icon-document" target="_blank">{{ file.filename }}</el-link></li>
    </ul>

    <div slot="footer" class="dialog-footer">
      <el-button
        icon="el-icon-close"
        :disabled="pdfinfo.loading"
        @click="showWindow = false"
      >
        取消
      </el-button>

      <!-- <el-button
        type="primary"
        icon="el-icon-printer"
        :disabled="pdfinfo.loading"
        @click="doPrint"
      >
        打印
      </el-button> -->
    </div>
  </el-dialog>
</template>
<script>
import caseapi from '@/courtcase/api'
import jsPDF from 'jspdf'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
const typeList = [
  { code: 'cltzssp', name: '处理通知书', page: 3, default: [1, 3] }, // 有三联。默认打印1、3联
  { code: 'kptzs', name: '开票通知单', page: 1 },
  { code: 'lztzs', name: '流转通知书', page: 3, default: [1, 3] },
  { code: 'jntzs', name: '缴纳通知书', page: 1 },
  { code: 'tossf', name: '转诉讼费执行费', page: 3, default: [1, 3] },
  { code: 'tofmk', name: '转罚没款', page: 3, default: [1, 3] },
  { code: 'todgk', name: '转他案代管款', page: 3, default: [1, 3] },
  { code: 'toggf', name: '转公告费', page: 3, default: [1, 3] },

  { code: 'tssf', name: '诉讼费结算退还通知', page: 3, default: [2] },
  { code: 'gztzs', name: '更正通知书', page: 5, default: [1, 3, 4, 5] }
]
const pagewidth_A4 = 595 // 594.95996 ，A4纸宽度

const pageheight_A4 = 841 // A4高度
export default {
  name: 'PdfPrint',
  inheritAttrs: false,
  props: {
    cancheck: {
      type: Boolean,
      default: true
    }
  },
  data: () => {
    return {
      info: {
        type: '',
        filelist: [],
        notice: [] // 所有通知书号
      },
      showWindow: false, // 是否显示提示框，
      typeList: typeList,
      typeMap: {},

      pdflist: [],

      // pdf展示信息
      pdfinfo: {
        filedata: '',
        fileurl: '',
        total: 0,
        done: 0,
        loading: false
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
      this.typeMap = {}
      for (const i in typeList) {
        const type = typeList[i]
        const code = type.code
        this.typeMap[code] = type
      }
      this.pdflist = []
      this.info.type = ''
      this.info.notice = [] // 清空通知书
      this.info.filelist = [] // 先清空
    },

    async showFiles(files) {
      this.pdflist = files
      this.showWindow = true
    },

    showFile(url) {
      this.$refs['pdfiframe'].src = url
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
      this.$refs['pdfiframe'].contentWindow.print()
    },

    async saveAndPrint() {
      // 先组合所有的文件
      this.doPrint()
      setTimeout(() => {
        // 判断签收
        this.checkin_select()
      }, 1000)
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
.file-item{
  height: 40px;
  line-height: 40px;
}
.fileul{
  list-style:decimal;
}
</style>
