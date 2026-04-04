<template>
  <div class="app-container">
    <div class="filter-container">
      起始时间
      <el-date-picker
        v-model="listQuery.starttime"
        type="date"
        placeholder="起始日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />
      截止时间
      <el-date-picker
        v-model="listQuery.endtime"
        type="date"
        placeholder="截止日期"
        style="width: 150px"
        value-format="yyyy-MM-dd"
      />

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >统计</el-button>

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      stripe
      fit
      highlight-current-row
      style="width: 100%;"
      height="600px"
      @selection-change="changeCheck"
    >

      <el-table-column label="部门" prop="deptname" align="center" width="200" />
      <el-table-column label="承办人" prop="cbrmc" align="center" width="200" />
      <el-table-column label="案件数" prop="ajnum" align="center" width="220" />
      <el-table-column label="发起查控次数" prop="cknum" align="center" width="180" />
      <el-table-column label="平均发起天数" prop="days" align="center" width="250" />

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { postdata } from '@/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'CbrTable',
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
        page: 1,
        pagesize: 100,

        starttime: '',
        endtime: ''
      },
      checkedList: [],
      querytimeList: [],

      type: 'bank',
      // 导出的相关配置
      export: {
        title: '银行存款表',
        header: [
          'ID',
          '承办部门',
          '承办人',
          '案号',
          '立案日期',
          '立案标的',
          '当事人',
          '开户行',
          '银行账号',
          '余额',
          '可用余额',
          '查询发起时间',
          '反馈时间',
          '更新查询时间',
          '处理时间',
          '处理说明'
        ],
        field: [
          'id',
          'deptname',
          'cbr',
          'ah',
          'larq',
          'labd',
          'bzxr',
          'khh',
          'khxx',
          'ye',
          'kyye',
          'querytime',
          'fksj',
          'updateTime',
          'readtime',
          'readnote'
        ]
      },

      temp: {
        id: 0,
        ahdm: '',
        ah: '',
        bzxr: '',
        khh: '',
        khxx: '',
        ye: '',
        kyye: '',
        note: '',
        readed: 0,
        readtime: '',
        readnote: ''
      }
    }
  },

  created() {
    this.init()
    this.getList()
  },
  methods: {
    init() {
      postdata('/data/list', { type: 'querytime' }).then((res) => {
        const resdata = res.data
        this.querytimeList = resdata.items
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/zxlc/countcbr', this.listQuery).then((response) => {
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
        ahdm: '',
        ah: '',
        bzxr: '',
        khh: '',
        khxx: '',
        ye: '',
        kyye: '',
        note: '',
        readed: 0,
        readtime: '',
        readnote: ''
      }
    },

    handleExport() {
      // 导出数据
      postdata('/zxlc/down', this.listQuery).then((res) => {
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
        this.listQuery.sort = prop + '+'
      } else if (order === 'descending') {
        this.listQuery.sort = prop + '-'
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
</style>
