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
          <el-option label="全部" value="" />
          <el-option label="无延缓" value="1" />
          <el-option label="有延缓" value="2" />
        </el-select>

        <el-select v-model="listQuery.cqstatus" clearable placeholder="超期情况" style="width: 150px" class="filter-item">
          <el-option label="全部" value="" />
          <el-option label="未超期" value="1" />
          <el-option label="即将超期" value="2" />
          <el-option label="已超期" value="3" />
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
          icon="el-icon-download"
          @click="handleExport"
        >导出</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="listLoading"
        :data="list"
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
            :sortable="field.order ? 'custom' : false"
          >
            <template slot-scope="{ row }">
              <span v-if="field.align === 'right'">{{ formatNumber(row[field.field]) }}</span>
              <span v-else>{{ row[field.field] }}</span>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.pagesize"
        @pagination="getList"
      />
    </div>

    <div id="temp_html2text" style="display: none" />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import caseapi from '@/courtcase/api'

// 重新定义字段列表
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

export default {
  name: 'CaseyeBillnoTable',
  components: {
    Pagination
  },
  directives: { waves },

  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      fieldList: fieldList,

      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: '',
        yhstatus: '',
        cqstatus: ''
      },

      downloadLoading: false
    }
  },

  created() {
    this.getList()
    this.initExport()
  },

  methods: {
    // 初始化导出字段
    initExport() {
      this.exportHeader = []
      this.exportField = []
      for (let i = 0; i < this.fieldList.length; i++) {
        const field = this.fieldList[i]
        if (field.export === true) {
          this.exportHeader.push(field.label)
          this.exportField.push(field.field)
        }
      }
    },

    // 获取列表数据
    async getList() {
      this.listLoading = true
      try {
        const res = await caseapi.plugins.queryList_sk_direct(this.listQuery)
        this.list = res.items || []
        this.total = res.total || 0
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
      this.downloadLoading = true
      try {
        const query = {
          ...this.listQuery,
          page: 1,
          pagesize: 99999
        }
        const res = await caseapi.plugins.queryList_sk_direct(query)
        const alldata = res.items || []

        // 添加序号
        for (let i = 0; i < alldata.length; i++) {
          alldata[i]._index = i + 1
        }

        const excel = await import('@/vendor/Export2Excel')
        const tHeader = ['序号', ...this.exportHeader]
        const filterVal = ['_index', ...this.exportField]

        const data = this.formatJson(filterVal, alldata)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '代管款台账'
        })
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      } finally {
        this.downloadLoading = false
      }
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          const field = this.fieldList.find(f => f.field === j)
          if (field && field.align === 'right') {
            return this.formatNumber(v[j]).replace(/,/g, '') - 0
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
</style>

<style>
.el-table .row-danger {
  background: rgb(253, 226, 226);
}

.el-table .row-warning {
  background: rgb(250, 236, 216);
}
</style>
