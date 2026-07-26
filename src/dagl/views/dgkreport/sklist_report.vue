<template>
  <div class="app-container">
    <div>
      <!-- 简化后的查询条件 -->
      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          clearable
          placeholder="请输入关键字（案号、承办人、申请人、被执行人、案由、来源）"
          style="width: 400px"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        >
          <i slot="prefix" class="el-input__icon el-icon-search" />
        </el-input>

        <el-select v-model="listQuery.yhstatus" clearable placeholder="是否延缓" style="width: 150px" class="filter-item">
          <el-option label="全部" :value="0" />
          <el-option label="无延缓" :value="1" />
          <el-option label="有延缓" :value="2" />
        </el-select>

        <el-select v-model="listQuery.cqstatus" clearable placeholder="超期情况" style="width: 150px" class="filter-item">
          <el-option label="全部" :value="0" />
          <el-option label="未超期" :value="1" />
          <el-option label="即将超期" :value="2" />
          <el-option label="已超期" :value="3" />
        </el-select>

        <el-button
          v-waves
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >搜索</el-button>

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
        笔，到账金额<el-tag>{{ formatNumber(count.je) }}</el-tag>元，现有余额<el-tag>{{ formatNumber(count.ye) }}</el-tag>元
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
            v-if="field.show"
            :key="field.field"
            :label="field.label"
            :prop="field.field"
            :align="field.align || 'center'"
            :width="field.width || 120"
          >
            <template slot-scope="{ row }">
              <span v-if="field.align === 'right'">{{ formatNumber(row[field.field]) }}</span>
              <span v-else>{{ row[field.field] }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <div v-if="count.num" class="courtcase-countinfo">
        当前记录数
        <el-tag> {{ count.num }} </el-tag>
        笔，到账金额<el-tag>{{ formatNumber(count.je) }}</el-tag>元，现有余额<el-tag>{{ formatNumber(count.ye) }}</el-tag>元
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

// 重新定义字段列表 - 只保留指定字段
const fieldList = [
  { field: 'ly', label: '来源', export: true, show: true, width: 100 },
  { field: 'ah', label: '案号', export: true, show: true, width: 200 },
  { field: 'cbr', label: '承办人', export: true, show: true, width: 100 },
  { field: 'je', label: '到账金额', export: true, show: true, align: 'right', width: 120 },
  { field: 'ye', label: '余额', export: true, show: true, align: 'right', width: 120 },
  { field: 'jzdate', label: '进账日期', export: true, show: true, width: 120 },
  { field: 'days', label: '留存时间', export: true, show: true, width: 100 },
  { field: 'leftdays', label: '剩余日期', export: true, show: true, width: 100 },
  { field: 'yh_zt', label: '延缓状态', export: true, show: true, width: 100 },
  { field: 'yh_reason', label: '延缓理由', export: true, show: true, width: 200 },
  { field: 'yh_enddate', label: '延缓结束日期', export: true, show: true, width: 140 },
  { field: 'ay', label: '案由', export: true, show: true, width: 200 },
  { field: 'yg', label: '申请人', export: true, show: true, width: 150 },
  { field: 'bg', label: '被执行人', export: true, show: true, width: 150 }
]

const PAGECONFIG = {
  pagename: '执行款台账',
  pagecode: 'dgkye_report'
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
        yhstatus: 0,
        cqstatus: 0,
        type: this.$route.query.type || ''
      },

      count: {
        num: 0,
        je: 0,
        ye: 0
      },

      export: {
        title: PAGECONFIG.pagename,
        header: [],
        field: [],
        field2: []
      },

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

  watch: {
    '$route.query.type'(type) {
      this.listQuery.type = type || ''
      this.listQuery.page = 1
      this.getList()
    }
  },

  created() {
    this.initExport()
    this.getList()
  },

  methods: {
    // 初始化导出字段
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

    // 获取列表数据 - 使用新的直接查询接口
    async getList() {
      this.listLoading = true
      try {
        const res = await caseapi.plugins.queryList_sk_direct(this.listQuery)
        this.count = res.total || { num: 0, je: 0, ye: 0 }
        this.tableData = res.items || []
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.listLoading = false
      }
    },

    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 格式化数字
    formatNumber(num) {
      return caseapi.util.number_format(num, 2)
    },

    // 行样式
    tableRowClassName({ row }) {
      const leftdays = row.leftdays
      if (leftdays >= 0 && leftdays <= 5) {
        return 'row-warning'
      } else if (leftdays < 0) {
        return 'row-danger'
      }
      return ''
    },

    // 导出数据
    async handleExport() {
      const maxnum = 5000
      try {
        const confirm = await this.$confirm(
          '当前列表共' + this.count.num + '笔，是否确认导出?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        console.log(confirm)
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
        const res = await caseapi.plugins.queryList_sk_direct(query)
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
        // 进度组件尚未挂载时无需处理
      }
    },

    hideProgress() {
      try {
        this.$refs.progress.close()
      } catch (e) {
        // 进度组件尚未挂载时无需处理
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
          return v[j]
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
