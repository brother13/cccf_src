# 执行费计算器设计文档

## 背景与目标

在"常用计算器"菜单下增加"执行费计算"功能，用于计算法院执行案件中的执行费用。

## 需求概述

### 核心功能
- 输入执行金额，自动计算执行费
- 按法院标准阶梯费率计算
- 展示速算公式和计算过程
- 无封顶限制

### 计算规则（法院标准执行费）

| 执行金额区间 | 费率 | 速算公式 |
|-------------|------|----------|
| 1万元以下 | 固定 | 50元 |
| 1万 — 50万元 | 1.5% | 50元 + 超额×1.5% |
| 50万 — 500万元 | 1% | 7400元 + 超额×1% |
| 500万 — 1000万元 | 0.5% | 52400元 + 超额×0.5% |
| 1000万元以上 | 0.1% | 77400元 + 超额×0.1% |

**说明：**
- 超额 = 执行金额 - 当前区间起始金额
- 例如：60万元 = 7400 + (600000-500000)×1% = 8400元

## 界面设计

### 输入区域
```
┌─────────────────────────────────────────┐
│  执行费计算                              │
├─────────────────────────────────────────┤
│                                         │
│  【基本信息】                            │
│  执行金额: [        ] 元                │
│                                         │
│         [  开始计算  ]                   │
│                                         │
└─────────────────────────────────────────┘
```

### 结果展示

#### 汇总信息
```
【计算结果汇总】
执行金额: 600,000.00 元
执行费用: 8,400.00 元
适用费率: 1%
速算公式: 7400元 + (600000-500000)×1%
```

#### 分段计算明细
```
【费率分段明细】
┌─────────────┬─────────────┬────────┬──────────┐
│  金额区间   │  费率/公式  │  金额  │  小计    │
├─────────────┼─────────────┼────────┼──────────┤
│ 0-1万      │ 固定50元    │ 10,000 │   50.00  │
│ 1万-50万   │ 1.5%        │ 50,000 │  7350.00 │
│ 50万-60万  │ 1%          │ 60,000 │ 1000.00  │
├─────────────┴─────────────┴────────┼──────────┤
│ 合计                               │ 8400.00  │
└────────────────────────────────────┴──────────┘
```

## 数据模型

### 表单数据 (form)
```javascript
{
  amount: number  // 执行金额
}
```

### 计算结果 (result)
```javascript
{
  amount: number,           // 执行金额
  fee: number,              // 执行费用
  rate: number,             // 适用费率
  formula: string,          // 速算公式文本
  segments: [               // 分段明细
    {
      startAmount: number,  // 区间起始金额
      endAmount: number,    // 区间结束金额
      rate: number,         // 费率
      formula: string,      // 计算公式
      fee: number           // 该区间费用
    }
  ]
}
```

## 计算逻辑

### 费率区间定义
```javascript
const feeTiers = [
  { max: 10000, base: 0, rate: 0, fixed: 50 },
  { max: 500000, base: 50, rate: 0.015, fixed: 0 },
  { max: 5000000, base: 7400, rate: 0.01, fixed: 0 },
  { max: 10000000, base: 52400, rate: 0.005, fixed: 0 },
  { max: Infinity, base: 77400, rate: 0.001, fixed: 0 }
]
```

### 计算函数
```javascript
function calculateExecutionFee(amount) {
  // 找到适用的费率区间
  const tier = findApplicableTier(amount)
  
  // 计算费用
  let fee
  let formula
  
  if (tier.fixed > 0) {
    // 固定费用
    fee = tier.fixed
    formula = `${tier.fixed}元`
  } else {
    // 超额累进
    const excess = amount - getTierStart(tier)
    fee = tier.base + excess * tier.rate
    formula = `${tier.base}元 + (${amount}-${getTierStart(tier)})×${tier.rate * 100}%`
  }
  
  return { fee, formula, tier }
}
```

## 组件结构

```
execution-fee.vue
├── 输入表单区域
│   └── 执行金额输入
├── 计算按钮
└── 结果展示区域
    ├── 汇总信息卡片
    └── 分段明细表格
```

## 路由配置

在 `src/dagl/router/lixijs.js` 中添加：
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

## 实现要点

1. **金额格式化**：使用 `toLocaleString('zh-CN')` 显示千分位
2. **计算精度**：使用 `toFixed(2)` 保留两位小数
3. **自动滚动**：计算完成后自动滚动到结果区域（参考 repayment.vue）
4. **空值处理**：输入为空或非数字时给出提示
5. **样式复用**：复用 repayment.vue 的结果汇总和表格样式

## 参考文件

- 现有利息计算器：`src/dagl/views/lixijs/calculator.vue`
- 还款计划计算：`src/dagl/views/lixijs/repayment.vue`
- 路由配置：`src/dagl/router/lixijs.js`
