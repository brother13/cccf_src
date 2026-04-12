<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>执行费计算</span>
      </div>

      <el-form ref="form" :model="form" label-width="120px">
        <!-- 执行金额输入 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行金额（元）" prop="amount" :rules="[{ required: true, message: '请输入执行金额' }]">
              <el-input-number v-model="form.amount" :precision="2" :min="0" style="width: 100%" placeholder="请输入执行金额" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 计算按钮 -->
        <div class="calc-actions">
          <el-button type="primary" size="large" @click="calculate">
            <i class="el-icon-s-marketing" /> 开始计算
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 计算结果 -->
    <el-card v-if="result" ref="resultCard" class="box-card result-card">
      <div slot="header" class="clearfix">
        <span>计算结果</span>
      </div>

      <!-- 汇总信息 -->
      <div class="result-summary">
        <div class="result-title">计算结果汇总</div>
        <div class="result-list">
          <div class="result-item">
            <span class="result-label">执行金额：</span>
            <span class="result-value">{{ formatMoney(result.amount) }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">执行费用：</span>
            <span class="result-value amount-highlight">{{ formatMoney(result.fee) }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">适用费率：</span>
            <span class="result-value">{{ result.rateText }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">速算公式：</span>
            <span class="result-value">{{ result.formula }}</span>
          </div>
        </div>
      </div>

      <!-- 分段明细表格 -->
      <div class="segment-table-wrapper">
        <table class="segment-table">
          <thead>
            <tr>
              <th class="col-range">金额区间</th>
              <th class="col-rate">费率/公式</th>
              <th class="col-amount">区间金额</th>
              <th class="col-fee">费用</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(segment, index) in result.segments" :key="index" class="data-row">
              <td class="col-range">{{ formatMoney(segment.startAmount) }} - {{ formatMoney(segment.endAmount) }}</td>
              <td class="col-rate">{{ segment.rateText }}</td>
              <td class="col-amount">{{ formatMoney(segment.rangeAmount) }}</td>
              <td class="col-fee">{{ formatMoney(segment.fee) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="col-range" colspan="3">合计</td>
              <td class="col-fee">{{ formatMoney(result.fee) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </el-card>
  </div>
</template>

<script>
// 执行费费率区间定义
const feeTiers = [
  { max: 10000, base: 0, rate: 0, fixed: 50, rateText: '固定50元' },
  { max: 500000, base: 50, rate: 0.015, fixed: 0, rateText: '1.5%' },
  { max: 5000000, base: 7400, rate: 0.01, fixed: 0, rateText: '1%' },
  { max: 10000000, base: 52400, rate: 0.005, fixed: 0, rateText: '0.5%' },
  { max: Infinity, base: 77400, rate: 0.001, fixed: 0, rateText: '0.1%' }
]

export default {
  name: 'ExecutionFeeCalculator',
  data() {
    return {
      form: {
        amount: undefined
      },
      result: null
    }
  },
  methods: {
    // 格式化金额
    formatMoney(amount) {
      if (amount === undefined || amount === null) return '-'
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    // 计算执行费
    calculate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return

        const amount = this.form.amount || 0
        if (amount <= 0) {
          this.$message.warning('执行金额必须大于0')
          return
        }

        const result = this.calculateExecutionFee(amount)
        this.result = result

        // 自动滚动到结果区域
        setTimeout(() => {
          const resultCard = this.$refs.resultCard
          if (resultCard && resultCard.$el) {
            resultCard.$el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      })
    },

    // 执行费计算逻辑
    calculateExecutionFee(amount) {
      const segments = []
      let totalFee = 0
      let remainingAmount = amount

      // 计算每一段的费用
      let currentStart = 0
      for (let i = 0; i < feeTiers.length && remainingAmount > 0; i++) {
        const tier = feeTiers[i]
        const tierStart = currentStart
        const tierEnd = tier.max
        const rangeAmount = Math.min(remainingAmount, tierEnd - tierStart)

        if (rangeAmount <= 0) continue

        let fee = 0
        const rateText = tier.rateText
        let formula = ''

        if (tier.fixed > 0) {
          // 固定费用（第一段）
          fee = tier.fixed
          formula = `${tier.fixed}元`
        } else {
          // 超额累进
          const excess = amount - tierStart
          fee = tier.base + excess * tier.rate
          formula = `${tier.base}元 + (${this.formatMoney(amount)}-${this.formatMoney(tierStart)})×${tier.rate * 100}%`
        }

        segments.push({
          startAmount: tierStart,
          endAmount: Math.min(amount, tierEnd),
          rangeAmount: rangeAmount,
          rateText: rateText,
          fee: fee,
          formula: formula
        })

        totalFee = fee // 最后一段的累计值就是总费用
        remainingAmount = amount - tierEnd
        currentStart = tierEnd
      }

      // 找到适用的费率区间
      const applicableTier = feeTiers.find(t => amount <= t.max) || feeTiers[feeTiers.length - 1]

      return {
        amount: amount,
        fee: totalFee,
        rateText: applicableTier.rateText,
        formula: segments[segments.length - 1]?.formula || '',
        segments: segments
      }
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

// 结果汇总样式
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
}

.amount-highlight {
  color: #f56c6c;
  font-weight: bold;
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
  }

  tfoot {
    tr.total-row {
      background-color: #4472c4;
      color: #fff;
      font-weight: bold;

      td {
        padding: 12px 8px;
        border: 1px solid #5b9bd5;
        text-align: center;
      }
    }
  }

  .col-range { width: 30%; }
  .col-rate { width: 25%; }
  .col-amount { width: 25%; }
  .col-fee { width: 20%; }
}
</style>
