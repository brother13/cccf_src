<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入案号关键字"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <el-input
        v-if="canQueryAll"
        v-model="listQuery.cbr"
        clearable
        placeholder="经办人"
        style="width: 120px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <el-input
        v-model="listQuery.skr"
        clearable
        placeholder="收款人"
        style="width: 120px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <span class="filter-item">出账日期：</span>
      <el-date-picker
        v-model="listQuery.starttime"
        type="date"
        placeholder="起始日期"
        style="width: 140px"
        value-format="yyyy-MM-dd"
        class="filter-item"
      />
      <span class="filter-item">~</span>
      <el-date-picker
        v-model="listQuery.endtime"
        type="date"
        placeholder="截止日期"
        style="width: 140px"
        value-format="yyyy-MM-dd"
        class="filter-item"
      />

      <span class="filter-item">出账状态：</span>
      <el-select
        v-model="listQuery.czzt"
        style="width: 120px"
        class="filter-item"
        clearable
        placeholder="全部"
        @change="handleFilter"
      >
        <el-option
          v-for="(item, index) in czztList"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        style="margin-left: 10px"
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

    <div v-if="total > 0" class="courtcase-countinfo">
      当前记录数 <el-tag>{{ total }}</el-tag> 笔
    </div>

    <el-table
      v-loading="listLoading"
      :data="tableData"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="index" width="80" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>

      <el-table-column
        label="案号"
        prop="ah"
        align="center"
        min-width="200"
        show-overflow-tooltip
      />

      <el-table-column
        label="退回金额"
        prop="je"
        align="right"
        width="120"
      >
        <template slot-scope="{ row }">
          {{ formatNumber(row.je) }}
        </template>
      </el-table-column>

      <el-table-column
        label="经办人"
        prop="cbr"
        align="center"
        width="100"
      />

      <el-table-column
        label="出账日期"
        prop="czdate"
        align="center"
        width="120"
      />

      <el-table-column
        label="出账状态"
        prop="czzt"
        align="center"
        width="100"
      />

      <el-table-column
        label="收款人"
        prop="skr"
        align="center"
        width="120"
      />

      <el-table-column
        label="收款人账号"
        prop="skr_account"
        align="center"
        min-width="180"
        show-overflow-tooltip
      />

      <el-table-column
        label="收款人开户行"
        prop="skr_bank"
        align="center"
        min-width="200"
        show-overflow-tooltip
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import { thqdList } from '@/dagl/api/thqd'

const czztList = [
  { value: '', label: '全部' },
  { value: '已出账', label: '已出账' },
  { value: '未出账', label: '未出账' }
]

export default {
  name: 'ThqdList',
  components: { Pagination },
  directives: { waves },

  data() {
    return {
      tableData: [],
      total: 0,
      listLoading: true,
      isExporting: false,

      listQuery: {
        page: 1,
        pagesize: 10,
        keyword: '',
        cbr: '',
        skr: '',
        starttime: '',
        endtime: '',
        czzt: ''
      },

      czztList: czztList,

      exportFields: [
        { field: 'ah', label: '案号', width: 30 },
        { field: 'je', label: '退回金额', width: 15 },
        { field: 'cbr', label: '经办人', width: 12 },
        { field: 'czdate', label: '出账日期', width: 12 },
        { field: 'czzt', label: '出账状态', width: 12 },
        { field: 'skr', label: '收款人', width: 15 },
        { field: 'skr_account', label: '收款人账号', width: 25 },
        { field: 'skr_bank', label: '收款人开户行', width: 30 }
      ]
    }
  },

  computed: {
    canQueryAll() {
      const roles = this.$store.state.user.roles || []
      return roles.includes('THQD_QUERY_ALL')
    }
  },

  created() {
    this.getList()
  },

  methods: {
    async getList() {
      this.listLoading = true
      try {
        const res = await thqdList(this.listQuery)
        const data = res.data || {}
        this.tableData = data.items || []
        this.total = data.total || 0
      } catch (error) {
        console.error('获取退回清单失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.listLoading = false
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    formatNumber(num) {
      if (!num) return '-'
      // 如果已经是带逗号的字符串，先去掉逗号
      const cleanNum = String(num).replace(/,/g, '')
      return parseFloat(cleanNum).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    async handleExport() {
      if (this.total === 0) {
        this.$message.warning('没有数据可导出')
        return
      }

      try {
        await this.$confirm(
          `当前列表共 ${this.total} 笔记录，是否确认导出？`,
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

      this.isExporting = true
      this.$message.info('正在准备导出数据...')

      try {
        // 获取所有数据
        const query = { ...this.listQuery, page: 1, pagesize: 99999 }
        const res = await thqdList(query)
        const resData = res.data || {}
        const allData = resData.items || []

        // 导出 Excel
        const excel = await import('@/vendor/Export2Excel')
        const tHeader = this.exportFields.map(f => f.label)
        const filterVal = this.exportFields.map(f => f.field)
        const data = this.formatJson(filterVal, allData)

        const d = new Date()
        const dateStr = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0')
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '退回清单_' + dateStr,
          autoWidth: true,
          bookType: 'xlsx'
        })

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败')
      } finally {
        this.isExporting = false
      }
    },

    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          const value = v[j]
          if (j === 'je' && value) {
            return parseFloat(String(value).replace(/,/g, ''))
          }
          return value || ''
        })
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-item {
  margin-left: 10px;
}
.courtcase-countinfo {
  margin: 10px 0;
  font-size: 14px;
}
</style>
