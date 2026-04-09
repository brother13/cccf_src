# 还款计划计算（执行案件专用）设计文档

## 背景与目标

改造现有的还款计划计算页面，专门用于计算法院判决执行案件中，被执行人未按时还款或中途还款后的剩余本金和利息。

## 需求概述

### 核心功能
- 支持一般利息和迟延履行利息（日万分之1.75）的计算
- 支持中途多笔还款记录的管理
- 利率自动分段：2020-08-20前使用基准利率，之后使用LPR
- 还款类型：先息后本、先本后息
- 迟延履行金最后统一结算，不随中途还款抵扣

## 界面设计

### 输入区域

```
┌─────────────────────────────────────────┐
│  还款计划计算（执行案件专用）            │
├─────────────────────────────────────────┤
│                                         │
│  【基本信息】                            │
│  债务金额: [        ] 元                │
│  利率类型: (●)基准利率与LPR自动分段      │
│            ( )自定义利率                │
│  还款类型: (●)先息后本 ( )先本后息       │
│  正常履行金额: [    ] 元（已履行部分）    │
│                                         │
│  【日期设置】                            │
│  利息起算日期: [      ]                 │
│  延迟履行利息起算: [  ]（判决履行期满日） │
│  结束日期: [      ]（默认当天）          │
│  计算类型: ( )一般利息 (●)加倍利息       │
│            （勾选后计算迟延履行利息）      │
│                                         │
│  【中途还款记录】         [+ 添加还款]    │
│  ┌─────────────┬──────────┬──────────┐  │
│  │ 还款日期    │ 还款金额  │ 操作     │  │
│  ├─────────────┼──────────┼──────────┤  │
│  │ 2024-06-01  │ 30,000   │ [删除]   │  │
│  └─────────────┴──────────┴──────────┘  │
│                                         │
│         [  开始计算  ]                   │
│                                         │
└─────────────────────────────────────────┘
```

### 结果展示

#### 汇总信息
```
【计算结果汇总】
债务本金: 100,000.00 元
正常履行金额: 0.00 元
实际计息本金: 100,000.00 元
一般利息合计: X,XXX.XX 元
迟延履行利息合计: X,XXX.XX 元
应付总额: XX,XXX.XX 元
```

#### 明细表格
```
【分段计算明细】
┌─────────────┬─────────────┬──────┬─────────┬──────────┬──────────────┐
│  开始日期   │   结束日期  │ 天数 │  利率   │ 一般利息 │ 累计迟延利息 │
├─────────────┼─────────────┼──────┼─────────┼──────────┼──────────────┤
│ 2024-01-01  │ 2024-02-01  │  32  │ 3.45%   │  XXX.XX  │      -       │
│ 2024-02-01  │ 2024-03-20  │  48  │ 3.45%   │  XXX.XX  │    XXX.XX    │
│ 2024-03-20  │ 2024-06-01  │  73  │ 3.35%   │  XXX.XX  │    XXX.XX    │
├─────────────┴─────────────┴──────┴─────────┴──────────┴──────────────┤
│ 中途还款: 2024-06-01 还款 30,000.00 元                                │
│   还款前剩余本金: 100,000.00 元                                        │
│   截至还款日一般利息: X,XXX.XX 元                                      │
│   实际还一般利息: X,XXX.XX 元                                         │
│   实际还本金: XX,XXX.XX 元                                            │
│   还款后剩余本金: XX,XXX.XX 元                                         │
│   累计迟延履行金（未抵扣）: X,XXX.XX 元                                │
├─────────────┬─────────────┬──────┬─────────┬──────────┬──────────────┤
│ 2024-06-01  │ 2024-07-22  │  51  │ 3.35%   │  XXX.XX  │    XXX.XX    │
│ ...         │ ...         │ ...  │ ...     │  ...     │    ...       │
└─────────────┴─────────────┴──────┴─────────┴──────────┴──────────────┘
```

## 数据模型

### 表单数据 (form)
```javascript
{
  principal: number,              // 债务金额
  rateSourceType: 'auto' | 'custom', // 利率类型
  customRate: number,             // 自定义利率
  repaymentType: 'interest_first' | 'principal_first', // 还款类型
  paidAmount: number,             // 正常履行金额
  interestStartDate: string,      // 利息起算日期 (yyyy-MM-dd)
  delayInterestStartDate: string, // 延迟履行利息起算日期
  endDate: string,                // 结束日期
  calcDelayInterest: boolean      // 是否计算加倍利息
}
```

### 中途还款记录 (repayments)
```javascript
[
  {
    id: number,           // 唯一标识
    date: string,         // 还款日期
    amount: number        // 还款金额
  }
]
```

### 计算结果 (result)
```javascript
{
  summary: {
    principal: number,           // 债务本金
    paidAmount: number,          // 正常履行金额
    actualPrincipal: number,     // 实际计息本金
    totalNormalInterest: number, // 一般利息合计
    totalDelayInterest: number,  // 迟延履行利息合计
    totalAmount: number          // 应付总额
  },
  segments: [                  // 分段明细
    {
      startDate: string,
      endDate: string,
      days: number,
      rate: number,
      rateType: 'benchmark' | 'lpr',
      principal: number,         // 当期本金
      normalInterest: number,    // 一般利息
      delayInterest: number,     // 累计迟延利息（展示用）
      isRepaymentNode: boolean,  // 是否为还款节点
      repaymentInfo?: {          // 还款节点信息
        date: string,
        amount: number,
        interestPaid: number,
        principalPaid: number,
        remainingPrincipal: number,
        accumulatedDelayInterest: number
      }
    }
  ]
}
```

