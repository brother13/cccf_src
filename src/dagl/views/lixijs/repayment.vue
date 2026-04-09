<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>还款计划计算</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="resetForm"
        >
          重置
        </el-button>
      </div>

      <el-form ref="form" :model="form" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="本金（元）" prop="principal" :rules="[{ required: true, message: '请输入本金' }]">
              <el-input-number
                v-model="form.principal"
                :precision="2"
                :min="0"
                style="width: 100%"
                placeholder="请输入本金金额"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年利率（%）" prop="rate" :rules="[{ required: true, message: '请输入年利率' }]">
              <el-input-number
                v-model="form.rate"
                :precision="4"
                :min="0"
                style="width: 100%"
                placeholder="请输入年利率"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="还款方式">
              <el-select v-model="form.repaymentType" style="width: 100%">
                <el-option label="等额本息" value="equal_interest" />
                <el-option label="等额本金" value="equal_principal" />
                <el-option label="先息后本" value="interest_only" />
                <el-option label="一次性还本付息" value="bullet" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="借款期限">
              <el-input-number
                v-model="form.term"
                :min="1"
                :max="360"
                style="width: 60%"
              />
              <el-select v-model="form.termUnit" style="width: 38%; margin-left: 2%">
                <el-option label="个月" value="month" />
                <el-option label="年" value="year" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="首次还款日期">
              <el-date-picker
                v-model="form.firstRepaymentDate"
                type="date"
                placeholder="选择首次还款日期"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="calc-actions">
          <el-button type="primary" size="large" @click="calculate">
            <i class="el-icon-s-marketing" /> 生成还款计划
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 还款计划结果 -->
    <el-card v-if="schedule.length > 0" class="box-card result-card">
      <div slot="header" class="clearfix">
        <span>还款计划表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="exportSchedule">
          <i class="el-icon-download" /> 导出Excel
        </el-button>
      </div>

      <el-descriptions :column="4" border style="margin-bottom: 20px;">
        <el-descriptions-item label="还款总额">{{ formatMoney(totalAmount) }} 元</el-descriptions-item>
        <el-descriptions-item label="支付利息">{{ formatMoney(totalInterest) }} 元</el-descriptions-item>
        <el-descriptions-item label="每期还款">{{ formatMoney(averagePayment) }} 元</el-descriptions-item>
        <el-descriptions-item label="期数">{{ schedule.length }} 期</el-descriptions-item>
      </el-descriptions>

      <el-table :data="schedule" border stripe max-height="500">
        <el-table-column type="index" label="期数" width="60" align="center" />
        <el-table-column prop="date" label="还款日期" width="120" align="center" />
        <el-table-column prop="payment" label="本期还款" width="150" align="right">
          <template slot-scope="scope">
            {{ formatMoney(scope.row.payment) }}
          </template>
        </el-table-column>
        <el-table-column prop="principal" label="本金" width="150" align="right">
          <template slot-scope="scope">
            {{ formatMoney(scope.row.principal) }}
          </template>
        </el-table-column>
        <el-table-column prop="interest" label="利息" width="150" align="right">
          <template slot-scope="scope">
            {{ formatMoney(scope.row.interest) }}
          </template>
        </el-table-column>
        <el-table-column prop="remaining" label="剩余本金" width="150" align="right">
          <template slot-scope="scope">
            {{ formatMoney(scope.row.remaining) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
// LPR数据缓存（从新到旧排序）
const lprData = [
  { date: '2026-03-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2026-02-24', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2026-01-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-12-22', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-11-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-10-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-09-22', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-08-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-07-21', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-06-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-05-20', rate_1y: 3.00, rate_5y: 3.50 },
  { date: '2025-04-21', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2025-03-20', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2025-02-20', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2025-01-20', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2024-12-20', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2024-11-20', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2024-10-21', rate_1y: 3.10, rate_5y: 3.60 },
  { date: '2024-09-20', rate_1y: 3.35, rate_5y: 3.85 },
  { date: '2024-08-20', rate_1y: 3.35, rate_5y: 3.85 },
  { date: '2024-07-22', rate_1y: 3.35, rate_5y: 3.85 },
  { date: '2024-06-20', rate_1y: 3.45, rate_5y: 3.95 },
  { date: '2024-05-20', rate_1y: 3.45, rate_5y: 3.95 },
  { date: '2024-04-22', rate_1y: 3.45, rate_5y: 3.95 },
  { date: '2024-03-20', rate_1y: 3.45, rate_5y: 3.95 },
  { date: '2024-02-20', rate_1y: 3.45, rate_5y: 3.95 },
  { date: '2024-01-22', rate_1y: 3.45, rate_5y: 4.20 },
  { date: '2023-12-20', rate_1y: 3.45, rate_5y: 4.20 },
  { date: '2023-11-20', rate_1y: 3.45, rate_5y: 4.20 },
  { date: '2023-10-20', rate_1y: 3.45, rate_5y: 4.20 },
  { date: '2023-09-20', rate_1y: 3.45, rate_5y: 4.20 },
  { date: '2023-08-21', rate_1y: 3.45, rate_5y: 4.20 },
  { date: '2023-07-20', rate_1y: 3.55, rate_5y: 4.20 },
  { date: '2023-06-20', rate_1y: 3.55, rate_5y: 4.20 },
  { date: '2023-05-22', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2023-04-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2023-03-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2023-02-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2023-01-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2022-12-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2022-11-21', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2022-10-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2022-09-20', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2022-08-22', rate_1y: 3.65, rate_5y: 4.30 },
  { date: '2022-07-20', rate_1y: 3.70, rate_5y: 4.45 },
  { date: '2022-06-20', rate_1y: 3.70, rate_5y: 4.45 },
  { date: '2022-05-20', rate_1y: 3.70, rate_5y: 4.45 },
  { date: '2022-04-20', rate_1y: 3.70, rate_5y: 4.60 },
  { date: '2022-03-21', rate_1y: 3.70, rate_5y: 4.60 },
  { date: '2022-02-21', rate_1y: 3.70, rate_5y: 4.60 },
  { date: '2022-01-20', rate_1y: 3.70, rate_5y: 4.60 },
  { date: '2021-12-20', rate_1y: 3.80, rate_5y: 4.65 },
  { date: '2021-11-22', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-10-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-09-22', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-08-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-07-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-06-21', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-05-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-04-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-03-22', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-02-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2021-01-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-12-21', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-11-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-10-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-09-21', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-08-20', rate_1y: 3.85, rate_5y: 4.65 }
]

// 贷款基准利率数据（2020-08-20前使用）
const benchmarkData = [
  // 2014年11月22日之后（新利率体系）
  { date: '2015-10-24', '1y': 4.35, '1y_5y': 4.75, '5y_plus': 4.90 },
  { date: '2015-08-26', '1y': 4.60, '1y_5y': 5.00, '5y_plus': 5.15 },
  { date: '2015-06-28', '1y': 4.85, '1y_5y': 5.25, '5y_plus': 5.40 },
  { date: '2015-05-11', '1y': 5.10, '1y_5y': 5.50, '5y_plus': 5.65 },
  { date: '2015-03-01', '1y': 5.35, '1y_5y': 5.75, '5y_plus': 5.90 },
  { date: '2014-11-22', '1y': 5.60, '1y_5y': 6.00, '5y_plus': 6.15 },
  // 2014年11月22日之前（旧利率体系）
  { date: '2012-07-06', '6m': 5.60, '6m_1y': 6.00, '1y_3y': 6.15, '3y_5y': 6.40, '5y_plus': 6.55 },
  { date: '2012-06-08', '6m': 5.85, '6m_1y': 6.31, '1y_3y': 6.40, '3y_5y': 6.65, '5y_plus': 6.80 },
  { date: '2011-07-07', '6m': 6.10, '6m_1y': 6.56, '1y_3y': 6.65, '3y_5y': 6.90, '5y_plus': 7.05 },
  { date: '2011-04-06', '6m': 5.85, '6m_1y': 6.31, '1y_3y': 6.40, '3y_5y': 6.65, '5y_plus': 6.80 },
  { date: '2011-02-09', '6m': 5.60, '6m_1y': 6.06, '1y_3y': 6.10, '3y_5y': 6.45, '5y_plus': 6.60 },
  { date: '2010-12-26', '6m': 5.35, '6m_1y': 5.81, '1y_3y': 5.85, '3y_5y': 6.22, '5y_plus': 6.40 },
  { date: '2010-10-20', '6m': 5.10, '6m_1y': 5.56, '1y_3y': 5.60, '3y_5y': 5.96, '5y_plus': 6.14 }
]

export default {
  name: 'RepaymentPlan',
  data() {
    return {
      form: {
        principal: undefined,
        rate: undefined,
        repaymentType: 'equal_interest',
        term: 12,
        termUnit: 'month',
        firstRepaymentDate: ''
      },
      schedule: [],
      totalAmount: 0,
      totalInterest: 0,
      averagePayment: 0
    }
  },
  methods: {
    calculate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return

        const { principal, rate, repaymentType, term, termUnit, firstRepaymentDate } = this.form

        // 统一转换为月
        const months = termUnit === 'year' ? term * 12 : term
        const monthlyRate = rate / 100 / 12

        this.schedule = []
        let remainingPrincipal = principal
        let totalInterest = 0
        let totalPayment = 0

        // 计算首次还款日期
        let currentDate = firstRepaymentDate ? new Date(firstRepaymentDate) : new Date()

        switch (repaymentType) {
          case 'equal_interest':
            // 等额本息
            const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1)

            for (let i = 1; i <= months; i++) {
              const interestPayment = remainingPrincipal * monthlyRate
              const principalPayment = monthlyPayment - interestPayment
              remainingPrincipal -= principalPayment

              if (remainingPrincipal < 0.01) remainingPrincipal = 0

              this.schedule.push({
                period: i,
                date: this.formatDate(currentDate),
                payment: monthlyPayment,
                principal: principalPayment,
                interest: interestPayment,
                remaining: remainingPrincipal
              })

              totalPayment += monthlyPayment
              totalInterest += interestPayment

              // 下一个月
              currentDate = this.addMonth(currentDate)
            }
            this.averagePayment = monthlyPayment
            break

          case 'equal_principal':
            // 等额本金
            const monthlyPrincipal = principal / months

            for (let i = 1; i <= months; i++) {
              const interestPayment = remainingPrincipal * monthlyRate
              const monthlyPayment = monthlyPrincipal + interestPayment
              remainingPrincipal -= monthlyPrincipal

              if (remainingPrincipal < 0.01) remainingPrincipal = 0

              this.schedule.push({
                period: i,
                date: this.formatDate(currentDate),
                payment: monthlyPayment,
                principal: monthlyPrincipal,
                interest: interestPayment,
                remaining: remainingPrincipal
              })

              totalPayment += monthlyPayment
              totalInterest += interestPayment

              currentDate = this.addMonth(currentDate)
            }
            this.averagePayment = this.schedule.length > 0 ? this.schedule[0].payment : 0
            break

          case 'interest_only':
            // 先息后本
            const monthlyInterest = principal * monthlyRate

            for (let i = 1; i < months; i++) {
              this.schedule.push({
                period: i,
                date: this.formatDate(currentDate),
                payment: monthlyInterest,
                principal: 0,
                interest: monthlyInterest,
                remaining: principal
              })

              totalPayment += monthlyInterest
              totalInterest += monthlyInterest

              currentDate = this.addMonth(currentDate)
            }

            // 最后一期还本
            const lastPayment = principal + monthlyInterest
            this.schedule.push({
              period: months,
              date: this.formatDate(currentDate),
              payment: lastPayment,
              principal: principal,
              interest: monthlyInterest,
              remaining: 0
            })

            totalPayment += lastPayment
            totalInterest += monthlyInterest
            this.averagePayment = monthlyInterest
            break

          case 'bullet':
            // 一次性还本付息
            const totalInterestAmount = principal * monthlyRate * months
            const bulletPayment = principal + totalInterestAmount

            currentDate = this.addMonth(currentDate, months)

            this.schedule.push({
              period: 1,
              date: this.formatDate(currentDate),
              payment: bulletPayment,
              principal: principal,
              interest: totalInterestAmount,
              remaining: 0
            })

            totalPayment = bulletPayment
            totalInterest = totalInterestAmount
            this.averagePayment = bulletPayment
            break
        }

        this.totalAmount = totalPayment
        this.totalInterest = totalInterest
      })
    },

    formatDate(date) {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    addMonth(date, months = 1) {
      const d = new Date(date)
      d.setMonth(d.getMonth() + months)
      return d
    },

    formatMoney(amount) {
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    resetForm() {
      this.$refs.form.resetFields()
      this.form.repaymentType = 'equal_interest'
      this.form.term = 12
      this.form.termUnit = 'month'
      this.schedule = []
    },

    exportSchedule() {
      // 简单的CSV导出
      let csv = '期数,还款日期,本期还款,本金,利息,剩余本金\n'
      this.schedule.forEach(row => {
        csv += `${row.period},${row.date},${row.payment},${row.principal},${row.interest},${row.remaining}\n`
      })

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `还款计划表_${new Date().getTime()}.csv`
      link.click()
    }
  }
}
</script>

<style lang="scss" scoped>
.calc-actions {
  text-align: center;
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;

  .el-button {
    padding: 12px 30px;
  }
}

.result-card {
  margin-top: 20px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
</style>
