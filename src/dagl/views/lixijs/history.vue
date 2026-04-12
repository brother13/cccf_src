<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>计算历史</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="loadHistory"
        >
          <i class="el-icon-refresh" /> 刷新
        </el-button>
      </div>

      <!-- 查询条件 -->
      <el-form :model="query" inline class="query-form">
        <el-form-item label="案号">
          <el-input v-model="query.caseNo" placeholder="请输入案号" clearable />
        </el-form-item>
        <el-form-item label="当事人">
          <el-input v-model="query.parties" placeholder="请输入当事人" clearable />
        </el-form-item>
        <el-form-item label="计算日期">
          <el-date-picker
            v-model="query.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 历史列表 -->
      <el-table
        v-loading="loading"
        :data="historyList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="50" align="center" />
        <el-table-column prop="caseNo" label="案号" min-width="150" />
        <el-table-column prop="parties" label="当事人" min-width="120" />
        <el-table-column prop="principal" label="本金（元）" width="120" align="right">
          <template slot-scope="scope">
            {{ formatMoney(scope.row.principal) }}
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="利率" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.rate }}% ({{ getRateTypeText(scope.row.rateType) }})
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="起息日期" width="100" align="center" />
        <el-table-column prop="endDate" label="截止日期" width="100" align="center" />
        <el-table-column prop="totalAmount" label="应付总额（元）" width="140" align="right">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">
              {{ formatMoney(scope.row.totalAmount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="calcTime" label="计算时间" width="150" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="viewDetail(scope.row)">查看</el-button>
            <el-button type="danger" size="mini" @click="deleteHistory(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page="query.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="query.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog title="计算详情" :visible.sync="detailVisible" width="700px">
      <el-descriptions v-if="currentDetail" :column="2" border>
        <el-descriptions-item label="案号">{{ currentDetail.caseNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当事人">{{ currentDetail.parties || '-' }}</el-descriptions-item>
        <el-descriptions-item label="本金">{{ formatMoney(currentDetail.principal) }} 元</el-descriptions-item>
        <el-descriptions-item label="利率">{{ currentDetail.rate }}% ({{ getRateTypeText(currentDetail.rateType) }})</el-descriptions-item>
        <el-descriptions-item label="计算方式">{{ currentDetail.calcType === 'simple' ? '单利' : '复利' }}</el-descriptions-item>
        <el-descriptions-item label="计息天数">{{ currentDetail.days }} 天</el-descriptions-item>
        <el-descriptions-item label="起息日期">{{ currentDetail.startDate }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ currentDetail.endDate }}</el-descriptions-item>
        <el-descriptions-item label="一般债务利息">{{ formatMoney(currentDetail.normalInterest) }} 元</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.calcDelayInterest" label="迟延履行利息">{{ formatMoney(currentDetail.delayInterest) }} 元</el-descriptions-item>
        <el-descriptions-item label="还款总额">{{ formatMoney(currentDetail.totalRepayment) }} 元</el-descriptions-item>
        <el-descriptions-item label="剩余本金">{{ formatMoney(currentDetail.remainingPrincipal) }} 元</el-descriptions-item>
        <el-descriptions-item label="应付总额" :span="2">
          <span style="color: #f56c6c; font-size: 18px; font-weight: bold;">
            {{ formatMoney(currentDetail.totalAmount) }} 元
          </span>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="currentDetail && currentDetail.repaymentList && currentDetail.repaymentList.length > 0" style="margin-top: 20px;">
        <h4>还款记录</h4>
        <el-table :data="currentDetail.repaymentList" border size="small">
          <el-table-column type="index" label="序号" width="50" align="center" />
          <el-table-column prop="repaymentDate" label="还款日期" width="120" align="center" />
          <el-table-column prop="amount" label="还款金额" width="120" align="right">
            <template slot-scope="scope">
              {{ formatMoney(scope.row.amount) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="还款类型" width="100" align="center">
            <template slot-scope="scope">
              {{ getRepaymentTypeText(scope.row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCalculationHistory, deleteCalculation } from '@/dagl/api/lixijs'

export default {
  name: 'CalculationHistory',
  data() {
    return {
      loading: false,
      historyList: [],
      total: 0,
      query: {
        caseNo: '',
        parties: '',
        dateRange: [],
        page: 1,
        pageSize: 10
      },
      detailVisible: false,
      currentDetail: null
    }
  },
  created() {
    this.loadHistory()
  },
  methods: {
    loadHistory() {
      this.loading = true
      const params = {
        page: this.query.page,
        pagesize: this.query.pageSize,
        caseNo: this.query.caseNo,
        parties: this.query.parties,
        startDate: this.query.dateRange && this.query.dateRange[0],
        endDate: this.query.dateRange && this.query.dateRange[1]
      }

      getCalculationHistory(params).then(res => {
        this.historyList = res.data || []
        this.total = res.total || 0
      }).finally(() => {
        this.loading = false
      })
    },

    search() {
      this.query.page = 1
      this.loadHistory()
    },

    resetQuery() {
      this.query = {
        caseNo: '',
        parties: '',
        dateRange: [],
        page: 1,
        pageSize: 10
      }
      this.loadHistory()
    },

    handleSizeChange(size) {
      this.query.pageSize = size
      this.loadHistory()
    },

    handleCurrentChange(page) {
      this.query.page = page
      this.loadHistory()
    },

    viewDetail(row) {
      this.currentDetail = row
      this.detailVisible = true
    },

    deleteHistory(row) {
      this.$confirm('确定删除该计算记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCalculation({ id: row.id }).then(() => {
          this.$message.success('删除成功')
          this.loadHistory()
        })
      })
    },

    formatMoney(amount) {
      if (amount === undefined || amount === null) return '-'
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    getRateTypeText(type) {
      const map = { year: '年', month: '月', day: '日' }
      return map[type] || type
    },

    getRepaymentTypeText(type) {
      const map = {
        interest_first: '先息后本',
        principal_first: '先本后息',
        both: '本息一起'
      }
      return map[type] || type
    }
  }
}
</script>

<style lang="scss" scoped>
.query-form {
  margin-bottom: 20px;
}
</style>
