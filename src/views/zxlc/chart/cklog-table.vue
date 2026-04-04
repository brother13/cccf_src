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
      />截止时间
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
    <div class="Echarts">
      <div id="mainchart" style="width: 100%;height:600px;" />
    </div>
  </div>
</template>

<script>
import { postdata } from '@/api/common'

import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'

export default {
  name: 'CkLogCountTable',
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
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.type = this.type
      postdata('/zxlc/countcklog', this.listQuery).then((response) => {
        // this.list = response.data;

        // 刷新数据
        this.showCharts(response.data)

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 0.5 * 100)
      })
    },

    showCharts(data) {
      var option = {
        title: {
          text: '查控发起日志'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: data.cbr
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.date
        },
        yAxis: {
          type: 'value'
        },
        series: data.alldata
      }

      var myChart = this.$echarts.init(document.getElementById('mainchart'))

      myChart.setOption(option)
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
