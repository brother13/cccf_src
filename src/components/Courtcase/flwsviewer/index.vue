<template>
  <el-dialog
    v-dialogDrag
    :title="'查看法律文书 - '+docinfo.caseinfo"
    :visible.sync="showWindow"
    :close-on-click-modal="false"
    width="90%"

    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row :gutter="20">
      <el-col :span="6">
        <ul>
          <li v-for="(item, index) in docList" :key="index" class="checklist">
            <el-link :type="item.c_bh==docinfo.c_bh ? 'danger' : 'primary'" :icon="item.c_bh==docinfo.c_bh ? 'el-icon-right' : ''" @click="showDoc(item.c_bh)">{{ item.wslx }} ({{ item.scsj }})</el-link>
          </li>
        </ul>
      </el-col>
      <el-col :span="18">
        <iframe
          id="dociframe"
          ref="dociframe"
          class="dociframe"
          src="about:blank"
        />
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button
        icon="el-icon-close"
        @click="showWindow = false"
      >
        关闭
      </el-button>

      <el-button
        v-if="!cancheck"
        type="primary"
        icon="el-icon-printer"
        @click="doPrint"
      >
        打印
      </el-button>
    </div>
  </el-dialog>

</template>
<script>
import caseapi from '@/courtcase/api'
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export default {
  name: 'FlwsViewer',
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
        caseinfo: '',
        c_bh: ''

      },
      showWindow: false, // 是否显示提示框，

      docList: [],
      docinfo: {
        c_bh: '', // 主键
        caseinfo: '', // 案号
        scsj: '', // 生成时间
        wslx: '', // 文书类型
        wsnr: '', // 文书内容（文书原内容，但需要把判决内容标黄）
        wsssfnr: '' // 判决内容（提取出来的）
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
      this.pdflist = []
      this.info.type = ''
      this.info.notice = [] // 清空通知书
      this.info.filelist = [] // 先清空
    },

    async showCaseFlws(caseinfo, c_bh) {
      // 获取所有的文书信息
      if (!caseinfo || caseinfo === '') {
        return false
      }

      if (!c_bh || c_bh === '' || c_bh === undefined || c_bh == null) {
        return false
      }
      this.info.caseinfo = caseinfo
      this.info.c_bh = c_bh

      const query = { ah: caseinfo }

      this.docList = []
      caseapi.plugins.ssfflws_getList(query).then((res) => {
        // console.log('已获取文书内容：', res)
        this.docList = res

        if (this.docList.length > 0) {
          this.showWindow = true
        }

        // 判断c_bh是否已存在，如果有，则自动定位

        this.$nextTick(() => {
          if (c_bh) {
            this.showDoc(c_bh)
          }
        })
      })
    },

    showDoc(c_bh) {
      if (!c_bh || c_bh === '') {
        return false
      }
      if (!this.docList || this.docList.length < 1) {
        return false
      }
      for (let i = 0; i < this.docList.length; i++) {
        const doc = this.docList[i]
        if (doc.c_bh === c_bh) {
          this.docinfo.c_bh = c_bh
          this.docinfo.caseinfo = doc.ah
          this.docinfo.scsj = doc.scsj
          this.docinfo.wslx = doc.wslx
          this.docinfo.wsnr = doc.wsnr
          this.docinfo.wsssfnr = doc.wsssfnr

          this.refreshDoc()
          return true
        }
      }
      return false
    },
    refreshDoc() {
      this.insertHtml('dociframe', '正在加载......')
      let html = this.docinfo.wsnr
      const keyword = this.docinfo.wsssfnr
      html = caseapi.util.replaceAll(html, keyword, "<span style='background: #FFFF00;'>" + keyword + '</span>')

      this.insertHtml('dociframe', html)
    },

    // 根据案号获取最新的文书内容

    async getLastWsnr(caseinfo) {
      const query = { ah: caseinfo }
      const res = await caseapi.plugins.ssfflws_getList(query)
      const resdata = res
      // console.l
      if (resdata && resdata.length > 0) {
        return resdata[resdata.length - 1]
      }
      return false
    },

    insertHtml(id, html) {
      const obj = document.getElementById(id)
      // console.log('iframe', id, obj)
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
      this.$refs['dociframe'].contentWindow.print()
    }

  }
}
</script>
<style>
.form-item {
  width: 100%;
}
.dociframe {
  height: 500px;
  width: 100%;
  border: 0;
}

.checklist {
  height: 40px;
  line-height: 40px;
}
</style>
