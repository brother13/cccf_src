<template>
  <div class="app-container">
    <div>
      <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx, .xls" @change="handleClick">
      <div class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
        将excel文件拖到此处或点击目录加载数据
        <el-button :loading="loading" icon="el-icon-folder-opened" style="margin-left:16px;" size="mini" type="primary" @click="handleUpload">
          目录
        </el-button>
        <el-button :loading="loading" icon="el-icon-delete-solid" style="margin-left:16px;" size="mini" type="primary" @click="qingkong">
        清空
        </el-button>
        <el-button :loading="loading" icon="el-icon-upload2" style="margin-left:16px;" size="mini" type="primary" @click="uploaddata">
          导入
        </el-button>
      </div>
    </div>



    <el-table :data="tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
      <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
    </el-table>

  </div>
</template>

<script>
import XLSX from 'xlsx'
  import {
    postdata
  } from '@/dagl/api/common'
  import {
    Savecccf
  } from '@/dagl/api/common'

export default {
  data() {
    return {
      tableData: [],
      tableHeader: [],
      loading: false,
      excelOKnum:0,
    }
  },
  methods: {
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1

      if (isLt1M) {
        return true
      }

      this.$message({
        message: '不支持处理超过1兆的文件',
        type: 'warning'
      })
      return false
    },
    uploaddata() {
      // 判断是否要删除
      this.$confirm('此操作将新增条'+this.tableData.length+'记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading=true
        Savecccf(this.tableData).then(response => {
          if(response.data.code==20000){
            this.$notify({
              title: '操作成功',
              message: '操作成功，成功上传'+response.data.cnum+"条记录",
              type: 'success',
              duration: 10000
            })
            this.loading=false
          }
        })
      })

    },
    qingkong() {
      this.tableData=[]
      this.tableHeader=[]
    },
    handleDrop(e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.loading) return
      const files = e.dataTransfer.files
      if (files.length !== 1) {
        this.$message.error('单次仅可上传一个文件!')
        return
      }
      const rawFile = files[0] // only use files[0]

      if (!this.isExcel(rawFile)) {
        this.$message.error('仅支持 .xlsx, .xls, 类型文件')
        return false
      }
      this.upload(rawFile)
      e.stopPropagation()
      e.preventDefault()
    },
    handleDragover(e) {
      e.stopPropagation()
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    handleClick(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      this.upload(rawFile)
    },
    upload(rawFile) {
      this.$refs['excel-upload-input'].value = null // fix can't select the same excel

      if (!this.beforeUpload) {
        this.readerData(rawFile)
        return
      }
      const before = this.beforeUpload(rawFile)
      if (before) {
        this.readerData(rawFile)
      }
    },
    readerData(rawFile) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const workbook = XLSX.read(data, {
            type: 'array'
          })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const header = this.getHeaderRow(worksheet)
          const results = XLSX.utils.sheet_to_json(worksheet, {
            range: 1
          }) //标题不取第一行

         for (let i = 0; i < header.length; i++) {
            // 遍历数组，对日期进行调整
            if(header[i].includes("日期")){
              for(let j = 0; j < results.length; j++){
                results[j][header[i]]=this.formatExcelDate(results[j][header[i]])
              }
            }
          }
          this.tableHeader=header
          this.excelOKnum=0

          this.testrow(header,"案号")
          this.testrow(header,"承办人")
          this.testrow(header,"查封开始日期")
          this.testrow(header,"查封届满日期")
          console.log(this.excelOKnum)
          if(this.excelOKnum<4){
            this.tableData=[]
            this.loading = false
          }else{
            this.tableData=results
            this.loading = false
          }
          resolve()
        }
        reader.readAsArrayBuffer(rawFile)
      })
    },
    getHeaderRow(sheet) {
      const headers = []
      const range = XLSX.utils.decode_range(sheet['!ref'])
      let C
      const R = range.s.r + 1; //range.s.r + 1不取第一行
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({
          c: C,
          r: R
        })]
        /* find the cell in the first row */
        let hdr = 'UNKNOWN ' + C // <-- replace with your desired default
        if (cell && cell.t) {//表头有数据，则添加到表头
            hdr = XLSX.utils.format_cell(cell)
            headers.push(hdr)
          }
      }
      return headers
    },
    isExcel(file) {
      return /\.(xlsx|xls)$/.test(file.name)
    },
    formatExcelDate(num, format = '-') {
      if (!/^\d+$/.test(num)) return
      num = parseInt(num)
      let millisecond = 0 // 转化后的毫秒数
      if (num > 60) { // 对大于60的日期进行减1处理
        millisecond = (num - 25568 - 1) * 3600 * 24 * 1000
      } else {
        millisecond = (num - 25568) * 3600 * 24 * 1000
      }
      const date = new Date(millisecond) // 根据转化后的毫秒数获取对应的时间
      const yy = date.getFullYear()
      const m = date.getMonth() + 1
      const mm = m >= 10 ? m : '0' + m
      const d = date.getDate()
      const dd = d >= 10 ? d : '0' + d
      return yy + format + mm + format + dd // 返回格式化后的日期
    },
    testrow(header,str){
      if(header.indexOf(str) === -1){
        this.$message.error('缺少列【'+str+"】,请修改")
      }else{
        this.excelOKnum=this.excelOKnum+1
      }

    }
  }
}
</script>
<style scoped>
  .excel-upload-input {
    display: none;
    z-index: -9999;
  }

  .drop {
    border: 2px dashed #bbb;
    width: 98%;
    height: 100px;
    line-height: 100px;
    margin: 0 auto;
    font-size: 24px;
    border-radius: 5px;
    text-align: center;
    color: #bbb;
    position: relative;
  }
</style>
