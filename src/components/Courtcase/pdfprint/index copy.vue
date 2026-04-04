<template>
  <el-dialog
    v-dialogDrag
    v-loading="pdfinfo.loading"
    title="打印预览"
    :visible.sync="showWindow"
    :close-on-click-modal="false"
    width="90%"
    :element-loading-text="'处理中 (' + pdfinfo.done + '/' + pdfinfo.total + ')'"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <el-row :gutter="20">
      <el-col :span="6">
        <ul>
          <el-checkbox-group v-model="pdf_checked" @change="saveConfig">
            <li v-for="(item, index) in pdflist" :key="index" class="checklist">
              <el-checkbox :label="item.value">{{ item.filename }}</el-checkbox>
            </li>
          </el-checkbox-group>
        </ul>
      </el-col>
      <el-col :span="18">
        <iframe ref="pdfiframe" class="pdfiframe" src="about:blank" />
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button
        icon="el-icon-close"
        :disabled="pdfinfo.loading"
        @click="showWindow = false"
      >
        取消
      </el-button>
      <el-button
        v-if="cancheck"
        type="primary"
        icon="el-icon-printer"
        :disabled="pdfinfo.loading"
        @click="saveAndPrint"
      >
        打印并签收
      </el-button>
      <el-button
        v-if="!cancheck"
        type="primary"
        icon="el-icon-printer"
        :disabled="pdfinfo.loading"
        @click="doPrint"
      >
        打印
      </el-button>
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
      pdf_checked: [],

      pdf_allfile: {}, // 保存所有的pdf文件内容
      pdf_filelist: [], // 已选中文件

      pdf_checkedList: [], // 已选中的记录

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
      for (let i in typeList) {
        const type = typeList[i]
        const code = type.code
        this.typeMap[code] = type
      }
      this.pdflist = []
      this.info.type = ''
      this.info.notice = [] // 清空通知书
      this.info.filelist = [] // 先清空
    },

    async showPdfPrint(type, filelist, notice) {
      // console.log('showPdfPrint', type, filelist, notice)

      this.info.type = type
      this.info.filelist = filelist
      this.info.notice = notice
      // 开始显示窗口并开始获取文件
      this.showWindow = true
      // 加载默认选择项
      this.pdf_checked = this.getPdfCheckList(type)
      // 加载所有pdf资源
      const res = await this.getAllPdf(filelist)
      if (res) {
        this.refreshPdf()
      }
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
      this.$refs['pdfiframe'].contentWindow.print()
    },

    // 以下是pdf相关处理界面
    getPdfCheckList(type) {
      this.pdflist = []
      let pdflist = []
      let pdf_checked = []
      const pdftype = this.typeMap[type]
      const page = pdftype['page'] ?? 1

      for (let i = 1; i <= page; i++) {
        let file = {}
        file['type'] = type
        file['value'] = type + '_' + i
        file['page'] = i
        file['filename'] = pdftype['name'] + ' 第' + i + '页'
        pdflist.push(file)
      }
      // 添加三者材料
      let other = {
        type: 'other',
        value: 'other',
        page: 1,
        filename: '第三方材料'
      }
      pdflist.push(other)

      console.log('pdflist', pdflist)

      // 判断是否是转诉讼费、转罚没款、转他案

      const toTypeList = ['tossf', 'tofmk', 'todgk', 'toggf']
      const toTypeName = {
        tossf: { code: 'ssf', name: '诉讼费缴纳通知书', page: 4 },
        tofmk: { code: 'fmk', name: '罚没款缴款通知书', page: 3 },
        todgk: { code: 'dgk', name: '转他案代管款缴款通知书', page: 3 },
        toggf: { code: 'ggf', name: '公告费缴款通知书', page: 3 }
      }
      if (toTypeList.indexOf(type) > -1) {
        const typeobj = toTypeName[type]
        const typepage = typeobj.page
        for (let i = 1; i <= typepage; i++) {
          let file = {}
          file['type'] = typeobj['code']
          file['value'] = typeobj['code'] + '_' + i
          file['page'] = i
          file['filename'] = typeobj['name'] + ' 第' + i + '页'
          pdflist.push(file)
        }
      }

      this.pdflist = pdflist
      const key = 'pdf_checked_' + type
      const checked = caseapi.store.get(key)
      if (checked) {
        pdf_checked = JSON.parse(checked)
      } else {
        // 取默认值
        const defaultPage = pdftype['default'] ?? []
        if (defaultPage && Array.isArray(defaultPage) && defaultPage.length) {
          // 添加记录
          for (let i in defaultPage) {
            let text = type + '_' + defaultPage[i]
            pdf_checked.push(text)
          }
          // 添加第三方材料
          // pdf_checked.push("other");
        } else {
          // 如果没有设置，全部添加
          for (let i = 1; i <= page; i++) {
            let text = type + '_' + i
            pdf_checked.push(text)
          }
        }
      }

      return pdf_checked
      // this.pdf_checked = pdf_checked
    },
    saveConfig(newval) {
      let arr = newval
      // 做正序排序
      arr = arr.sort()
      this.savePdfCheckList(this.info.type, arr)
      // 重新生成文件

      this.pdf_checked = arr
      this.refreshPdf()

      // console.log('saveConfig', newval)
    },
    // 保存当前选中项
    savePdfCheckList(type, value) {
      const key = 'pdf_checked_' + type
      const text = JSON.stringify(value)
      caseapi.store.set(key, text)
    },
    /**
     * 根据选中项及文件内容，截取并生成最终pdf文件
     */
    async createPdfFile(checkedList, filelist) {
      this.pdfinfo.load = true
      this.pdfinfo.done = 0
      this.pdfinfo.total = filelist.length

      const pdfNewDoc = await PDFDocument.create() // 创建空白页
      // const pdfEmpty = await PDFDocument.create() // 创建空白页

      console.log('filelist', filelist)

      let allfilename = []

      for (let i in filelist) {
        this.pdfinfo.done++
        const file = filelist[i]
        const type = file['type']
        const url = file['url']
        const pdffile = this.pdf_allfile[url]
        let pdffileObj = null
        try {
          pdffileObj = await PDFDocument.load(pdffile) // 加载pdf文件
        } catch (e) {
          // console.log(e)
          this.$alert(
            '无法加载通知书【' +
              file['noticenum'] +
              '】的电子通知书信息，其文件地址为【' +
              url +
              '】。请核查！'
          )
          this.pdfinfo.loading = false

          return false
          // break;
        }

        if (pdffile) {
          // 获取页数

          const pagecount = pdffileObj.getPageCount()
          // console.log('type', type, 'url', url, 'pagecount', pagecount)
          // 文件存在，添加页数
          for (let c in checkedList) {
            const check = checkedList[c]
            const arr = check.split('_')
            const checktype = arr[0]
            if (checktype !== type) {
              continue // 如果类型不一致，则跳过
            }

            if (checktype === 'other') {
              // 直接全部添加
              const pages_other = pdffileObj.getPageCount()
              // console.log('pagecount:', pages_other)
              let pagearr = []
              for (let n = 0; n < pages_other; n++) {
                pagearr.push(n)
              }
              const pages = await pdfNewDoc.copyPages(pdffileObj, pagearr)

              for (let p in pages) {
                const page = pages[p]
                // 20230830新增，判断页面大小，是否大于A4宽度，若大于，则自动缩小。小的不管

                // 1.先获取页面宽度，对比A4大小
                const pagewidth = page.getWidth()

                // console.log('pageWidth', pagewidth)

                if (pagewidth > pagewidth_A4) {
                  // 2.说明比A4宽，计算缩放比例
                  const zoom = pagewidth_A4 / pagewidth
                  // 3.按zoom的比值进行缩放

                  page.scale(zoom, zoom)
                  // page.scaleContent(zoom, zoom)
                }

                const pageheight = page.getHeight() // 获取页面高度

                // 如果页面高度小于A4纸的大小，需要将高度设成A4大小

                const pagesize_A4 = jsPDF.A4
                console.log('pagesize_A4', pagesize_A4)

                if (pageheight < pageheight_A4) {
                  page.setPageSize([pagewidth_A4, pageheight_A4]) // A4大小
                }

                // 20230830 缩放结束

                pdfNewDoc.addPage(page)
                allfilename.push(file)
              }
            } else if (arr.length > 1) {
              // 说明是四类，判断分页

              let pagenum = arr[1] - 1

              // 20230830增加，针对ssf单独判断，ssf正常应该是4页，如果出现5页，说明第1页换页了，则除第一页以外的其它页面，都需要加1
              if (type === 'ssf' && pagecount > 4) {
                if (pagenum > 0) {
                  pagenum++
                }

                console.log('pagenum', pagenum, pagecount)

                // 判断是不是第四页
                if (pagenum === 4) {
                  // 最后一页
                  pagenum = pagecount - 1 // 强制为最后一页
                }
              }

              // 20230830 修改结束

              const pages = await pdfNewDoc.copyPages(pdffileObj, [pagenum])
              for (let p = 0; p < pages.length; p++) {
                let page = pages[p]
                // const pagewidth = page.getWidth()
                // console.log('pageWidth', pagewidth)
                // console.log(page)
                // console.log('addPage ', page)

                // if (!page || !page['contentStream']) {
                //   this.$alert('无法加载通知书【' + file['noticenum'] + '】的电子通知书信息，其文件地址为【' + url + '】。请核查！')
                //   this.pdfinfo.loading = false

                //   return false
                // }

                const pagewidth = page.getWidth()

                // console.log('pageWidth', pagewidth)

                if (pagewidth > pagewidth_A4) {
                  // 2.说明比A4宽，计算缩放比例
                  const zoom = pagewidth_A4 / pagewidth
                  // 3.按zoom的比值进行缩放

                  page.scale(zoom, zoom)
                  // page.scaleContent(zoom, zoom)
                }

                const pageheight = page.getHeight() // 获取页面高度

                // 如果页面高度小于A4纸的大小，需要将高度设成A4大小

                const pagesize_A4 = jsPDF.A4
                console.log('pagesize_A4', pagesize_A4)

                console.log('pagesize-height', pageheight)

                if (pageheight < pageheight_A4) {
                  const addHeight = pageheight_A4 - pageheight
                  page.setHeight(pageheight_A4) // A4大小
                  // page.scaleContent(0.5, 0.5);
                }

                pdfNewDoc.addPage(page)
                allfilename.push(file)

                // console.log('after add page')
              }
            }
          }
        }
      }

      // 在pdf左上角添加标签信息，每一页都加上页码

      let pages = pdfNewDoc.getPages()
      const printtime = caseapi.util.getTodayDate('{yyyy}-{mm}-{dd} {hh}:{min}:{ss}')
      const helveticaFont = await pdfNewDoc.embedFont(StandardFonts.Helvetica)

      for (let i = 0; i < pages.length; i++) {
        let page = pages[i]
        const { height } = page.getSize()

        const row = allfilename[i]
        console.log('row:', row)
        // const noticenum = row['noticenum']
        // const caseinfo = row['ah']

        // const helveticaFont = await pdfNewDoc.embedFont(StandardFonts.Helvetica)
        const text = '(' + (i + 1) + ' / ' + pages.length + ')   ' + '    ' + printtime
        // 添加页数显示

        page.drawText(text, {
          x: 10,
          y: height - 35, // 从底下往上算
          size: 10,
          font: helveticaFont, // 不支持中文
          color: rgb(0, 0, 0) // 黑色
        })

        // const text_caseinfo = noticenum
        // page.drawText(text_caseinfo, {
        //   x: 10,
        //   y: height - 25, // 从底下往上算
        //   size: 10,
        //   font: helveticaFont, // 不支持中文
        //   color: rgb(0, 0, 0) // 黑色
        // })
      }
      const newpdf = await pdfNewDoc.save()
      this.pdfinfo.loading = false
      return newpdf
    },
    // 获取所有的pdf文件，并填充至key为url的变量中
    async getAllPdf(filelist) {
      let allpdf = {}

      console.log('getAllPdf', filelist)

      this.pdfinfo.total = filelist.length
      this.pdfinfo.done = 0
      this.pdfinfo.loading = true
      for (let i in filelist) {
        const file = filelist[i]
        const url = file['url']
        if (!allpdf[url]) {
          try {
            const filedata64 = await caseapi.shgy.tzd_getpdf(url)
            const filedata = caseapi.util.pdf_base64_to_byte(filedata64)
            allpdf[url] = filedata
          } catch (e) {
            // this.$message.error('获取文件失败!' + url)
            // console.log(file)
            this.$alert(
              '无法加载通知书【' +
                file['noticenum'] +
                '】的电子通知书信息，其文件地址为【' +
                url +
                '】。请核查！'
            )

            this.pdfinfo.loading = false

            return false
          }
        }
        this.pdfinfo.done++

        // const fileurl = caseapi.util.pdf_getObjectURL(filedata)
      }

      this.pdf_allfile = allpdf
      this.pdfinfo.loading = false

      return true
    },

    async refreshPdf() {
      this.pdfinfo.loading = true
      const pdffile = await this.createPdfFile(this.pdf_checked, this.info.filelist)
      if (!pdffile) {
        return false
      }
      const fileurl = caseapi.util.pdf_getObjectURL(pdffile)
      // 显示地址
      this.pdfinfo.loading = false
      this.$refs['pdfiframe'].src = fileurl
    },
    async saveAndPrint() {
      // 先组合所有的文件
      this.doPrint()
      setTimeout(() => {
        // 判断签收
        this.checkin_select()
      }, 1000)
    },
    checkin_select() {
      console.log('info', this.info)
      let allnotice = []

      const maxnotice = 20
      let allnoticeText = ''
      for (let i = 0; i < this.info.notice.length; i++) {
        if (i < maxnotice) {
          allnotice.push(this.info.notice[i])
        } else {
          break
        }
      }
      allnoticeText = allnotice.join('、')
      if (allnotice.length !== this.info.notice.length) {
        allnoticeText += ' 等' + this.info.notice.length + '个通知书'
      }

      this.$confirm(
        '您确定要签收' +
          this.info.notice.length +
          '笔通知书信息吗？通知书号为' +
          allnoticeText +
          '',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 执行数据签收
        caseapi.shgy.tzd_checkin(this.info.type, this.info.notice, 1).then((res) => {
          if (res.code === 20000) {
            this.$alert('签收成功！')
            setTimeout(() => {
              this.showWindow = false
            }, 1000) // 1 秒后关闭窗口
          } else {
            this.$alert('签收失败：' + res.message)
          }
        })
      })
    }

    // 20230830新增，额外判断pdf页面大小，如果太大（宽度太大），则自动缩放至A4大小。
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
