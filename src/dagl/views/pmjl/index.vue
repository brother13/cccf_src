<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        clearable
        placeholder="请输入案号、标的物、当事人等关键字"
        style="width: 300px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>

      <span class="filter-field-label">状态</span>
      <el-select
        v-model="listQuery.status"
        clearable
        placeholder="全部"
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in filterOptions.status" :key="item" :label="item" :value="item" />
      </el-select>

      <span class="filter-field-label">拍卖阶段</span>
      <el-select
        v-model="listQuery.pmjd"
        clearable
        placeholder="全部"
        style="width: 130px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in filterOptions.pmjd" :key="item" :label="item" :value="item" />
      </el-select>

      <span class="filter-field-label">办案人</span>
      <el-select
        v-model="listQuery.cbr"
        :clearable="canQueryAll"
        :disabled="!canQueryAll"
        filterable
        placeholder="办案人"
        style="width: 130px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in filterOptions.cbr" :key="item" :label="item" :value="item" />
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" icon="el-icon-refresh-left" @click="handleReset">
        重置
      </el-button>
      <el-tag
        v-if="listQuery.secondAuctionOverdue"
        class="filter-item"
        type="warning"
        closable
        @close="clearSecondAuctionOverdueFilter"
      >
        提醒筛选：二拍结束超过 7 天
      </el-tag>
    </div>

    <div class="ledger-summary">
      <div class="summary-item summary-item--blue">
        <span class="summary-value">{{ summary.case_total }}</span>
        <span class="summary-label">个案件</span>
      </div>
      <div class="summary-divider" />
      <div class="summary-item">
        <span class="summary-value">{{ summary.asset_total }}</span>
        <span class="summary-label">件标的物</span>
      </div>
      <div class="summary-divider" />
      <div class="summary-item summary-item--blue">
        <span class="summary-value">{{ summary.announcing_total }}</span>
        <span class="summary-label">件公告中</span>
      </div>
      <div class="summary-divider" />
      <div class="summary-item summary-item--warning">
        <span class="summary-value">{{ summary.pending_failure_total }}</span>
        <span class="summary-label">件流拍待确认</span>
      </div>
      <el-radio-group v-model="listQuery.viewMode" class="view-mode-switch" size="mini" @change="handleViewModeChange">
        <el-radio-button label="case">按案号</el-radio-button>
        <el-radio-button label="asset">按标的物</el-radio-button>
      </el-radio-group>
    </div>

    <el-table
      v-if="listQuery.viewMode === 'case'"
      key="case-table"
      v-loading="listLoading"
      :data="list"
      :expand-row-keys="expandedCaseKeys"
      row-key="case_key"
      border
      fit
      highlight-current-row
      class="case-table"
      style="width: 100%"
      @expand-change="handleExpandChange"
    >
      <el-table-column type="expand" width="48">
        <template slot-scope="{ row }">
          <div class="asset-detail-panel">
            <el-table :data="row.items || []" border size="mini" class="asset-detail-table">
              <el-table-column type="index" width="55" align="center" label="序号" />
              <el-table-column label="标的物名称" prop="bdmc" min-width="180" show-overflow-tooltip />
              <el-table-column label="拍卖阶段" prop="pmjd" align="center" width="85" />
              <el-table-column label="当前状态" prop="status" align="center" width="120">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.status" :class="getStatusClass(scope.row.status)" size="mini">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="拍卖平台" prop="pmpt" align="center" width="85" show-overflow-tooltip />
              <el-table-column label="开始时间" prop="pmkssj" align="center" width="145">
                <template slot-scope="scope">{{ formatDateTime(scope.row.pmkssj) }}</template>
              </el-table-column>
              <el-table-column label="结束时间" prop="pmjssj" align="center" width="145">
                <template slot-scope="scope">{{ formatDateTime(scope.row.pmjssj) }}</template>
              </el-table-column>
              <el-table-column label="报名人数" prop="bmrs" align="center" width="85" />
              <el-table-column label="起拍价" prop="qpj" align="right" width="95">
                <template slot-scope="scope">{{ formatMoney(scope.row.qpj) }}</template>
              </el-table-column>
              <el-table-column label="成交价" prop="cjj" align="right" width="95">
                <template slot-scope="scope">{{ formatMoney(scope.row.cjj) }}</template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="案号" prop="caseinfo" align="left" min-width="205" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span class="case-number">{{ row.caseinfo || '未填写案号' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="当事人" prop="dsr" align="left" min-width="220" show-overflow-tooltip />
      <el-table-column label="办案人" prop="cbr" align="center" width="95" />
      <el-table-column label="标的物数量" prop="asset_count" align="center" width="105">
        <template slot-scope="{ row }">
          <span class="asset-count">{{ row.asset_count }} 件</span>
        </template>
      </el-table-column>
      <el-table-column label="拍卖进度" align="left" min-width="155">
        <template slot-scope="{ row }">
          <span
            v-for="item in row.stage_summary || []"
            :key="item.name"
            class="summary-pill stage-pill"
          >{{ item.name }} {{ item.count }}</span>
          <span v-if="!row.stage_summary || !row.stage_summary.length" class="empty-text">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态汇总" align="left" min-width="255">
        <template slot-scope="{ row }">
          <el-tag
            v-for="item in row.status_summary || []"
            :key="item.name"
            :class="getStatusClass(item.name)"
            class="summary-status-tag"
            size="mini"
          >{{ item.name }} {{ item.count }}</el-tag>
          <span v-if="!row.status_summary || !row.status_summary.length" class="empty-text">-</span>
        </template>
      </el-table-column>
      <el-table-column label="最近节点" prop="latest_node" align="center" width="115">
        <template slot-scope="{ row }">{{ formatDate(row.latest_node) }}</template>
      </el-table-column>
    </el-table>

    <el-table
      v-else
      key="asset-table"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column type="index" width="70" align="center" label="序号">
        <template slot-scope="{ $index }">
          {{ $index + listQuery.pagesize * (listQuery.page - 1) + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="案号" prop="caseinfo" align="center" min-width="210" show-overflow-tooltip />
      <el-table-column label="办案人" prop="cbr" align="center" width="100" />
      <el-table-column label="状态" prop="status" align="center" width="120">
        <template slot-scope="{ row }">
          <el-tag v-if="row.status" :class="getStatusClass(row.status)" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="拍卖阶段" prop="pmjd" align="center" width="100" />
      <el-table-column label="标的物名称" prop="bdmc" align="center" min-width="200" show-overflow-tooltip />
      <el-table-column label="当事人" prop="dsr" align="center" min-width="160" show-overflow-tooltip />
      <el-table-column label="拍卖平台" prop="pmpt" align="center" width="120" show-overflow-tooltip />
      <el-table-column label="拍卖开始时间" prop="pmkssj" align="center" width="165" />
      <el-table-column label="拍卖结束时间" prop="pmjssj" align="center" width="165" />
      <el-table-column label="报名人数" prop="bmrs" align="center" width="90" />
      <el-table-column label="起拍价" prop="qpj" align="right" width="120">
        <template slot-scope="{ row }">{{ formatMoney(row.qpj) }}</template>
      </el-table-column>
      <el-table-column label="成交价" prop="cjj" align="right" width="120">
        <template slot-scope="{ row }">{{ formatMoney(row.cjj) }}</template>
      </el-table-column>
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
import { getPmjlFilters, getPmjlList } from '@/dagl/api/pmjl'

export default {
  name: 'PmjlList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      expandedCaseKeys: [],
      summary: {
        case_total: 0,
        asset_total: 0,
        announcing_total: 0,
        pending_failure_total: 0
      },
      filterOptions: {
        status: [],
        pmjd: [],
        cbr: []
      },
      listQuery: {
        page: 1,
        pagesize: 20,
        keyword: '',
        status: '',
        pmjd: '',
        cbr: '',
        viewMode: 'case',
        secondAuctionOverdue: this.$route.query.reminder === 'secondAuctionOverdue'
      }
    }
  },
  computed: {
    canQueryAll() {
      const roles = this.$store.getters.roles || []
      return roles.includes('PMTZ_QUERY_ALL')
    },
    currentUser() {
      return this.$store.getters.name || ''
    }
  },
  watch: {
    '$route.query.reminder'(reminder) {
      if (reminder === 'secondAuctionOverdue') {
        this.listQuery.page = 1
        this.listQuery.keyword = ''
        this.listQuery.status = ''
        this.listQuery.pmjd = ''
        this.listQuery.secondAuctionOverdue = true
        this.getList()
      }
    }
  },
  created() {
    this.listQuery.cbr = this.currentUser
    this.init()
  },
  methods: {
    async init() {
      await this.getFilters()
      await this.getList()
    },
    async getFilters() {
      try {
        const response = await getPmjlFilters()
        const data = response.data || {}
        this.filterOptions.status = data.status || []
        this.filterOptions.pmjd = data.pmjd || []
        this.filterOptions.cbr = data.cbr || []
      } catch (error) {
        this.$message.error('获取筛选条件失败')
      }
    },
    async getList() {
      this.listLoading = true
      try {
        const response = await getPmjlList(this.listQuery)
        const data = response.data || {}
        this.list = data.items || []
        this.total = data.total || 0
        this.summary = Object.assign({
          case_total: 0,
          asset_total: 0,
          announcing_total: 0,
          pending_failure_total: 0
        }, data.summary || {})
        this.expandedCaseKeys = this.listQuery.viewMode === 'case' && this.list.length
          ? [this.list[0].case_key]
          : []
      } catch (error) {
        this.$message.error('获取拍卖台账失败')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.secondAuctionOverdue = false
      this.getList()
    },
    handleViewModeChange() {
      this.listQuery.page = 1
      this.getList()
    },
    handleExpandChange(row, expandedRows) {
      this.expandedCaseKeys = expandedRows.map(item => item.case_key)
    },
    handleReset() {
      this.listQuery = {
        page: 1,
        pagesize: this.listQuery.pagesize,
        keyword: '',
        status: '',
        pmjd: '',
        cbr: this.currentUser,
        viewMode: this.listQuery.viewMode,
        secondAuctionOverdue: false
      }
      this.getList()
    },
    clearSecondAuctionOverdueFilter() {
      this.listQuery.page = 1
      this.listQuery.secondAuctionOverdue = false
      this.getList()
    },
    formatMoney(value) {
      if (value === '' || value === null || value === undefined) return '-'
      const number = Number(String(value).replace(/,/g, ''))
      return Number.isNaN(number) ? value : number.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
    },
    formatDate(value) {
      return value ? String(value).slice(0, 10) : '-'
    },
    formatDateTime(value) {
      return value ? String(value).slice(0, 16) : '-'
    },
    getStatusClass(status) {
      const classMap = {
        公告中: 'status-tag--announcing',
        未发布: 'status-tag--unpublished',
        已中止: 'status-tag--stopped',
        已撤回: 'status-tag--withdrawn',
        已暂缓: 'status-tag--postponed',
        流拍待确认: 'status-tag--pending-failure',
        已确认流拍: 'status-tag--failed',
        已确认拍成: 'status-tag--sold',
        已交纳尾款: 'status-tag--paid',
        已交接财产: 'status-tag--delivered',
        已以物抵债: 'status-tag--offset'
      }
      return ['status-tag', classMap[status] || 'status-tag--default']
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding-top: 10px;
  background: #fff;
}

.filter-container {
  padding-bottom: 0;

  .filter-item {
    margin-bottom: 4px;
  }
}

.filter-field-label {
  display: inline-block;
  margin: 0 8px 4px 4px;
  color: #475569;
  font-size: 13px;
  line-height: 36px;
  vertical-align: top;
}

.ledger-summary {
  display: flex;
  align-items: center;
  min-height: 38px;
  margin-bottom: 6px;
  padding: 0 0 4px;
  border-bottom: 1px solid #e4e7ed;
}

.view-mode-switch {
  margin-left: auto;
}

.summary-item {
  display: flex;
  align-items: baseline;
  min-width: 120px;

  &--blue .summary-value {
    color: #2563eb;
  }

  &--warning .summary-value {
    color: #d97706;
  }
}

.summary-value {
  margin-right: 6px;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.summary-label {
  color: #606266;
  font-size: 13px;
}

.summary-divider {
  width: 1px;
  height: 24px;
  margin: 0 26px;
  background: #dfe3e8;
}

.case-number {
  color: #1f2937;
  font-weight: 600;
}

.asset-count {
  display: inline-block;
  min-width: 48px;
  padding: 4px 10px;
  color: #1d4ed8;
  font-weight: 600;
  line-height: 1;
  border-radius: 12px;
  background: #eff6ff;
}

.summary-pill {
  display: inline-block;
  margin: 2px 6px 2px 0;
  padding: 3px 8px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 3px;
}

.stage-pill {
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
}

.summary-status-tag {
  margin: 2px 6px 2px 0;
}

.empty-text {
  color: #a8abb2;
}

.asset-detail-panel {
  padding: 6px 10px;
  background: #f7faff;
}

.asset-detail-table {
  width: 100%;
  font-size: 14px;

  ::v-deep th,
  ::v-deep td {
    padding: 5px 0;
  }

  ::v-deep .cell {
    line-height: 23px;
  }

  .status-tag {
    height: 24px;
    font-size: 14px;
    line-height: 22px;
  }
}

.case-table ::v-deep .el-table__expanded-cell {
  padding: 0;
}

.status-tag {
  font-weight: 500;

  &--announcing {
    color: #1d4ed8;
    background: #eff6ff;
    border-color: #93c5fd;
  }

  &--unpublished,
  &--default {
    color: #4b5563;
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  &--stopped {
    color: #b91c1c;
    background: #fef2f2;
    border-color: #fca5a5;
  }

  &--withdrawn {
    color: #9f1239;
    background: #fff1f2;
    border-color: #fda4af;
  }

  &--postponed {
    color: #92400e;
    background: #fffbeb;
    border-color: #fcd34d;
  }

  &--pending-failure {
    color: #6d28d9;
    background: #f5f3ff;
    border-color: #c4b5fd;
  }

  &--failed {
    color: #475569;
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  &--sold {
    color: #166534;
    background: #f0fdf4;
    border-color: #86efac;
  }

  &--paid {
    color: #047857;
    background: #ecfdf5;
    border-color: #6ee7b7;
  }

  &--delivered {
    color: #0f766e;
    background: #f0fdfa;
    border-color: #5eead4;
  }

  &--offset {
    color: #7c2d12;
    background: #fff7ed;
    border-color: #fdba74;
  }
}

@media (max-width: 1100px) {
  .ledger-summary {
    flex-wrap: wrap;
    gap: 4px 0;
    padding: 4px 0;
  }

  .summary-item {
    min-width: 105px;
  }

  .summary-divider {
    margin: 0 14px;
  }
}
</style>
