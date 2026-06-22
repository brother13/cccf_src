<template>
  <div class="app-container">
    <div>
      <!-- 查询条件 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          clearable
          placeholder="请输入关键字（案号、承办人、当事人、案由）"
          style="width: 350px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>

        <el-select v-model="listQuery.datetype" style="width: 120px" class="filter-item">
          <el-option label="到账日期" value="dzdate" />
          <el-option label="出账日期" value="czdate" />
        </el-select>

        <el-date-picker
          v-model="listQuery.starttime"
          type="date"
          placeholder="起始日期"
          value-format="yyyy-MM-dd"
          style="width: 140px"
          class="filter-item"
        />
        <span class="filter-item">~</span>
        <el-date-picker
          v-model="listQuery.endtime"
          type="date"
          placeholder="截止日期"
          value-format="yyyy-MM-dd"
          style="width: 140px"
          class="filter-item"
        />

        <span class="filter-item">计算方式：</span>
        <el-select v-model="listQuery.summary_mode" style="width: 140px" class="filter-item" @change="handleFilter">
          <el-option label="案号+收据号" value="bill_case" />
          <el-option label="只按案号" value="case_only" />
        </el-select>

        <span class="filter-item">停留时间：</span>
        <el-select v-model="listQuery.days_range" style="width: 130px" class="filter-item" clearable placeholder="全部">
          <el-option label="全部" value="" />
          <el-option label="超过15日" value="15" />
          <el-option label="超过一个月" value="30" />
          <el-option label="超过三个月" value="90" />
          <el-option label="超过一年" value="250" />
        </el-select>

        <span class="filter-item">余额：</span>
        <el-select v-model="listQuery.balance_filter" style="width: 110px" class="filter-item" clearable placeholder="全部">
          <el-option label="全部" value="" />
          <el-option label="无余额" value="0" />
          <el-option label="有余额" value="1" />
        </el-select>

        <el-input
          v-if="canQueryAll"
          v-model="listQuery.cbr"
          clearable
          placeholder="承办人"
          style="width: 120px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>

        <template v-if="canCalculateBalance">
          <el-divider direction="vertical" />

          <span class="filter-item">余额截止日期：</span>
          <el-date-picker
            v-model="listQuery.balance_endtime"
            type="date"
            placeholder="余额截止日期"
            value-format="yyyy-MM-dd"
            style="width: 150px"
            class="filter-item"
          />

          <el-button
            v-waves
            class="filter-item"
            type="danger"
            icon="el-icon-refresh"
            :loading="isRecalcing"
            @click="handleRecalc"
          >计算</el-button>
        </template>

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          :disabled="isExporting"
          :icon="isExporting ? 'el-icon-loading' : 'el-icon-download'"
          @click="handleExport"
        >导出</el-button>
      </div>

      <!-- 数据统计 -->
      <div v-if="count.num" class="courtcase-countinfo">
        当前记录数
        <el-tag> {{ count.num }} </el-tag>
        笔，收款总额<el-tag>{{ formatNumber(count.sk_je) }}</el-tag>元，
        退款总额<el-tag>{{ formatNumber(count.tk_je) }}</el-tag>元，
        余额<el-tag>{{ formatNumber(count.ye) }}</el-tag>元
      </div>

      <pagination
        v-show="count.num > 0"
        :total="count.num"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pagesize"
        @pagination="getList"
      />

      <!-- 数据表格 -->
      <el-table
        v-loading="listLoading"
        :data="tableData"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" width="60" align="center" label="序号">
          <template slot-scope="{ $index }">
            {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
          </template>
        </el-table-column>

        <template v-for="field in fieldList">
          <el-table-column
            v-if="field.show !== false"
            :key="field.field"
            :label="field.label"
            :prop="field.field"
            :align="field.align || 'center'"
            :width="field.width || 120"
          >
            <template slot-scope="{ row }">
              <span v-if="field.align === 'right'">{{ formatNumber(row[field.field]) }}</span>
              <span v-else-if="field.field === 'workdays'">{{ row.workdays != null ? row.workdays + ' 天' : '-' }}</span>
              <span v-else>{{ row[field.field] || '-' }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <div v-if="count.num" class="courtcase-countinfo">
        当前记录数
        <el-tag> {{ count.num }} </el-tag>
        笔，收款总额<el-tag>{{ formatNumber(count.sk_je) }}</el-tag>元，
        退款总额<el-tag>{{ formatNumber(count.tk_je) }}</el-tag>元，
        余额<el-tag>{{ formatNumber(count.ye) }}</el-tag>元
      </div>

      <pagination
        v-show="count.num > 0"
        :total="count.num"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pagesize"
        @pagination="getList"
      />
    </div>

    <div id="temp_html2text" style="display: none" />
    <LoadingProgress ref="progress" @cancel="stopExport" />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import caseapi from '@/courtcase/api'
import LoadingProgress from '@/components/Courtcase/LoadingProgress'

const fieldList = [
  { field: 'djcode', label: '进账票号', export: true, show: true, width: 130 },
  { field: 'ah', label: '案号', export: true, show: true, width: 220 },
  { field: 'dsr', label: '当事人', export: true, show: true, width: 200 },
  { field: 'sk_je', label: '收款金额', export: true, show: true, align: 'right', width: 120 },
  { field: 'tk_je', label: '退款金额', export: true, show: true, align: 'right', width: 120 },
  { field: 'ye', label: '余额', export: true, show: true, align: 'right', width: 120 },
  { field: 'dzdate', label: '到账日期', export: true, show: true, width: 120 },
  { field: 'czdate', label: '出账日期', export: true, show: true, width: 120 },
  { field: 'workdays', label: '停留时间(天)', export: true, show: true, width: 120 },
  { field: 'cbr', label: '承办人', export: true, show: true, width: 100 },
  { field: 'sjy', label: '书记员', export: true, show: true, width: 100 },
  { field: 'cbbm', label: '承办部门', export: true, show: true, width: 150 },
  { field: 'yg', label: '申请人', export: true, show: true, width: 150 },
  { field: 'bg', label: '被执行人', export: true, show: true, width: 150 },
  { field: 'ay', label: '案由', export: true, show: true, width: 200 },
  { field: 'skr', label: '收款人', export: true, show: true, width: 120 },
  { field: 'skr_bank', label: '收款人开户行', export: true, show: true, width: 200 },
  { field: 'yh_zt', label: '延缓提存', export: true, show: true, width: 120 }
]

const PAGECONFIG = {
  pagename: '执行款台账汇总表',
  pagecode: 'sk_tk_summary'
}

export default {
  name: PAGECONFIG.pagecode + 'Table',
  components: {
    Pagination,
    LoadingProgress
  },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      listLoading: true,
      fieldList: fieldList,
      tableData: [],

      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: '',
        cbr: '',
        starttime: '',
        endtime: '',
        datetype: 'dzdate',
        days_range: '',
        balance_filter: '',
        summary_mode: 'bill_case',
        sort: '',
        balance_endtime: new Date().toISOString().slice(0, 10),
        force_recalc: false,
        refresh_summary: false
      },

      count: {
        num: 0,
        sk_je: 0,
        tk_je: 0,
        ye: 0
      },

      export: {
        title: PAGECONFIG.pagename,
        header: [],
        field: [],
        field2: []
      },

      isRecalcing: false,
      isExporting: false,
      exportstatus: {
        total: 0,
        done: 0,
        page: 1,
        totalpage: 0,
        pagesize: 5000
      }
    }
  },

  computed: {
    canQueryAll() {
      const roles = this.$store.getters.roles || []
      return roles.includes('ZXTZ_QUERY_ALL') || roles.includes('admin')
    },
    canCalculateBalance() {
      const roles = this.$store.getters.roles || []
      return roles.includes('ZXTZ_CALCULATE_LEDGER')
    }
  },

  created() {
    this.initExport()
    this.getList()
  },

  methods: {
    initExport() {
      this.export.header = []
      this.export.field = []
      this.export.field2 = []
      for (let i = 0; i < this.fieldList.length; i++) {
        const field = this.fieldList[i]
        if (field.export === true) {
          this.export.header.push(field.label)
          this.export.field.push(field.field)
          this.export.field2.push(field)
        }
      }
    },

    async getList() {
      this.listLoading = true
      try {
        const res = await caseapi.plugins.queryList_sk_tk_summary(this.listQuery)
        this.count = res.total || { num: 0, sk_je: 0, tk_je: 0, ye: 0 }
        this.tableData = res.items || []
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
        throw error
      } finally {
        this.listLoading = false
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    handleRecalc() {
      if (!this.listQuery.balance_endtime) {
        this.$message.warning('请选择余额截止日期')
        return
      }
      this.listQuery.page = 1
      this.listQuery.force_recalc = true
      this.listQuery.refresh_summary = true
      this.isRecalcing = true
      this.getList().then(() => {
        this.isRecalcing = false
        this.listQuery.force_recalc = false
        this.listQuery.refresh_summary = false
      }).catch(() => {
        this.isRecalcing = false
        this.listQuery.force_recalc = false
        this.listQuery.refresh_summary = false
      })
    },

    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },

    tableRowClassName({ row }) {
      const wd = row.workdays
      if (wd !== null && wd !== undefined) {
        if (wd > 30) {
          return 'row-danger'
        } else if (wd > 15) {
          return 'row-warning'
        }
      }
      return ''
    },

    async handleExport() {
      const maxnum = 5000
      try {
        await this.$confirm(
          '当前列表共' + this.count.num + '笔，是否确认导出?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch (e) {
        return
      }

      if (this.count.num > maxnum) {
        try {
          await this.$confirm(
            '当前记录数超过' + maxnum + '笔,导出可能较慢,是否继续导出?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch (e) {
          return
        }
      }

      this.exportstatus.total = this.count.num
      this.exportstatus.done = 0
      this.exportstatus.page = 1
      this.exportstatus.totalpage = Math.floor(this.count.num / this.exportstatus.pagesize)
      if (this.count.num > this.exportstatus.pagesize * this.exportstatus.totalpage) {
        this.exportstatus.totalpage++
      }

      const alldata = []
      this.isExporting = true
      this.showProgress('正在读取数据', this.exportstatus.done, this.exportstatus.total)

      for (let i = 1; i <= this.exportstatus.totalpage; i++) {
        if (!this.isExporting) {
          this.$message.error('已取消')
          return false
        }
        const query = Object.assign({}, this.listQuery)
        query.page = i
        query.pagesize = this.exportstatus.pagesize
        const res = await caseapi.plugins.queryList_sk_tk_summary(query)
        const data = res.items || []
        for (let idx = 0; idx < data.length; idx++) {
          const row = data[idx]
          row._index = (i - 1) * this.exportstatus.pagesize + idx + 1
          alldata.push(row)
        }
        this.exportstatus.done += data.length
        this.showProgress('正在读取数据', this.exportstatus.done, this.exportstatus.total)
      }

      if (this.isExporting && alldata.length) {
        this.handleDownload(alldata)
      }

      setTimeout(() => {
        this.isExporting = false
        this.hideProgress()
      }, 500)
    },

    showProgress(title, num, total) {
      try {
        this.$refs.progress.showInfo(title, num, total)
      } catch (e) {
        console.error(e)
      }
    },

    hideProgress() {
      try {
        this.$refs.progress.close()
      } catch (e) {
        console.error(e)
      }
    },

    stopExport() {
      this.isExporting = false
    },

    handleDownload(alldata) {
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['序号', ...this.export.header]
        const filterVal = ['_index', ...this.export.field]
        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.export.title,
          autoWidth: true,
          maxWidth: 80
        })
      })
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map((v) =>
        filterVal.map((j) => {
          const field = this.fieldList.find((f) => f.field === j)
          if (field && field.align === 'right') {
            const value = this.formatNumber(v[j]).replace(/,/g, '')
            return value === '-' ? 0 : value - 0
          }
          if (j === 'workdays') {
            return v[j] != null ? v[j] + ' 天' : '-'
          }
          return v[j] || '-'
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
}

.courtcase-countinfo {
  margin: 10px 0;
}
</style>

<style>
.el-table .row-danger {
  background: rgb(253, 226, 226);
}

.el-table .row-warning {
  background: rgb(250, 236, 216);
}
</style>
