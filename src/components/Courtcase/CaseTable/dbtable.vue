<template>
  <div v-bind="$attrs" style="display: inline" v-on="$listeners">
    <pagination
      v-if="tableData && tableData.total"
      v-show="tableData && tableData.total > 0"
      :total="tableData && tableData.total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />

    <el-table
      v-if="tableData"
      :key="tableKey"
      v-loading="listLoading"
      :data="tableData.items"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column type="index" width="80" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>

      <template v-for="field in tableData.field">
        <template v-if="field.show">
          <el-table-column
            :key="field.field"
            :label="field.label"
            :prop="field.field"
            :align="field.align ? field.align : 'center'"
            :width="field.width ? field.width : 120"
            :sortable="field.order ? 'custom' : false"
          >
            <template slot-scope="{ row }">
              <template v-if="field.align == 'right'">
                {{ formatNumber(row[field.field]) }}
              </template>
              <template v-else>
                {{ row[field.field] }}
              </template>
            </template>
          </el-table-column>
        </template>
      </template>

      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-dropdown
            split-button
            type="primary"
            icon="el-icon-edit"
            trigger="click"
            @click="showDetail(row)"
            @command="handleCommand"
          >
            <i class="el-icon-edit" />详情
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                icon="el-icon-time"
                :command="{ id: 'showDetail', data: row }"
              >查看详情</el-dropdown-item>
              <el-dropdown-item
                icon="el-icon-document-copy"
                :command="{ id: 'copyJson', data: row }"
              >复制为JSON</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-dialogDrag
      title="详情"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-descriptions class="margin-top" :column="2" border>
        <el-descriptions-item v-for="(item, index) in temp" :key="index" :label="index">
          {{ item }}
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">关闭</el-button>
      </div>
    </el-dialog>
    <LoadingProgress ref="progress" @cancel="stopExport" />
  </div>
</template>

<script>
/**
 * 便捷生成各页面的列表，便于今后统一调整与管理
 */