## 计算逻辑

### 1. 利率获取
- **分界点**: 2020-08-20
- **2020-08-20 之前**: 从 `admin_benchmark_rate` 表查询同期贷款利率
- **2020-08-20 及之后**: 从 `admin_lpr_rate` 表查询LPR利率
- **利率档次**: 1年期LPR / 5年期以上LPR（用户选择）

### 2. 时间段分割
```
输入: 起止日期、中途还款日期列表、利率调整日期列表
输出: 按时间顺序排列的分段列表

算法:
1. 合并所有分割点：起止日期、还款日期、利率调整日期
2. 按时间排序
3. 生成连续时间段 [date[i], date[i+1])
4. 每个时间段记录：起始日期、结束日期、适用的利率
```

### 3. 利息计算（逐段）
```javascript
// 一般利息
normalInterest = principal × (rate / 100) × days / 365

// 迟延履行利息（如果该段在延迟履行期间内）
if (segmentStartDate >= delayInterestStartDate) {
  delayInterest = principal × 0.000175 × days
} else if (segmentEndDate > delayInterestStartDate) {
  // 跨延迟履行起算日，拆分计算
  delayDays = daysAfterDelayInterestStartDate
  delayInterest = principal × 0.000175 × delayDays
}
```

### 4. 中途还款处理

#### 先息后本
```javascript
accumulatedInterest = 截至当日的一般利息累计
if (repaymentAmount >= accumulatedInterest) {
  interestPaid = accumulatedInterest
  principalPaid = repaymentAmount - accumulatedInterest
} else {
  interestPaid = repaymentAmount
  principalPaid = 0
}
remainingPrincipal = currentPrincipal - principalPaid
```

#### 先本后息
```javascript
principalPaid = repaymentAmount
remainingPrincipal = currentPrincipal - principalPaid
interestPaid = 0  // 利息不抵扣，继续累计
```

**注意**: 迟延履行金不参与中途还款抵扣，始终累计到最后。

### 5. 最终结算
```javascript
totalAmount = remainingPrincipal + remainingNormalInterest + totalDelayInterest
```

## API 接口

### 前端直接复用现有的利率数据
- LPR数据：`src/dagl/views/lixijs/calculator.vue` 中的 `lprData` 数组
- 基准利率数据：`src/dagl/views/lixijs/calculator.vue` 中的 `benchmarkData` 数组

### 如需后端支持（可选）
```
GET /api/lpr/rates?start_date=xxx&end_date=xxx
GET /api/benchmark/rates?start_date=xxx&end_date=xxx
```

## 组件结构

```
repayment.vue
├── 输入表单区域
│   ├── 基本信息（债务金额、利率类型、还款类型、正常履行金额）
│   ├── 日期设置（起算日期、延迟履行日期、结束日期、计算类型）
│   └── 中途还款管理（添加/删除/列表）
├── 计算按钮
└── 结果展示区域
    ├── 汇总信息卡片
    └── 分段明细表格
```

## 实现要点

### 1. 利率查询方法
复用 `calculator.vue` 中的 `getLprRateForDate` 和 `getBenchmarkRateForDate` 方法。

### 2. 日期比较工具
```javascript
// 判断日期是否在LPR时期
function isLprPeriod(date) {
  return new Date(date) >= new Date('2020-08-20')
}

// 获取两日期之间的天数
function getDaysBetween(start, end) {
  return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
}
```

### 3. 时间段分割算法
```javascript
function splitPeriods(startDate, endDate, repayments, rateChangeDates) {
  const points = [startDate, endDate, ...repayments.map(r => r.date), ...rateChangeDates]
    .filter((v, i, a) => a.indexOf(v) === i)  // 去重
    .sort((a, b) => new Date(a) - new Date(b))

  const periods = []
  for (let i = 0; i < points.length - 1; i++) {
    periods.push({
      startDate: points[i],
      endDate: points[i + 1],
      isRepaymentDate: repayments.some(r => r.date === points[i + 1])
    })
  }
  return periods
}
```

## 测试用例

### 用例1：基本计算（先息后本）
- 债务本金：100,000元
- 起算日期：2024-01-01
- 延迟履行日：2024-02-01
- 结束日期：2024-06-01
- 中途还款：2024-04-01 还款 30,000元
- 预期：正确分段，先还利息再还本金

### 用例2：跨越利率改革分界点
- 债务本金：100,000元
- 起算日期：2020-06-01
- 结束日期：2020-10-01
- 预期：2020-08-20前使用基准利率，之后使用LPR

### 用例3：先本后息
- 债务本金：100,000元
- 中途还款：2024-06-01 还款 30,000元
- 预期：30,000元全部抵扣本金，利息继续按剩余本金计算

## 待确认事项

1. ~~利率分界点确认为 2020-08-20~~ ✓ 已确认
2. ~~迟延履行金最后统一结算~~ ✓ 已确认
3. ~~还款类型仅支持先息后本和先本后息~~ ✓ 已确认
4. 是否需要导出功能？（建议保留）

## 参考文件

- 现有还款计划：`src/dagl/views/lixijs/repayment.vue`
- 利息计算器（含LPR和基准利率数据）：`src/dagl/views/lixijs/calculator.vue`
- 路由配置：`src/dagl/router/lixijs.js`
