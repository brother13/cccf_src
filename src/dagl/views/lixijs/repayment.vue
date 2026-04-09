<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>还款计划计算（执行案件专用）</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="resetForm">
          重置
        </el-button>
      </div>

      <el-form ref="form" :model="form" label-width="160px">
        <!-- 基本信息 -->
        <el-divider>基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="债务金额（元）" prop="principal" :rules="[{ required: true, message: '请输入债务金额' }]">
              <el-input-number v-model="form.principal" :precision="2" :min="0" style="width: 100%" placeholder="请输入债务金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="正常履行金额（元）">
              <el-input-number v-model="form.paidAmount" :precision="2" :min="0" style="width: 100%" placeholder="已履行金额（从债务金额中减去）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="利率类型">
              <el-radio-group v-model="form.rateSourceType">
                <el-radio label="auto">基准利率与LPR自动分段</el-radio>
                <el-radio label="custom">自定义利率</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.rateSourceType === 'custom'" :span="12">
            <el-form-item label="自定义利率（日利率 %）" prop="customRate" :rules="[{ required: form.rateSourceType === 'custom', message: '请输入日利率' }]">
              <el-input-number v-model="form.customRate" :precision="6" :min="0" style="width: 100%" placeholder="请输入日利率，如0.05表示万分之五" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="form.rateSourceType === 'auto'" :gutter="20">
          <el-col :span="12">
            <el-form-item label="LPR档次">
              <el-radio-group v-model="form.lprLevel">
                <el-radio label="1y">1年期LPR</el-radio>
                <el-radio label="5y">5年期以上LPR</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="还款类型">
              <el-radio-group v-model="form.repaymentType">
                <el-radio label="interest_first">先息后本</el-radio>
                <el-radio label="principal_first">先本后息</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 日期设置 -->
        <el-divider>日期设置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="利息起算日期" prop="interestStartDate" :rules="[{ required: true, message: '请选择日期' }]">
              <el-date-picker v-model="form.interestStartDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="延迟履行利息起算" prop="delayInterestStartDate">
              <el-date-picker v-model="form.delayInterestStartDate" type="date" placeholder="判决履行期满日" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate" :rules="[{ required: true, message: '请选择日期' }]">
              <el-date-picker v-model="form.endDate" type="date" placeholder="默认当天" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计算类型">
              <el-checkbox v-model="form.calcDelayInterest">计算加倍利息（迟延履行利息）</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 中途还款记录 -->
        <el-divider>中途还款记录</el-divider>
        <el-row>
          <el-col :span="24">
            <el-button type="primary" size="small" style="margin-bottom: 15px;" @click="addRepayment">
              <i class="el-icon-plus" /> 添加还款
            </el-button>
          </el-col>
        </el-row>

        <el-table v-if="repayments.length > 0" :data="repayments" border style="margin-bottom: 20px;">
          <el-table-column label="还款日期" width="200">
            <template slot-scope="scope">
              <el-date-picker v-model="scope.row.date" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="还款金额（元）" width="200">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.amount" :precision="2" :min="0" style="width: 100%" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="danger" size="small" @click="removeRepayment(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="calc-actions">
          <el-button type="primary" size="large" @click="calculate">
            <i class="el-icon-s-marketing" /> 开始计算
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 计算结果 -->
    <el-card v-if="result" class="box-card result-card">
      <div slot="header" class="clearfix">
        <span>计算结果</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="exportResult">
          <i class="el-icon-download" /> 导出报告
        </el-button>
      </div>

      <!-- 汇总信息 -->
      <div class="result-summary">
        <div class="result-title">计算结果汇总</div>
        <div class="result-list">
          <div class="result-item">
            <span class="result-label">债务本金：</span>
            <span class="result-value">{{ formatMoney(result.summary.principal) }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">正常履行金额：</span>
            <span class="result-value">{{ formatMoney(result.summary.paidAmount) }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">实际计息本金：</span>
            <span class="result-value">{{ formatMoney(result.summary.actualPrincipal) }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">一般利息合计：</span>
            <span class="result-value">{{ formatMoney(result.summary.totalNormalInterest) }} 元</span>
          </div>
          <div v-if="form.calcDelayInterest" class="result-item">
            <span class="result-label">迟延履行利息合计：</span>
            <span class="result-value">{{ formatMoney(result.summary.totalDelayInterest) }} 元</span>
          </div>
          <div class="result-item total-item">
            <span class="result-label">应付总额：</span>
            <span class="result-value amount-highlight red">{{ formatMoney(result.summary.totalAmount) }} 元</span>
          </div>
        </div>
      </div>

      <!-- 分段明细表格 -->
      <div class="segment-table-wrapper">
        <table class="segment-table">
          <thead>
            <tr>
              <th class="col-date">开始日期</th>
              <th class="col-date">结束日期</th>
              <th class="col-days">天数</th>
              <th class="col-rate">利率</th>
              <th class="col-interest">一般利息</th>
              <th v-if="form.calcDelayInterest" class="col-delay">累计迟延利息</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(segment, index) in result.segments">
              <tr v-if="!segment.isRepaymentNode" :key="'seg-' + index" class="data-row">
                <td class="col-date">{{ segment.startDate }}</td>
                <td class="col-date">{{ segment.endDate }}</td>
                <td class="col-days">{{ segment.days }}</td>
                <td class="col-rate">{{ segment.rate.toFixed(2) }}% ({{ segment.rateType === 'lpr' ? 'LPR' : '基准' }})</td>
                <td class="col-interest">{{ formatMoney(segment.normalInterest) }}</td>
                <td v-if="form.calcDelayInterest" class="col-delay">{{ segment.delayInterest > 0 ? formatMoney(segment.delayInterest) : '-' }}</td>
              </tr>
              <tr v-else :key="'repay-' + index" class="repayment-row">
                <td :colspan="form.calcDelayInterest ? 6 : 5" class="repayment-info">
                  <div class="repayment-title">中途还款：{{ segment.repaymentInfo.date }} 还款 {{ formatMoney(segment.repaymentInfo.amount) }} 元</div>
                  <div class="repayment-detail">
                    <span>还款前剩余本金：{{ formatMoney(segment.repaymentInfo.remainingPrincipalBefore) }} 元</span>
                    <span>截至还款日一般利息：{{ formatMoney(segment.repaymentInfo.accumulatedInterest) }} 元</span>
                    <span>实际还一般利息：{{ formatMoney(segment.repaymentInfo.interestPaid) }} 元</span>
                    <span>实际还本金：{{ formatMoney(segment.repaymentInfo.principalPaid) }} 元</span>
                    <span>还款后剩余本金：{{ formatMoney(segment.repaymentInfo.remainingPrincipal) }} 元</span>
                    <span v-if="form.calcDelayInterest">累计迟延履行金（未抵扣）：{{ formatMoney(segment.repaymentInfo.accumulatedDelayInterest) }} 元</span>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
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
    const today = new Date()
    const formatDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    return {
      form: {
        principal: undefined,
        rateSourceType: 'auto',
        customRate: undefined,
        repaymentType: 'interest_first',
        paidAmount: 0,
        interestStartDate: '',
        delayInterestStartDate: '',
        endDate: formatDateStr(today),
        calcDelayInterest: true,
        lprLevel: '1y'
      },
      repayments: [],
      result: null
    }
  },
  methods: {
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    // 格式化金额
    formatMoney(amount) {
      if (amount === undefined || amount === null) return '-'
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    // 获取两日期之间的天数（包含起始日，不包含结束日）
    getDaysBetween(start, end) {
      const s = new Date(start)
      const e = new Date(end)
      return Math.ceil((e - s) / (1000 * 60 * 60 * 24))
    },

    // 判断是否使用LPR时期（2020-08-20及之后）
    isLprPeriod(date) {
      return new Date(date) >= new Date('2020-08-20')
    },

    // 获取指定日期的LPR
    getLprRateForDate(date) {
      const compareDate = new Date(date)
      const level = this.form.lprLevel

      for (let i = 0; i < lprData.length; i++) {
        const item = lprData[i]
        const itemDate = new Date(item.date)
        if (itemDate <= compareDate) {
          return { rate: item['rate_' + level], type: 'lpr' }
        }
      }
      return { rate: lprData[lprData.length - 1]['rate_' + level], type: 'lpr' }
    },

    // 获取指定日期的基准利率
    getBenchmarkRateForDate(date) {
      const compareDate = new Date(date)
      const level = '1y' // 默认使用一年期

      for (let i = 0; i < benchmarkData.length; i++) {
        const item = benchmarkData[i]
        const itemDate = new Date(item.date)
        if (itemDate <= compareDate) {
          return { rate: item[level], type: 'benchmark' }
        }
      }
      return { rate: benchmarkData[benchmarkData.length - 1][level], type: 'benchmark' }
    },

    // 获取指定日期的适用利率
    getRateForDate(date) {
      if (this.form.rateSourceType === 'custom') {
        // 自定义利率为日利率
        return { rate: this.form.customRate, type: 'custom', isDailyRate: true }
      }
      if (this.isLprPeriod(date)) {
        return this.getLprRateForDate(date)
      }
      return this.getBenchmarkRateForDate(date)
    },

    // 获取指定区间内的利率调整日期列表
    getRateChangeDates(startDate, endDate) {
      const dates = []
      const start = new Date(startDate)
      const end = new Date(endDate)

      // 分界点 2020-08-20
      const boundaryDate = new Date('2020-08-20')
      if (start < boundaryDate && end >= boundaryDate) {
        dates.push('2020-08-20')
      }

      // LPR调整日期
      if (end >= boundaryDate) {
        const lprStart = start < boundaryDate ? boundaryDate : start
        for (const item of lprData) {
          const itemDate = new Date(item.date)
          if (itemDate > lprStart && itemDate <= end) {
            dates.push(item.date)
          }
        }
      }

      // 基准利率调整日期（2020-08-20前）
      if (start < boundaryDate) {
        const bmEnd = end < boundaryDate ? end : new Date('2020-08-19')
        for (const item of benchmarkData) {
          const itemDate = new Date(item.date)
          if (itemDate > start && itemDate <= bmEnd) {
            dates.push(item.date)
          }
        }
      }

      return dates.sort((a, b) => new Date(a) - new Date(b))
    },

    // 根据利率调整日和还款日分割时间段
    splitPeriods(startDate, endDate) {
      // 获取所有分割点
      const allPoints = [startDate, endDate]

      // 添加还款日期
      for (const repayment of this.repayments) {
        if (repayment.date && repayment.date > startDate && repayment.date <= endDate) {
          allPoints.push(repayment.date)
        }
      }

      // 添加利率调整日期
      const rateChangeDates = this.getRateChangeDates(startDate, endDate)
      allPoints.push(...rateChangeDates)

      // 去重并排序
      const uniquePoints = [...new Set(allPoints)].sort((a, b) => new Date(a) - new Date(b))

      // 生成时间段
      const periods = []
      for (let i = 0; i < uniquePoints.length - 1; i++) {
        const segmentStart = uniquePoints[i]
        const segmentEnd = uniquePoints[i + 1]

        // 检查这个结束日期是否是还款日期
        const isRepaymentDate = this.repayments.some(r => r.date === segmentEnd)

        periods.push({
          startDate: segmentStart,
          endDate: segmentEnd,
          isRepaymentNode: isRepaymentDate
        })
      }

      return periods
    },

    // 添加还款记录
    addRepayment() {
      this.repayments.push({
        date: '',
        amount: 0
      })
    },

    // 删除还款记录
    removeRepayment(index) {
      this.repayments.splice(index, 1)
    },

    // 重置表单
    resetForm() {
      this.$refs.form.resetFields()
      this.repayments = []
      this.result = null
    },

    // 计算还款计划
    calculate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return

        const principal = (this.form.principal || 0) - (this.form.paidAmount || 0)
        if (principal <= 0) {
          this.$message.warning('实际计息本金必须大于0')
          return
        }

        const startDate = this.form.interestStartDate
        const endDate = this.form.endDate
        const delayStartDate = this.form.delayInterestStartDate

        // 分割时间段
        const periods = this.splitPeriods(startDate, endDate)

        // 计算每个时间段
        const segments = []
        let currentPrincipal = principal
        let accumulatedNormalInterest = 0
        let accumulatedDelayInterest = 0
        let totalNormalInterest = 0

        for (const period of periods) {
          const rateInfo = this.getRateForDate(period.startDate)
          const days = this.getDaysBetween(period.startDate, period.endDate)

          // 计算一般利息（日利率直接计算，年利率需要除以365）
          const normalInterest = rateInfo.isDailyRate
            ? currentPrincipal * (rateInfo.rate / 100) * days
            : currentPrincipal * (rateInfo.rate / 100) * days / 365
          accumulatedNormalInterest += normalInterest
          totalNormalInterest += normalInterest

          // 计算迟延履行利息
          let delayInterest = 0
          if (this.form.calcDelayInterest && delayStartDate) {
            const periodStart = new Date(period.startDate)
            const periodEnd = new Date(period.endDate)
            const delayStart = new Date(delayStartDate)

            if (periodStart >= delayStart) {
              // 整段都在延迟履行期间
              delayInterest = currentPrincipal * 0.000175 * days
            } else if (periodEnd > delayStart) {
              // 部分在延迟履行期间
              const delayDays = this.getDaysBetween(delayStartDate, period.endDate)
              delayInterest = currentPrincipal * 0.000175 * delayDays
            }
            accumulatedDelayInterest += delayInterest
          }

          // 添加时间段记录
          segments.push({
            startDate: period.startDate,
            endDate: period.endDate,
            days: days,
            rate: rateInfo.rate,
            rateType: rateInfo.type,
            normalInterest: normalInterest,
            delayInterest: this.form.calcDelayInterest ? accumulatedDelayInterest : 0,
            isRepaymentNode: false
          })

          // 如果是还款节点，处理还款
          if (period.isRepaymentNode) {
            const repayment = this.repayments.find(r => r.date === period.endDate)
            if (repayment && repayment.amount > 0) {
              const remainingPrincipalBefore = currentPrincipal
              const repaymentAmount = repayment.amount

              let interestPaid = 0
              let principalPaid = 0

              if (this.form.repaymentType === 'interest_first') {
                // 先息后本：先还一般利息，剩余还本金
                interestPaid = Math.min(accumulatedNormalInterest, repaymentAmount)
                const remainingForPrincipal = repaymentAmount - interestPaid
                principalPaid = Math.min(currentPrincipal, remainingForPrincipal)
                currentPrincipal -= principalPaid
                accumulatedNormalInterest -= interestPaid
              } else {
                // 先本后息：全部还本金
                principalPaid = Math.min(currentPrincipal, repaymentAmount)
                currentPrincipal -= principalPaid
                // 利息不抵扣，继续累计
              }

              // 添加还款节点记录
              segments.push({
                isRepaymentNode: true,
                repaymentInfo: {
                  date: repayment.date,
                  amount: repaymentAmount,
                  remainingPrincipalBefore: remainingPrincipalBefore,
                  accumulatedInterest: this.form.repaymentType === 'interest_first'
                    ? (accumulatedNormalInterest + interestPaid) : accumulatedNormalInterest,
                  interestPaid: interestPaid,
                  principalPaid: principalPaid,
                  remainingPrincipal: currentPrincipal,
                  accumulatedDelayInterest: accumulatedDelayInterest
                }
              })
            }
          }
        }

        // 构建结果
        this.result = {
          summary: {
            principal: this.form.principal || 0,
            paidAmount: this.form.paidAmount || 0,
            actualPrincipal: principal,
            totalNormalInterest: totalNormalInterest,
            totalDelayInterest: accumulatedDelayInterest,
            totalAmount: currentPrincipal + accumulatedNormalInterest + accumulatedDelayInterest
          },
          segments: segments
        }
      })
    },

    // 导出结果
    exportResult() {
      if (!this.result) return

      let report = '还款计划计算报告（执行案件专用）\n'
      report += '='.repeat(60) + '\n\n'

      // 基本信息
      report += '【基本信息】\n'
      report += `债务金额：${this.formatMoney(this.result.summary.principal)} 元\n`
      report += `正常履行金额：${this.formatMoney(this.result.summary.paidAmount)} 元\n`
      report += `实际计息本金：${this.formatMoney(this.result.summary.actualPrincipal)} 元\n`
      report += `利率类型：${this.form.rateSourceType === 'auto' ? '基准利率与LPR自动分段' : '自定义利率'}\n`
      report += `还款类型：${this.form.repaymentType === 'interest_first' ? '先息后本' : '先本后息'}\n`
      report += `利息起算日期：${this.form.interestStartDate}\n`
      if (this.form.calcDelayInterest) {
        report += `延迟履行利息起算：${this.form.delayInterestStartDate}\n`
      }
      report += `结束日期：${this.form.endDate}\n\n`

      // 中途还款记录
      if (this.repayments.length > 0) {
        report += '【中途还款记录】\n'
        this.repayments.forEach((r, i) => {
          report += `${i + 1}. ${r.date} 还款 ${this.formatMoney(r.amount)} 元\n`
        })
        report += '\n'
      }

      // 汇总结果
      report += '【计算结果汇总】\n'
      report += `一般利息合计：${this.formatMoney(this.result.summary.totalNormalInterest)} 元\n`
      if (this.form.calcDelayInterest) {
        report += `迟延履行利息合计：${this.formatMoney(this.result.summary.totalDelayInterest)} 元\n`
      }
      report += `应付总额：${this.formatMoney(this.result.summary.totalAmount)} 元\n\n`

      // 分段明细
      report += '【分段计算明细】\n'
      report += '-'.repeat(60) + '\n'

      for (const segment of this.result.segments) {
        if (segment.isRepaymentNode) {
          const info = segment.repaymentInfo
          report += `\n[中途还款] ${info.date} 还款 ${this.formatMoney(info.amount)} 元\n`
          report += `  还款前剩余本金：${this.formatMoney(info.remainingPrincipalBefore)} 元\n`
          report += `  截至还款日一般利息：${this.formatMoney(info.accumulatedInterest)} 元\n`
          report += `  实际还一般利息：${this.formatMoney(info.interestPaid)} 元\n`
          report += `  实际还本金：${this.formatMoney(info.principalPaid)} 元\n`
          report += `  还款后剩余本金：${this.formatMoney(info.remainingPrincipal)} 元\n`
          if (this.form.calcDelayInterest) {
            report += `  累计迟延履行金（未抵扣）：${this.formatMoney(info.accumulatedDelayInterest)} 元\n`
          }
          report += '\n'
        } else {
          report += `${segment.startDate} 至 ${segment.endDate}（${segment.days}天）\n`
          report += `  利率：${segment.rate.toFixed(2)}%（${segment.rateType === 'lpr' ? 'LPR' : '基准利率'}）\n`
          report += `  一般利息：${this.formatMoney(segment.normalInterest)} 元\n`
          if (this.form.calcDelayInterest && segment.delayInterest > 0) {
            report += `  累计迟延履行金：${this.formatMoney(segment.delayInterest)} 元\n`
          }
        }
      }

      report += '\n' + '='.repeat(60) + '\n'
      report += `计算时间：${new Date().toLocaleString('zh-CN')}\n`

      // 下载文件
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `还款计划计算报告_${new Date().getTime()}.txt`
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

// 分段表格样式
.segment-table-wrapper {
  overflow-x: auto;
}

.segment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background-color: #4472c4;
    color: #fff;

    th {
      padding: 12px 8px;
      text-align: center;
      font-weight: normal;
      border: 1px solid #5b9bd5;
    }
  }

  tbody {
    tr.data-row {
      background-color: #d9e2f3;

      &:nth-child(even) {
        background-color: #e7ebf5;
      }

      td {
        padding: 10px 8px;
        border: 1px solid #b4c7e7;
        text-align: center;
      }
    }

    tr.repayment-row {
      background-color: #fff3cd;

      td.repayment-info {
        padding: 12px 15px;
        border: 1px solid #ffeaa7;

        .repayment-title {
          font-weight: bold;
          color: #856404;
          margin-bottom: 8px;
        }

        .repayment-detail {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          font-size: 13px;
          color: #666;

          span {
            white-space: nowrap;
          }
        }
      }
    }
  }
}

.col-date { width: 12%; }
.col-days { width: 8%; }
.col-rate { width: 15%; }
.col-interest { width: 15%; }
.col-delay { width: 15%; }

.amount-highlight {
  color: #f56c6c;
  font-weight: bold;
}

.result-summary {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;

  .result-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
  }

  .result-list {
    padding: 12px 16px;
    background-color: #fff;
  }

  .result-item {
    padding: 10px 0;
    border-bottom: 1px dashed #ebeef5;
    font-size: 14px;
    display: flex;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }
  }

  .result-label {
    color: #606266;
    min-width: 140px;
  }

  .result-value {
    color: #303133;
    font-weight: 500;
  }

  .total-item {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 16px;

    .result-label {
      font-weight: bold;
      color: #303133;
    }
  }
}
</style>
