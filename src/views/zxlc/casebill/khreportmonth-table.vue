<template>
  <div class="app-container">
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.month"
        type="month"
        placeholder="月份"
        style="width: 150px"
        value-format="yyyy-MM"
      />

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >统计</el-button>
      <!-- <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleExport"
      >导出</el-button> -->

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border

      fit
      highlight-current-row
      style="width: 100%;"
      height="600px"
      :row-class-name="tableRowClassName"
    >
      <!-- <el-table-column type="selection" label="选择" /> -->
      <!-- <el-table-column
      type="index"
      label="序号"
      align="center"
      width="50"
      :index="indexMethod"> -->

      <!-- </el-table-column> -->
      <el-table-column label="日期" prop="month" align="center" width="120" />
      <el-table-column label="案件数量" prop="case" align="center" width="80" />

      <el-table-column label="保全数量" prop="bq" align="center" width="120" />
      <el-table-column label="执异数量" prop="zy" align="center" width="120" />
      <el-table-column label="非保全执异" prop="nobq" align="center" width="120" />
      <el-table-column label="查询次数" prop="query" align="center" width="120" />
      <el-table-column label="查询案件数量" prop="querycase" align="center" width="120" />
      <el-table-column label="扣划记录数" prop="kh" align="center" width="180" />

    </el-table>

  </div>
</template>

<script>
import { postdata } from '@/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'KhcasereportmonthTable',
  components: { Pagination },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      downloadLoading: false,
      dialogFormVisible: false,
      saveLoading: false,
      listQuery: {
        type: 'day',
        month: '2021-07'
      },
      checkedList: [],
      querytimeList: [],

      type: 'khcasereportmonth',
      // 导出的相关配置
      export: {
        title: '查询汇总统计表（日期）',
        header: [
          '日期',
          '案件数量',
          '保全案件数量',
          '执异案件数量',
          '非保全执异案件数量',
          '查询次数',
          '扣划记录数'

        ],
        field: [
          'month',
          'case',
          'bq',
          'zy',
          'nobq',
          'query',
          'kh'
        ]
      },

      temp: {
        id: 0,
        djcode: '',
        kxly: '',
        skdate: '',
        zhidandate: '',
        je: '',
        ye2: '',
        jkdw: '',
        fullaccount: '',
        idkey: ''
      }
    }
  },

  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      const month = this.$route.query.month

      if (month) {
        this.listQuery.month = month
      }
    },
    tableRowClassName({ row, rowIndex }) {
      if (row.querycase != row.nobq) {
        return 'warning-row'
      } else {
        return ''
      }
      return ''
    },
    indexMethod(index) {
      return (this.listQuery.page - 1) * this.listQuery.pagesize + index + 1
    },
    getList() {
      this.listLoading = true
      postdata('/casebill/khcasereport', this.listQuery).then((response) => {
        this.list = response.data
        this.total = response.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    saveRead() {
      this.saveLoading = true
      const data = {
        type: this.type,
        id: this.temp.id,
        readed: this.temp.readed,
        readtime: this.temp.readtime,
        readnote: this.temp.readnote
      }

      postdata('/zxlc/updateread', data).then((res) => {
        this.$message(res.message)
        this.saveLoading = false
        this.dialogFormVisible = false
        this.getList()
      })
    },

    resetTemp() {
      this.temp = {
        id: 0,
        djcode: '',
        kxly: '',
        skdate: '',
        zhidandate: '',
        je: '',
        ye2: '',
        jkdw: '',
        fullaccount: '',
        idkey: ''
      }
    },

    handleExport() {
      // 导出数据
      postdata('/casebill/khcasereport', this.listQuery).then((res) => {
        const alldata = res.data
        this.handleDownload(alldata)
      })
    },

    handleBatch(row) {
      this.temp = {
        id: this.checkedList,
        readed: false,
        readtime: parseTime(new Date()),
        readnote: ''
      }

      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    handleRead(row) {
      this.temp = Object.assign({}, row) // copy obj

      // 初始化阅读时间

      if (this.temp.readtime === '' || this.temp.readtime == null) {
        this.temp.readtime = parseTime(new Date())
      }

      this.temp.readed = this.temp.readed === 1
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    changeCheck(val) {
      this.checkedList = []
      val.forEach((item) => {
        this.checkedList.push(item.id)
      })
    },

    handleDownload(alldata) {
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
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    sortChange(data) {
      const { prop, order } = data
      if (order === 'ascending') {
        this.listQuery.sort = prop + ' asc'
      } else if (order === 'descending') {
        this.listQuery.sort = prop + ' desc'
      } else {
        this.listQuery.sort = null
      }
      this.handleFilter()
    }
  }
}
</script>
<style>
.money {
  font-size: 16px;
  color: #f56c6c;
}
.el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
