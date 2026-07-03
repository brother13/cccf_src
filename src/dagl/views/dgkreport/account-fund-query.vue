<template>
  <div class="app-container account-fund-query">
    <div class="filter-container">
      <span class="filter-item">{{ config.title }}日期：</span>
      <el-date-picker
        v-model="listQuery.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="yyyy-MM-dd"
        style="width: 260px"
        class="filter-item"
        @change="handleFilter"
      />
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="案号、票号、当事人、承办人"
        style="width: 300px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
      <el-select
        v-if="queryType === 'outcome'"
        v-model="listQuery.payout_type"
        clearable
        placeholder="发放类型"
        style="width: 160px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="option in payoutTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-select
        v-if="config.payeeTypeOptions"
        v-model="listQuery.payee_type"
        clearable
        placeholder="领款人类型"
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="option in config.payeeTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
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

    <div v-if="count.num" class="courtcase-countinfo">
      当前记录数
      <el-tag>{{ count.num }}</el-tag>
      笔，{{ config.amountLabel }}合计
      <el-tag>{{ formatNumber(count.je) }}</el-tag>
      元
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
        v-for="field in config.columns"
        :key="field.field"
        :label="field.label"
        :prop="field.field"
        :align="field.align || 'center'"
        :width="field.width || 120"
      >
        <template slot-scope="{ row }">
          <template v-if="field.align === 'right'">
            {{ formatNumber(row[field.field]) }}
          </template>
          <template v-else>
            {{ row[field.field] }}
          </template>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="count.num > 0"
      :total="count.num"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pagesize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import caseapi from '@/courtcase/api'
import {
  createAccountFundExportData,
  createAccountFundListQuery,
  formatAccountFundAmount,
  getDefaultAccountFundDateRange,
  getDefaultNotaxPayoutTypeOptions,
  getAccountFundQueryConfig,
  normalizeNotaxPayoutTypeOptions
} from '@/dagl/utils/accountFundQuery'

export default {
  name: 'AccountFundQuery',
  components: {
    Pagination
  },
  directives: {
    waves
  },
  data() {
    return {
      listLoading: false,
      isExporting: false,
      tableData: [],
      count: {
        num: 0,
        je: 0
      },
      payoutTypeOptions: getDefaultNotaxPayoutTypeOptions(),
      listQuery: {
        page: 1,
        pagesize: 10,
        dateRange: getDefaultAccountFundDateRange(),
        keyword: '',
        payout_type: '',
        payee_type: ''
      }
    }
  },
  computed: {
    queryType() {
      return this.$route.meta.queryType || 'income'
    },
    config() {
      return getAccountFundQueryConfig(this.queryType)
    }
  },
  watch: {
    queryType() {
      this.resetList()
      this.loadPayoutTypeOptions()
      this.getList()
    }
  },
  created() {
    this.loadPayoutTypeOptions()
    this.getList()
  },
  methods: {
    buildQuery() {
      return createAccountFundListQuery(this.queryType, this.listQuery)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    async loadPayoutTypeOptions() {
      if (this.queryType !== 'outcome') {
        return
      }
      try {
        const config = await caseapi.plugins.notaxPayoutTypes()
        this.payoutTypeOptions = normalizeNotaxPayoutTypeOptions(config)
      } catch (error) {
        this.payoutTypeOptions = getDefaultNotaxPayoutTypeOptions()
      }
    },
    getList() {
      if (!caseapi.plugins[this.config.apiName]) {
        this.$message.error('查询接口未配置')
        return
      }

      this.listLoading = true
      caseapi.plugins[this.config.apiName](this.buildQuery()).then((res) => {
        this.count = res.total || { num: 0, je: 0 }
        this.tableData = res.items || []
      }).finally(() => {
        this.listLoading = false
      })
    },
    async handleExport() {
      const total = Number(this.count.num || 0)
      if (total === 0) {
        this.$message.warning('没有数据可导出')
        return
      }

      try {
        await this.$confirm(
          `当前列表共 ${total} 笔记录，是否确认导出？`,
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
        const query = {
          ...this.buildQuery(),
          page: 1,
          pagesize: Math.max(total, this.listQuery.pagesize)
        }
        const res = await caseapi.plugins[this.config.apiName](query)
        const allData = res.items || []
        const excel = await import('@/vendor/Export2Excel')
        const exportData = createAccountFundExportData(this.config.columns, allData)
        const now = new Date()
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

        excel.export_json_to_excel({
          header: exportData.header,
          data: exportData.data,
          filename: `${this.config.title}_${dateStr}`,
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
    resetList() {
      this.listQuery.page = 1
      this.listQuery.payout_type = ''
      this.listQuery.payee_type = ''
      this.tableData = []
      this.count = {
        num: 0,
        je: 0
      }
    },
    formatNumber(value) {
      return formatAccountFundAmount(value)
    }
  }
}
</script>

<style scoped>
.account-fund-query .filter-container {
  margin-bottom: 12px;
}

.account-fund-query .filter-item {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
