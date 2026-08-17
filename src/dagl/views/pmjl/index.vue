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

      <el-select
        v-model="listQuery.status"
        clearable
        placeholder="状态"
        style="width: 150px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in filterOptions.status" :key="item" :label="item" :value="item" />
      </el-select>

      <el-select
        v-model="listQuery.pmjd"
        clearable
        placeholder="拍卖阶段"
        style="width: 130px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option v-for="item in filterOptions.pmjd" :key="item" :label="item" :value="item" />
      </el-select>

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

    <div v-if="total > 0" class="courtcase-countinfo">
      当前记录数 <el-tag>{{ total }}</el-tag> 笔
    </div>

    <el-table
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
    handleReset() {
      this.listQuery = {
        page: 1,
        pagesize: this.listQuery.pagesize,
        keyword: '',
        status: '',
        pmjd: '',
        cbr: this.currentUser,
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
</style>