import caseapi from '@/courtcase/api'
import {
  saveAs
} from 'file-saver'
import LoadingProgress from '@/components/Courtcase/LoadingProgress'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'CaseTable',
  components: { Pagination, LoadingProgress },
  filters: {
    statusFilter(status) {
      return status === 0 ? 'success' : 'danger'
    }
  },
  props: {
    // 报表类型
    typeid: {
      type: Number,
      default: 1
    },
    // 表格列名

    // 是否显示状态列
    showStatus: {
      type: Boolean,
      default: false
    },
    // 是否显示选择框
    showCheckbox: {
      type: Boolean,
      default: false
    },
    // 是否加载中的状态
    listLoading: {
      type: Boolean,
      default: false
    },
    // 表格名称
    tableName: {
      type: String,
      default: 'table'
    },
    // 表格数据
    tableData: {
      type: Object,
      default: function() {
        return { total: 0, items: [] }
      }
    },
    query: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      tableKey: '', // 表主键
      // listLoading: false, // 正在加载中
      isExporting: false, // 正在导出的状态
      downloadLoading: false,
      config: null,
      // 导出时的数据情况
      dialogFormVisible: false,
      temp: null,
      listQuery: {
        page: 1,
        pagesize: 10,
        sort: '',
        type: 1
      },
      // tableField: [],

      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 2000 // 默认分页数
      },
      export: {
        title: '',
        header: [],
        field: []
      }
    }
  },

  computed: {
    tableField() {
      if (!this.tableData) {
        return []
      }
      const testData = this.tableData.items[0]
      console.log(testData)

      const allfield = []
      for (const i in testData) {
        const field = { field: i, label: i }
        allfield.push(field)
      }
      console.log(allfield)
      return allfield
    }
  },

  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.tableKey = 'table_' + Math.random()
      this.config = await caseapi.base.getBillConfig()
      // this.listQuery.pagesize = this.config.defaultPagesize || 10 // 默认10
      this.initField()
    },
    // 初始化 导出的列表
    initField() {
      this.export.header = []
      this.export.field = []
      // this.tableField = []
      this.export.title = this.tableName
      if (!this.tableData || !this.tableData.items.length) {
        return false
      }
      const testData = this.tableData.items[0]

      // let allfield = []
      for (const i in testData) {
        this.export.header.push(i)
        // this.export.field.push(i)

        const field = { field: i, label: i }
        this.export.field.push(field)
      }
      // this.tableField = allfield
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },
    stopExport() {
      this.isExporting = false
    },
    sortChange(data) {
      const { prop, order } = data
      const order2 = order === 'ascending' ? 'asc' : 'desc'
      this.listQuery.sort = prop + ' ' + order2
      this.getList()
    },
    changeCheck() {},
    handleUpdate(row) {
      // 显示详情页面

      this.emit('edit', row)
    },
    getList() {
      const data = {
        page: this.listQuery.page,
        pagesize: this.listQuery.pagesize,
        sort: this.listQuery.sort,
        type: this.typeid
      }
      this.emit('pagination', data)
      // this.$emit('change', 'pagination', data)
    },
    /**
     * 统一的反馈路径
     *
     */
    emit(action, data) {
      // let param = Object.assign({}, data)
      this.$emit('change', action, data)
    },
    afterPrint() {},
    checkAndJump(query) {
      // const page = query.path
      // const cururl = this.$route.path
      // if (page === cururl) {
      //   // this.checkUrl()
      // }
    },
    async exportTable(param, func, filetype = 'xlsx') {
      // console.log('exportTable', param, func)
      // console.log(this.config)
      this.initField()

      const maxnum = this.config.ExportConfirmNum
      const total = this.tableData.total || 0
      // 判断数据量有没有超过1000条，如果未超1000条，则不分段
      const pagemax = 2000

      if (this.config.exportConfirm) {
        try {
          const confirm = await this.$confirm(
            '当前列表共' + total + '笔，是否确认导出?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          console.log(confirm)
        } catch (e) {
          // 说明点击了取消
          return
        }
      }

      if (total > maxnum) {
        // 做提示
        try {
          const confirm = await this.$confirm(
            '当前记录数超过' + maxnum + '笔,导出可能较慢,是否继续导出?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          console.log(confirm)
        } catch (e) {
          // 说明点击了取消
          return
        }
      }

      // let query = Object.assign({}, this.listQuery)
      // query.page = 1
      // query.pagesize = 999999
      // caseapi.report.getCaseYeBill(query).then((res) => {
      //   const alldata = res.items
      //   this.handleDownload(alldata)
      // })

      // 以下改用分页导出数据的方法，用以实现超大数据量级的导出

      if (total <= pagemax) {
        const query = Object.assign({}, param)
        // query.flesh = 0
        this.isExporting = true // 标志 是否正在导出

        query.page = 1
        query.pagesize = pagemax
        const res = await func(query)
        // console.log('after call func', func)
        const data = res.items
        this.handleDownload(data, filetype)
        setTimeout(() => {
          this.isExporting = false
          this.hideProgress()
        }, 500)
      } else {
        this.exportstatus.total = this.tableData.total
        this.exportstatus.done = 0
        this.exportstatus.page = 1
        this.exportstatus.totalpage = Math.floor(
          this.tableData.total / this.exportstatus.pagesize
        )
        if (
          this.tableData.total >
          this.exportstatus.pagesize * this.exportstatus.totalpage
        ) {
          this.exportstatus.totalpage++ // 判断分页
        }
        const alldata = []
        this.isExporting = true // 标志 是否正在导出
        this.showProgress(
          '正在读取数据',
          this.exportstatus.done,
          this.exportstatus.total
        )
        for (let i = 1; i <= this.exportstatus.totalpage; i++) {
          if (!this.isExporting) {
            this.$message.error('已取消')
            return false
            // break
          }
          const query = Object.assign({}, param)
          // query.flesh = 0
          query.page = i
          query.pagesize = this.exportstatus.pagesize
          // console.log('before call func', func, query)
          const res = await func(query)
          // console.log('after call func', func)
          const data = res.items
          this.showProgress(
            '正在合并数据',
            this.exportstatus.done,
            this.exportstatus.total
          )

          for (let idx = 0; idx < data.length; idx++) {
            const row = data[idx]
            row['_index'] = (i - 1) * this.exportstatus.pagesize + idx + 1
            alldata.push(row)
          }
          this.exportstatus.done += data.length
          // alldata = alldata.concat(data) // 合并数组
          this.showProgress(
            '正在读取数据',
            this.exportstatus.done,
            this.exportstatus.total
          )
        }
        if (this.isExporting && alldata.length) {
          this.showProgress(
            '开始合并数据生成Excel',
            this.exportstatus.done,
            this.exportstatus.total
          )

          this.handleDownload(alldata, filetype)
        }

        setTimeout(() => {
          this.isExporting = false
          this.hideProgress()
        }, 1000)
      }
    },
    showProgress(title, num, total) {
      try {
        this.$refs['progress'].showInfo(title, num, total)
      } catch (e) {
        // console.log(e)
      }
    },
    hideProgress() {
      try {
        this.$refs['progress'].close()
      } catch (e) {
        // console.log(e)
      }
    },
    // stopExport() {
    //   this.isExporting = false
    // },

    // 生成xlsx的文件
    handleDownload(alldata, filetype = 'xlsx') {
      if (filetype === 'csv') {
        this.handleDownload_CSV(alldata)
        return
      }
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = this.export.header
        const filterVal = this.export.field
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          sheetname: this.export.title,
          // filename: "table-list"
          filename: this.export.title
        })
        this.downloadLoading = false
      })
    },

    handleDownload_CSV(alldata) {
      this.downloadLoading = true
      const tHeader = this.export.header
      const filterVal = this.export.field
      const data = this.formatJson(filterVal, alldata)
      const filename = this.export.title + '.csv'
      this.createCSV(filename, tHeader, data)

      this.downloadLoading = false
    },

    // 创建csv文件
    createCSV(filename, header, data) {
      console.log('createCSV', header, data.length)
      const filedata = []
      // 先加头信息
      const row = []
      for (let i = 0; i < header.length; i++) {
        let field = header[i]
        field = this.cvs_replaceQuote(field)
        row.push(field)
      }
      const str = '"' + row.join('","') + '"'
      filedata.push(str)

      // 将data也这样加进来
      for (let i = 0; i < data.length; i++) {
        const row = data[i]

        const str = '"' + row.join('","') + '"'
        filedata.push(str)
      }
      // 将filedata以\r\n来分开
      const csvdata = filedata.join('\r\n')
      // 将csv内容用saveas保存
      saveAs(new Blob([csvdata], { type: 'text/plain;charset=utf-8' }), filename)
    },
    // 将双引号替换
    cvs_replaceQuote(str) {
      if (str.indexOf('"') > -1) {
        str = str.replace(/"/g, '""')
      }
      return str
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((field) => {
          const j = field.field
          let value = v[j]
          if (field.align && field.align === 'right') {
            // 数字
            value = this.formatNumber(value)
            value = value.replace(/,/g, '')
            if (value === '-') {
              value = 0
            }
            return value - 0
          }

          return value
          // if (j === 'timestamp') {
          //   return parseTime(v[j])
          // } else {
          //   return v[j]
          // }
        })
      )
    },
    formatJson_CSV(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((field) => {
          const j = field.field
          let value = v[j]
          if (field.align && field.align === 'right') {
            // 数字
            value = this.formatNumber(value)
            value = value.replace(/,/g, '')
            if (value === '-') {
              value = 0
            }
            return value - 0
          }

          return value
          // if (j === 'timestamp') {
          //   return parseTime(v[j])
          // } else {
          //   return v[j]
          // }
        })
      )
    },
    showDetail(data) {
      this.temp = Object.assign({}, data)
      this.dialogFormVisible = true
    },

    handleCommand(command) {
      const { id, data } = command
      switch (id) {
        case 'showDetail': // 编辑
          this.showDetail(data)
          break
        case 'copyJson': // 复制为json数据
          this.copyJson(data)
          break

        default:
        // do nothing
      }

      const param = { id: id, data: data }
      this.emit('command', param)
    },
    copyJson(data) {
      const str = JSON.stringify(data)
      this.copyToPaste(str)
    },
    copyToPaste(text) {
      var domUrl = document.createElement('textarea')

      domUrl.value = text
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    }
  }
}
</script>

<style></style>
