# 执行费计算器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在"常用计算器"菜单下增加"执行费计算"功能，用于计算法院执行案件的执行费用。

**Architecture:** 创建一个 Vue 单文件组件，包含表单输入、计算逻辑和结果展示。复用现有计算器的样式模式。

**Tech Stack:** Vue 2, Element UI, JavaScript

---

## File Structure

| File | Purpose |
|------|---------|
| `src/dagl/views/lixijs/execution-fee.vue` | 执行费计算器组件（新建） |
| `src/dagl/router/lixijs.js` | 添加路由配置（修改） |

---

## Task 1: Create execution-fee.vue Component

**Files:**
- Create: `src/dagl/views/lixijs/execution-fee.vue`

### Step 1.1: Create Vue template structure

```vue
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
        let rateText = tier.rateText
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
```

### Step 1.2: Run dev server to verify component loads

```bash
npm run dev
```

Expected: Server starts on http://localhost:9527

---

## Task 2: Add Route Configuration

**Files:**
- Modify: `src/dagl/router/lixijs.js`

### Step 2.1: Add execution-fee route

Add to the children array in `src/dagl/router/lixijs.js`:

```javascript
{
  path: 'execution-fee',
  component: () => import('@/dagl/views/lixijs/execution-fee'),
  name: 'LixijsExecutionFee',
  meta: {
    title: '执行费计算',
    icon: 'el-icon-s-finance'
  }
}
```

Insert this before the repayment route (to maintain alphabetical order or at any position).

### Step 2.2: Verify route appears in menu

Run dev server and check that "执行费计算" appears in the left sidebar menu.

---

## Task 3: Test and Verify

**Test Cases:**

### Test 1: 1万元以下
- Input: 5000元
- Expected: 50元
- Formula: 50元

### Test 2: 1万-50万区间
- Input: 300000元
- Expected: 50 + (300000-10000)×1.5% = 50 + 4350 = 4400元
- Formula: 50元 + (300000-10000)×1.5%

### Test 3: 50万-500万区间
- Input: 600000元
- Expected: 7400 + (600000-500000)×1% = 7400 + 1000 = 8400元
- Formula: 7400元 + (600000-500000)×1%

### Test 4: 500万-1000万区间
- Input: 8000000元
- Expected: 52400 + (8000000-5000000)×0.5% = 52400 + 15000 = 67400元

### Test 5: 1000万以上
- Input: 15000000元
- Expected: 77400 + (15000000-10000000)×0.1% = 77400 + 5000 = 82400元

---

## Verification Checklist

- [ ] 组件文件创建成功
- [ ] 路由配置添加成功
- [ ] 菜单显示正常
- [ ] 各金额区间计算正确
- [ ] 速算公式显示正确
- [ ] 分段明细表格显示正确
- [ ] 计算后自动滚动到结果区域
- [ ] 空值/非数字输入有错误提示
