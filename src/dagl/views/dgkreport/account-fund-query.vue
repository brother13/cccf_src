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
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
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
  createAccountFundListQuery,
  getDefaultAccountFundDateRange,
  getAccountFundQueryConfig
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
      tableData: [],
      count: {
        num: 0,
        je: 0
      },
      listQuery: {
        page: 1,
        pagesize: 10,
        dateRange: getDefaultAccountFundDateRange(),
        keyword: ''
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
      this.getList()
    }
  },
  created() {
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
    resetList() {
      this.listQuery.page = 1
      this.tableData = []
      this.count = {
        num: 0,
        je: 0
      }
    },
    formatNumber(value) {
      const num = parseFloat(value)
      if (isNaN(num)) {
        return '0.00'
      }
      return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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
