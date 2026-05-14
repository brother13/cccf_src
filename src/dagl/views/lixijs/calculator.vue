<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>利息/违约金/占用费计算器</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="resetForm">
          重置
        </el-button>
      </div>

      <el-form ref="calcForm" :model="form" label-width="140px" class="calc-form">
        <!-- 计算基数 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="计算基数（元）" prop="principal" :rules="[{ required: true, message: '请输入计算基数' }]">
              <el-input-number v-model="form.principal" :precision="2" :min="0" style="width: 100%" placeholder="请输入金额" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 利率类型 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="利率类型">
              <el-radio-group v-model="form.rateSourceType" @change="onRateSourceChange">
                <el-radio label="custom">自定义利率</el-radio>
                <el-radio label="benchmark">中国人民银行同期贷款利率</el-radio>
                <el-radio label="benchmark_lpr">中国人民银行同期贷款基准利率与LPR自动分段</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 自定义利率 -->
        <template v-if="form.rateSourceType === 'custom'">
          <el-row>
            <el-col :span="12">
              <el-form-item label="利率（%）" prop="rate" :rules="[{ required: form.rateSourceType === 'custom', message: '请输入利率' }]">
                <el-input-number v-model="form.rate" :precision="4" :min="0" style="width: 100%" placeholder="请输入利率" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="利率类型">
                <el-radio-group v-model="form.rateType">
                  <el-radio label="year">年利率</el-radio>
                  <el-radio label="month">月利率</el-radio>
                  <el-radio label="day">日利率</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 日期设置 -->
        <el-row>
          <el-col :span="12">
            <el-form-item label="起始日期" prop="startDate" :rules="[{ required: true, message: '请选择起始日期' }]">
              <el-date-picker v-model="form.startDate" type="date" placeholder="请选择日期" style="width: 100%" value-format="yyyy-MM-dd" @change="onDateChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="endDate" :rules="[{ required: true, message: '请选择截止日期' }]">
              <el-date-picker v-model="form.endDate" type="date" placeholder="请选择日期" style="width: 100%" value-format="yyyy-MM-dd" @change="onDateChange" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <div class="date-format-tip">
              <i class="el-icon-warning" /> 日期格式：yyyy-MM-dd，如：2026-04-08
            </div>
          </el-col>
        </el-row>

        <!-- 起始日期选项 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="起始日期选项">
              <el-radio-group v-model="form.dateCalcType">
                <el-radio label="both_include">起止日期均计算在内</el-radio>
                <el-radio label="start_include">起始日期计算在内，截止日期不计算在内</el-radio>
                <el-radio label="end_include">起始日期不计算在内，截止日期计算在内</el-radio>
                <el-radio label="both_exclude">起止日期均不计算在内</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 一年天数 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="一年为">
              <el-radio-group v-model="form.daysPerYear">
                <el-radio :label="360">360天</el-radio>
                <el-radio :label="365">365天</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 贷款基准利率选项 -->
        <template v-if="(form.rateSourceType === 'benchmark') || (form.rateSourceType === 'benchmark_lpr' && form.startDate && new Date(form.startDate) < new Date('2019-08-20'))">
          <el-divider>贷款基准利率选项{{ form.rateSourceType === 'benchmark_lpr' ? '（2019年8月20日前适用）' : '' }}</el-divider>

          <el-row>
            <el-col :span="24">
              <el-form-item label="基准利率计算方式">
                <el-radio-group v-model="form.benchmarkCalcType">
                  <el-radio label="segment">分段利率（根据利率调整日自动分段）</el-radio>
                  <el-radio label="fixed">指定利率（使用起始日期对应的利率）</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="基准利率档次">
                <el-radio-group v-model="form.benchmarkLevel">
                  <el-radio label="6m">六个月以内</el-radio>
                  <el-radio label="6m_1y">六个月至一年</el-radio>
                  <el-radio label="1y_3y">一至三年</el-radio>
                  <el-radio label="3y_5y">三至五年</el-radio>
                  <el-radio label="5y_plus">五年以上</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="利率调整方式">
                <el-select v-model="form.benchmarkAdjustType" style="width: 100%">
                  <el-option label="无" value="none" />
                  <el-option label="上浮" value="increase" />
                  <el-option label="下浮" value="decrease" />
                  <el-option label="倍数" value="multiple" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.benchmarkAdjustType !== 'none'">
            <el-col :span="24">
              <el-form-item :label="form.benchmarkAdjustType === 'multiple' ? '倍数' : '调整幅度(%)'">
                <el-input-number v-model="form.benchmarkAdjustValue" :precision="4" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- LPR选项 -->
        <template v-if="form.rateSourceType === 'benchmark_lpr'">
          <el-divider>LPR选项（2019年8月20日后适用）</el-divider>

          <el-row>
            <el-col :span="24">
              <el-form-item label="LPR计算方式">
                <el-radio-group v-model="form.lprCalcType">
                  <el-radio label="segment">分段LPR（根据LPR调整日自动分段）</el-radio>
                  <el-radio label="fixed">指定LPR（使用起始日期对应的LPR）</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="LPR档次">
                <el-radio-group v-model="form.lprLevel">
                  <el-radio label="1y">1年期LPR</el-radio>
                  <el-radio label="5y">5年期以上LPR</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="基点(BP)">
                <el-input-number v-model="form.lprBasisPoints" :precision="0" style="width: 100%" placeholder="1BP=0.01%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="浮动或倍率">
                <el-select v-model="form.lprAdjustType" style="width: 100%">
                  <el-option label="无" value="none" />
                  <el-option label="上浮%" value="increase" />
                  <el-option label="下浮%" value="decrease" />
                  <el-option label="倍数" value="multiple" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="form.lprAdjustType !== 'none'">
            <el-col :span="24">
              <el-form-item :label="form.lprAdjustType === 'multiple' ? '倍数' : '浮动幅度(%)'">
                <el-input-number v-model="form.lprAdjustValue" :precision="4" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 迟延履行利息 -->
        <el-divider>迟延履行利息（可选）</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="履行期间届满日">
              <el-date-picker v-model="form.dueDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-checkbox v-model="form.calcDelayInterest">
            计算迟延履行期间债务利息（按日万分之1.75）
          </el-checkbox>
        </el-form-item>
      </el-form>

      <!-- 计算按钮 -->
      <div class="calc-actions">
        <el-button type="primary" size="large" @click="calculate">
          <i class="el-icon-s-marketing" /> 计算
        </el-button>
      </div>
    </el-card>

    <!-- 计算结果 -->
    <el-card v-if="result" ref="resultCard" class="box-card result-card">
      <div slot="header" class="clearfix">
        <span>计算结果</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="exportResult">
          <i class="el-icon-download" /> 导出报告
        </el-button>
      </div>

      <div class="result-summary">
        <div class="result-title">计算结果汇总</div>
        <div class="result-list">
          <div class="result-item">
            <span class="result-label">计算基数：</span>
            <span class="result-value">{{ formatMoney(result.principal) }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">计息天数：</span>
            <span class="result-value">{{ result.days }} 天</span>
          </div>
          <div class="result-item">
            <span class="result-label">利率来源：</span>
            <span class="result-value">{{ result.rateSourceText }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">一年按：</span>
            <span class="result-value">{{ form.daysPerYear }} 天</span>
          </div>
          <div class="result-item">
            <span class="result-label">一般债务利息：</span>
            <span class="result-value">{{ formatMoney(result.normalInterest) }} 元</span>
          </div>
          <div v-if="form.calcDelayInterest" class="result-item">
            <span class="result-label">迟延履行利息：</span>
            <span class="result-value">{{ formatMoney(result.delayInterest) }} 元</span>
          </div>
          <div class="result-item total-item">
            <span class="result-label">应付总额：</span>
            <span class="result-value amount-highlight red">{{ formatMoney(result.totalAmount) }} 元</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 分段利率明细 -->
    <el-card v-if="mergedRateSegments.length > 0" class="box-card result-card">
      <div slot="header" class="clearfix">
        <span>计算详单</span>
      </div>
      <table class="rate-detail-table">
        <thead>
          <tr>
            <th class="col-period">时间段</th>
            <th class="col-days">天数</th>
            <th class="col-rate">{{ form.rateSourceType === 'benchmark_lpr' ? 'LPR' : '利率' }}</th>
            <th class="col-amount">金额</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(segment, index) in mergedRateSegments" :key="index" class="data-row">
            <td class="col-period">
              <div class="date-range">
                <div class="start-date">{{ segment.startDate }}</div>
                <div class="date-separator">|</div>
                <div class="end-date">{{ segment.endDate }}</div>
              </div>
            </td>
            <td class="col-days">{{ segment.days }}</td>
            <td class="col-rate">{{ segment.finalRate.toFixed(2) }} %</td>
            <td class="col-amount">
              <div class="amount-wrapper">
                <div class="amount-value">{{ formatMoney(segment.interest) }}元</div>
                <div class="amount-formula">= {{ getCalculationFormula(segment) }}</div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td class="col-period">合计</td>
            <td class="col-days">{{ totalDays }}</td>
            <td class="col-rate">-</td>
            <td class="col-amount">{{ formatMoney(totalInterest) }}元</td>
          </tr>
        </tfoot>
      </table>
    </el-card>
  </div>
</template>

<script>
// 数据直接使用前端缓存，如需从后端获取可取消注释
import { saveCalculation } from '@/dagl/api/lixijs'
import { getLprRateByDateRange } from '@/dagl/api/lpr'
import { getBenchmarkRateByDate, getLatestBenchmarkRate } from '@/dagl/api/benchmark'

// LPR数据缓存
const lprData = [
  { date: '2026-04-20', rate_1y: 3.00, rate_5y: 3.50 },
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

// 贷款基准利率数据
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
  name: 'InterestCalculator',
  data() {
    return {
      form: {
        principal: undefined,
        rate: undefined,
        rateSourceType: 'custom',
        rateType: 'year',
        startDate: '',
        endDate: '',
        dateCalcType: 'both_include',
        daysPerYear: 365,
        // 基准利率选项
        benchmarkCalcType: 'segment',
        benchmarkLevel: '6m_1y',
        benchmarkAdjustType: 'none',
        benchmarkAdjustValue: 0,
        // LPR选项
        lprCalcType: 'segment',
        lprLevel: '1y',
        lprBasisPoints: 0,
        lprAdjustType: 'none',
        lprAdjustValue: 0,
        // 迟延履行利息
        dueDate: '',
        calcDelayInterest: false
      },
      rateSegments: [],
      result: null
    }
  },
  computed: {
    // 合并相同利率的分段
    mergedRateSegments() {
      if (this.rateSegments.length === 0) return []

      const merged = []
      let current = {
        ...this.rateSegments[0]
      }

      for (let i = 1; i < this.rateSegments.length; i++) {
        const next = this.rateSegments[i]
        // 检查是否可以合并（利率相同且连续）
        if (Math.abs(next.finalRate - current.finalRate) < 0.0001) {
          // 合并：更新结束日期、增加天数、累加利息
          current.endDate = next.endDate
          current.days += next.days
          current.interest += next.interest
        } else {
          // 不能合并，保存当前段，开始新段
          merged.push(current)
          current = { ...next }
        }
      }
      // 添加最后一段
      merged.push(current)
      return merged
    },
    // 总天数
    totalDays() {
      return this.mergedRateSegments.reduce((sum, seg) => sum + seg.days, 0)
    },
    // 总利息
    totalInterest() {
      return this.mergedRateSegments.reduce((sum, seg) => sum + seg.interest, 0)
    }
  },
  methods: {
    // 根据利率类型转换为年利率
    getAnnualRate() {
      const rate = this.form.rate || 0
      const rateType = this.form.rateType
      const daysPerYear = this.form.daysPerYear

      if (rateType === 'month') {
        return rate * 12
      } else if (rateType === 'day') {
        return rate * daysPerYear
      }
      return rate
    },

    // 利率来源变化
    onRateSourceChange(val) {
      if (val === 'custom') {
        this.form.rate = undefined
      }
    },

    // 日期变化
    onDateChange() {
      if ((this.form.rateSourceType === 'benchmark_lpr' || this.form.rateSourceType === 'benchmark') && this.form.startDate && this.form.endDate) {
        this.generateRateSegments()
      }
    },

    // 生成利率分段
    generateRateSegments() {
      this.rateSegments = []
      if (!this.form.startDate || !this.form.endDate) return

      const start = new Date(this.form.startDate)
      const end = new Date(this.form.endDate)

      // 如果只使用基准利率（不自动切换LPR）
      if (this.form.rateSourceType === 'benchmark') {
        // 获取该区间内的所有基准利率调整日期
        const changeDates = this.getBenchmarkChangeDates(start, end)
        this.splitAndAddSegments(start, end, changeDates, 'benchmark')
        return
      }

      const lprStartDate = new Date('2019-08-20')

      // 分界点：2019年8月20日
      if (start < lprStartDate && end >= lprStartDate) {
        // 跨越了两个时期，需要分段
        // 第一段：起始日期到2019-08-19（基准利率）
        const benchmarkChangeDates = this.getBenchmarkChangeDates(start, new Date('2019-08-19'))
        this.splitAndAddSegments(start, new Date('2019-08-19'), benchmarkChangeDates, 'benchmark')
        // 第二段：2019-08-20到截止日期（LPR）
        const lprChangeDates = this.getLprChangeDates(lprStartDate, end)
        this.splitAndAddSegments(lprStartDate, end, lprChangeDates, 'lpr')
      } else if (end < lprStartDate) {
        // 全部使用基准利率
        const changeDates = this.getBenchmarkChangeDates(start, end)
        this.splitAndAddSegments(start, end, changeDates, 'benchmark')
      } else {
        // 全部使用LPR
        const changeDates = this.getLprChangeDates(start, end)
        this.splitAndAddSegments(start, end, changeDates, 'lpr')
      }
    },

    // 获取LPR在指定区间内的调整日期
    getLprChangeDates(start, end) {
      const dates = []
      for (const item of lprData) {
        const date = new Date(item.date)
        if (date > start && date <= end) {
          dates.push(date)
        }
      }
      return dates.sort((a, b) => a - b)
    },

    // 获取基准利率在指定区间内的调整日期
    getBenchmarkChangeDates(start, end) {
      const dates = []
      for (const item of benchmarkData) {
        const date = new Date(item.date)
        if (date > start && date <= end) {
          dates.push(date)
        }
      }
      return dates.sort((a, b) => a - b)
    },

    // 根据调整日期分割并添加分段
    splitAndAddSegments(start, end, changeDates, type) {
      if (changeDates.length === 0) {
        // 没有调整日期，整个区间作为一个分段
        this.addSegment(start, end, type)
        return
      }

      // 有调整日期，需要分段
      let currentStart = start

      for (const changeDate of changeDates) {
        // 前一段：currentStart 到 changeDate 的前一天
        const segmentEnd = new Date(changeDate)
        segmentEnd.setDate(segmentEnd.getDate() - 1)
        this.addSegment(currentStart, segmentEnd, type)

        // 下一段从 changeDate 开始
        currentStart = new Date(changeDate)
      }

      // 最后一段：currentStart 到 end
      this.addSegment(currentStart, end, type)
    },

    // 添加分段
    addSegment(start, end, type) {
      const days = this.getDaysBetween(start, end)
      if (days <= 0) return

      const segment = {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end),
        days: days,
        type: type
      }

      if (type === 'benchmark') {
        const rateInfo = this.getBenchmarkRateForDate(start)
        segment.rateType = '贷款基准利率'
        segment.baseRate = rateInfo.rate
        segment.finalRate = this.applyBenchmarkAdjust(rateInfo.rate)
        segment.levelText = rateInfo.levelText
      } else {
        const rateInfo = this.getLprRateForDate(start)
        segment.rateType = 'LPR'
        segment.baseRate = rateInfo.rate
        segment.finalRate = this.applyLprAdjust(rateInfo.rate)
        segment.levelText = rateInfo.levelText
      }

      segment.interest = this.calculateSegmentInterest(segment)
      this.rateSegments.push(segment)
    },

    // 获取指定日期的基准利率（用于分段计算，始终获取实际利率）
    getBenchmarkRateForDate(date) {
      const dateStr = typeof date === 'string' ? date : this.formatDate(date)
      const compareDate = new Date(dateStr)
      const levels = {
        '6m': '六个月以内',
        '6m_1y': '六个月至一年',
        '1y_3y': '一至三年',
        '3y_5y': '三至五年',
        '5y_plus': '五年以上',
        '1y': '一年以内',
        '1y_5y': '一至五年'
      }

      // benchmarkData是从新到旧排序的，需要反向查找
      // 找到该日期或之前的最近一期利率（即比日期早的最新的那期）
      let selectedRate = null
      for (let i = 0; i < benchmarkData.length; i++) {
        const item = benchmarkData[i]
        const itemDate = new Date(item.date)
        if (itemDate <= compareDate) {
          const level = this.form.benchmarkLevel
          const rate = item[level]
          if (rate !== undefined) {
            // 找到了第一个小于等于目标日期的，这就是最新的适用利率
            selectedRate = { rate, levelText: levels[level] }
            break
          }
        }
      }

      // 如果找不到，返回最旧的（数组最后一个）
      if (!selectedRate) {
        const last = benchmarkData[benchmarkData.length - 1]
        const level = this.form.benchmarkLevel
        return { rate: last[level], levelText: levels[level] }
      }

      return selectedRate
    },

    // 获取指定日期的LPR（用于分段计算，始终获取实际利率）
    getLprRateForDate(date, useFixed = false) {
      const dateStr = typeof date === 'string' ? date : this.formatDate(date)
      const compareDate = new Date(dateStr)
      const levels = { '1y': '1年期LPR', '5y': '5年期以上LPR' }
      const level = this.form.lprLevel

      // lprData是从新到旧排序的，需要反向查找
      // 找到该日期或之前的最近一期LPR（即比日期早的最新的那期）
      let selectedRate = null
      for (let i = 0; i < lprData.length; i++) {
        const item = lprData[i]
        const itemDate = new Date(item.date)
        if (itemDate <= compareDate) {
          // 找到了第一个小于等于目标日期的，这就是最新的适用利率
          selectedRate = { rate: item['rate_' + level], levelText: levels[level] }
          break
        }
      }

      // 如果找不到，返回最旧的（数组最后一个）
      if (!selectedRate) {
        const last = lprData[lprData.length - 1]
        return { rate: last['rate_' + level], levelText: levels[level] }
      }

      return selectedRate
    },

    // 应用基准利率调整
    applyBenchmarkAdjust(rate) {
      const adjustType = this.form.benchmarkAdjustType
      const adjustValue = this.form.benchmarkAdjustValue || 0

      if (adjustType === 'increase') {
        return rate + adjustValue
      } else if (adjustType === 'decrease') {
        return rate - adjustValue
      } else if (adjustType === 'multiple') {
        return rate * adjustValue
      }
      return rate
    },

    // 应用LPR调整
    applyLprAdjust(rate) {
      const bp = (this.form.lprBasisPoints || 0) * 0.01
      let finalRate = rate + bp

      const adjustType = this.form.lprAdjustType
      const adjustValue = this.form.lprAdjustValue || 0

      if (adjustType === 'increase') {
        finalRate = finalRate * (1 + adjustValue / 100)
      } else if (adjustType === 'decrease') {
        finalRate = finalRate * (1 - adjustValue / 100)
      } else if (adjustType === 'multiple') {
        finalRate = finalRate * adjustValue
      }

      return finalRate
    },

    // 计算分段利息
    calculateSegmentInterest(segment) {
      const principal = this.form.principal || 0
      const rate = segment.finalRate
      const days = segment.days
      const daysPerYear = this.form.daysPerYear

      return principal * (rate / 100) * days / daysPerYear
    },

    // 获取计算公式字符串
    getCalculationFormula(segment) {
      const principal = this.form.principal || 0
      const rate = segment.finalRate.toFixed(2)
      const days = segment.days
      const daysPerYear = this.form.daysPerYear

      // 简化的显示格式，根据金额大小选择合适的显示
      const formattedPrincipal = principal.toLocaleString('zh-CN')
      return `${formattedPrincipal} × (${rate}% ÷ ${daysPerYear}) × ${days}`
    },

    // 计算利息
    calculate() {
      this.$refs.calcForm.validate((valid) => {
        if (!valid) return

        let normalInterest = 0

        if (this.form.rateSourceType === 'benchmark_lpr' || this.form.rateSourceType === 'benchmark') {
          this.generateRateSegments()
          normalInterest = this.rateSegments.reduce((sum, seg) => sum + seg.interest, 0)
        } else {
          // 自定义利率
          const days = this.getDaysBetween(this.form.startDate, this.form.endDate)
          const rate = this.getAnnualRate()
          normalInterest = this.form.principal * (rate / 100) * days / this.form.daysPerYear
          this.rateSegments = []
        }

        // 计算迟延履行利息
        let delayInterest = 0
        let delayDays = 0
        if (this.form.calcDelayInterest && this.form.dueDate) {
          delayDays = this.getDaysBetween(this.form.dueDate, this.form.endDate)
          if (delayDays > 0) {
            delayInterest = this.form.principal * 0.000175 * delayDays
          }
        }

        const totalDays = this.getDaysBetween(this.form.startDate, this.form.endDate)
        const totalAmount = normalInterest + delayInterest

        this.result = {
          principal: this.form.principal,
          days: totalDays,
          normalInterest: normalInterest,
          delayInterest: delayInterest,
          totalAmount: totalAmount,
          rateSourceText: this.getRateSourceText()
        }

        // 计算完成后自动滚动到结果区域
        setTimeout(() => {
          const resultCard = this.$refs.resultCard
          if (resultCard && resultCard.$el) {
            resultCard.$el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      })
    },

    // 获取利率来源文本
    getRateSourceText() {
      if (this.form.rateSourceType === 'custom') {
        return `自定义利率 ${this.form.rate}%`
      } else if (this.form.rateSourceType === 'benchmark') {
        return '中国人民银行同期贷款利率'
      }
      return '中国人民银行同期贷款基准利率与LPR自动分段'
    },

    // 计算日期差
    getDaysBetween(start, end) {
      const s = new Date(start)
      const e = new Date(end)
      let days = Math.ceil((e - s) / (1000 * 60 * 60 * 24))

      // 根据日期计算方式调整
      const calcType = this.form.dateCalcType
      if (calcType === 'both_include') {
        days += 1
      } else if (calcType === 'both_exclude') {
        days -= 1
      }
      // start_include: 默认计算（包含开始，不包含结束）
      // end_include: 不包含开始，包含结束

      return days > 0 ? days : 0
    },

    // 格式化日期
    formatDate(date) {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    // 格式化金额
    formatMoney(amount) {
      if (amount === undefined || amount === null) return '-'
      return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    // 重置表单
    resetForm() {
      this.$refs.calcForm.resetFields()
      this.form.rateSourceType = 'custom'
      this.form.rateType = 'year'
      this.form.dateCalcType = 'both_include'
      this.form.daysPerYear = 365
      this.form.benchmarkCalcType = 'segment'
      this.form.benchmarkLevel = '6m_1y'
      this.form.benchmarkAdjustType = 'none'
      this.form.benchmarkAdjustValue = 0
      this.form.lprCalcType = 'segment'
      this.form.lprLevel = '1y'
      this.form.lprBasisPoints = 0
      this.form.lprAdjustType = 'none'
      this.form.lprAdjustValue = 0
      this.form.dueDate = ''
      this.form.calcDelayInterest = false
      this.rateSegments = []
      this.result = null
    },

    // 导出结果
    exportResult() {
      let report = '利息计算报告\n'
      report += '='.repeat(50) + '\n\n'
      report += `计算基数：${this.formatMoney(this.result.principal)} 元\n`
      report += `利率来源：${this.result.rateSourceText}\n`
      report += `计息期间：${this.form.startDate} 至 ${this.form.endDate}\n`
      report += `计息天数：${this.result.days} 天\n`
      report += `一年按：${this.form.daysPerYear}天\n\n`

      if (this.rateSegments.length > 0) {
        report += '利率分段明细：\n'
        report += '-'.repeat(50) + '\n'
        this.rateSegments.forEach((seg, i) => {
          report += `${i + 1}. ${seg.startDate} 至 ${seg.endDate}（${seg.days}天）\n`
          report += `   ${seg.rateType} ${seg.levelText}：${seg.finalRate.toFixed(4)}%\n`
          report += `   利息：${this.formatMoney(seg.interest)} 元\n`
        })
        report += '\n'
      }

      report += `一般债务利息：${this.formatMoney(this.result.normalInterest)} 元\n`
      if (this.form.calcDelayInterest) {
        report += `迟延履行利息：${this.formatMoney(this.result.delayInterest)} 元\n`
      }
      report += `应付总额：${this.formatMoney(this.result.totalAmount)} 元\n\n`
      report += '='.repeat(50) + '\n'
      report += `计算时间：${new Date().toLocaleString('zh-CN')}\n`

      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `利息计算报告_${new Date().getTime()}.txt`
      link.click()
    }
  }
}
</script>

<style lang="scss" scoped>
.calc-form {
  .el-form-item {
    margin-bottom: 15px;
  }
}

.date-format-tip {
  color: #f56c6c;
  font-size: 13px;
  margin: -10px 0 10px 140px;

  i {
    margin-right: 5px;
  }
}

.calc-actions {
  text-align: center;
  margin-top: 30px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;

  .el-button {
    padding: 12px 50px;
    font-size: 16px;
  }
}

.result-card {
  margin-top: 20px;
}

.amount-highlight {
  color: #e6a23c;
  font-weight: bold;

  &.red {
    color: #f56c6c;
  }

  &.large {
    font-size: 18px;
  }
}

// 计算结果汇总样式（参照repayment.vue）
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

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}

::v-deep .el-radio-group {
  display: flex;
  flex-wrap: wrap;

  .el-radio {
    margin-right: 20px;
    margin-bottom: 10px;
    line-height: 32px;
  }
}

// 利率详单表格样式
.rate-detail-table {
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
        vertical-align: middle;
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

  .col-period {
    width: 20%;
    text-align: center;
  }

  .col-days {
    width: 15%;
    text-align: center;
  }

  .col-rate {
    width: 15%;
    text-align: center;
  }

  .col-amount {
    width: 50%;
    text-align: right;
  }

  .date-range {
    display: flex;
    flex-direction: column;
    align-items: center;

    .date-separator {
      color: #666;
      font-size: 12px;
      line-height: 1.2;
    }
  }

  .amount-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .amount-value {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .amount-formula {
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }
  }
}
</style>
