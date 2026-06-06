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
            <el-form-item label="还款类型">
              <el-radio-group v-model="form.repaymentType">
                <el-radio label="interest_first">先息后本</el-radio>
                <el-radio label="principal_first">先本后息</el-radio>
              </el-radio-group>
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
            <el-form-item label="自定义利率（%）" prop="customRate" :rules="[{ required: form.rateSourceType === 'custom', message: '请输入利率' }]">
              <el-input-number v-model="form.customRate" :precision="6" :min="0" style="width: 100%" placeholder="请输入利率" />
            </el-form-item>
            <el-form-item label="利率周期">
              <el-radio-group v-model="form.customRatePeriod">
                <el-radio label="day">日</el-radio>
                <el-radio label="month">月</el-radio>
                <el-radio label="year">年</el-radio>
              </el-radio-group>
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
        </el-row>

        <el-row v-if="form.rateSourceType === 'auto'" :gutter="20">
          <el-col :span="12">
            <el-form-item label="LPR调整方式">
              <el-radio-group v-model="form.lprAdjustType">
                <el-radio label="bp">基点（1 BP=0.01%）</el-radio>
                <el-radio label="ratio">加计 | 浮动 | 倍数</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="form.rateSourceType === 'auto' && form.lprAdjustType === 'bp'" :gutter="20">
          <el-col :span="12">
            <el-form-item label="调整方向">
              <el-radio-group v-model="form.lprBpDirection">
                <el-radio label="none">无</el-radio>
                <el-radio label="add">+(加)</el-radio>
                <el-radio label="subtract">-(减)</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.lprBpDirection !== 'none'" :span="12">
            <el-form-item label="基点数（BP）">
              <el-input-number v-model="form.lprBpValue" :precision="0" :min="0" style="width: 100%" placeholder="如 50 表示50个基点" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="form.rateSourceType === 'auto' && form.lprAdjustType === 'ratio'" :gutter="20">
          <el-col :span="12">
            <el-form-item label="调整类型">
              <el-radio-group v-model="form.lprRatioSubtype">
                <el-radio label="none">无</el-radio>
                <el-radio label="加计">加计</el-radio>
                <el-radio label="上浮">上浮</el-radio>
                <el-radio label="下浮">下浮</el-radio>
                <el-radio label="倍数">倍数</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="form.lprRatioSubtype === '倍数'" :span="12">
            <el-form-item label="倍数">
              <el-input-number v-model="form.lprRatioValue" :precision="2" :min="0" style="width: 100%" placeholder="如 1.5 表示LPR的1.5倍" />
            </el-form-item>
          </el-col>
          <el-col v-else-if="form.lprRatioSubtype !== 'none'" :span="12">
            <el-form-item label="上浮比例（%）">
              <el-input-number v-model="form.lprRatioValue" :precision="2" :min="0" style="width: 100%" placeholder="如 50 表示上浮50%" />
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
            <el-button type="success" size="small" style="margin-bottom: 15px; margin-left: 10px;" @click="$refs.fileInput.click()">
              <i class="el-icon-upload" /> 批量导入
            </el-button>
            <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none" @change="handleFileChange">
            <span style="margin-left: 10px; color: #909399; font-size: 12px;">导入文件为 Excel，列名为【还款日期】、【还款金额】</span>
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
    <el-card v-if="result" ref="resultCard" class="box-card result-card">
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
              <th v-if="form.calcDelayInterest" class="col-delay">累计迟延利息（含利率）</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(segment, index) in mergedSegments">
              <tr v-if="!segment.isRepaymentNode" :key="'seg-' + index" class="data-row">
                <td class="col-date">{{ segment.startDate }}</td>
                <td class="col-date">{{ segment.endDate }}</td>
                <td class="col-days">{{ segment.days }}</td>
                <td class="col-rate">{{ segment.rate.toFixed(2) }}% ({{ segment.rateType === 'lpr' ? 'LPR' : '基准' }})</td>
                <td class="col-interest">{{ formatMoney(segment.normalInterest) }}</td>
                <td v-if="form.calcDelayInterest" class="col-delay">
                  <template v-if="segment.delayInterest > 0">
                    <div>{{ formatMoney(segment.delayInterest) }}</div>
                    <div class="delay-rate-text">{{ segment.delayRateText || '-' }}</div>
                  </template>
                  <template v-else>
                    -
                  </template>
                </td>
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
const LPR_START_DATE = '2019-08-20'

// LPR数据缓存（从新到旧排序）
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
  { date: '2020-08-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-07-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-06-22', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-05-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-04-20', rate_1y: 3.85, rate_5y: 4.65 },
  { date: '2020-03-20', rate_1y: 4.05, rate_5y: 4.75 },
  { date: '2020-02-20', rate_1y: 4.05, rate_5y: 4.75 },
  { date: '2020-01-20', rate_1y: 4.15, rate_5y: 4.80 },
  { date: '2019-12-20', rate_1y: 4.15, rate_5y: 4.80 },
  { date: '2019-11-20', rate_1y: 4.15, rate_5y: 4.80 },
  { date: '2019-10-21', rate_1y: 4.20, rate_5y: 4.85 },
  { date: '2019-09-20', rate_1y: 4.20, rate_5y: 4.85 },
  { date: '2019-08-20', rate_1y: 4.25, rate_5y: 4.85 }
]

// 贷款基准利率数据（2019-08-20前使用）
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
  { date: '2010-10-20', '6m': 5.10, '6m_1y': 5.56, '1y_3y': 5.60, '3y_5y': 5.96, '5y_plus': 6.14 },
  // 图片补充历史数据（2014-11-22之前）
  { date: '2008-12-23', '6m': 4.86, '6m_1y': 5.31, '1y_3y': 5.40, '3y_5y': 5.76, '5y_plus': 5.94 },
  { date: '2008-11-27', '6m': 5.04, '6m_1y': 5.58, '1y_3y': 5.67, '3y_5y': 5.94, '5y_plus': 6.12 },
  { date: '2008-10-30', '6m': 6.03, '6m_1y': 6.66, '1y_3y': 6.75, '3y_5y': 7.02, '5y_plus': 7.20 },
  { date: '2008-10-09', '6m': 6.12, '6m_1y': 6.93, '1y_3y': 7.02, '3y_5y': 7.29, '5y_plus': 7.47 },
  { date: '2008-09-16', '6m': 6.21, '6m_1y': 7.20, '1y_3y': 7.29, '3y_5y': 7.56, '5y_plus': 7.74 },
  { date: '2007-12-21', '6m': 6.57, '6m_1y': 7.47, '1y_3y': 7.56, '3y_5y': 7.74, '5y_plus': 7.83 },
  { date: '2007-09-15', '6m': 6.48, '6m_1y': 7.29, '1y_3y': 7.47, '3y_5y': 7.65, '5y_plus': 7.83 },
  { date: '2007-08-22', '6m': 6.21, '6m_1y': 7.02, '1y_3y': 7.20, '3y_5y': 7.38, '5y_plus': 7.56 },
  { date: '2007-07-21', '6m': 6.03, '6m_1y': 6.84, '1y_3y': 7.02, '3y_5y': 7.20, '5y_plus': 7.38 },
  { date: '2007-05-19', '6m': 5.85, '6m_1y': 6.57, '1y_3y': 6.75, '3y_5y': 6.93, '5y_plus': 7.20 },
  { date: '2007-03-18', '6m': 5.67, '6m_1y': 6.39, '1y_3y': 6.57, '3y_5y': 6.75, '5y_plus': 7.11 },
  { date: '2006-08-19', '6m': 5.58, '6m_1y': 6.12, '1y_3y': 6.30, '3y_5y': 6.48, '5y_plus': 6.84 },
  { date: '2006-04-28', '6m': 5.40, '6m_1y': 5.85, '1y_3y': 6.03, '3y_5y': 6.12, '5y_plus': 6.39 },
  { date: '2004-10-29', '6m': 5.22, '6m_1y': 5.58, '1y_3y': 5.76, '3y_5y': 5.85, '5y_plus': 6.12 },
  { date: '2002-02-21', '6m': 5.04, '6m_1y': 5.31, '1y_3y': 5.49, '3y_5y': 5.58, '5y_plus': 5.76 },
  { date: '1999-06-10', '6m': 5.58, '6m_1y': 5.85, '1y_3y': 5.94, '3y_5y': 6.03, '5y_plus': 6.21 },
  { date: '1998-12-07', '6m': 6.12, '6m_1y': 6.39, '1y_3y': 6.66, '3y_5y': 7.20, '5y_plus': 7.56 },
  { date: '1998-07-01', '6m': 6.57, '6m_1y': 6.93, '1y_3y': 7.11, '3y_5y': 7.65, '5y_plus': 8.01 },
  { date: '1998-03-25', '6m': 7.02, '6m_1y': 7.92, '1y_3y': 9.00, '3y_5y': 9.72, '5y_plus': 10.35 },
  { date: '1997-10-23', '6m': 7.65, '6m_1y': 8.64, '1y_3y': 9.36, '3y_5y': 9.90, '5y_plus': 10.53 },
  { date: '1996-08-23', '6m': 9.18, '6m_1y': 10.08, '1y_3y': 10.98, '3y_5y': 11.70, '5y_plus': 12.42 },
  { date: '1996-05-01', '6m': 9.72, '6m_1y': 10.98, '1y_3y': 13.14, '3y_5y': 14.94, '5y_plus': 15.12 },
  { date: '1995-07-01', '6m': 10.08, '6m_1y': 12.06, '1y_3y': 13.50, '3y_5y': 15.12, '5y_plus': 15.30 },
  { date: '1995-01-01', '6m': 9.00, '6m_1y': 10.98, '1y_3y': 12.96, '3y_5y': 14.58, '5y_plus': 14.76 },
  { date: '1993-07-11', '6m': 9.00, '6m_1y': 10.98, '1y_3y': 12.24, '3y_5y': 13.86, '5y_plus': 14.04 },
  { date: '1993-05-15', '6m': 8.82, '6m_1y': 9.36, '1y_3y': 10.80, '3y_5y': 12.06, '5y_plus': 12.24 },
  { date: '1991-04-21', '6m': 8.10, '6m_1y': 8.64, '1y_3y': 9.00, '3y_5y': 9.54, '5y_plus': 9.72 }
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
        customRatePeriod: 'day',
        repaymentType: 'interest_first',
        interestStartDate: '',
        delayInterestStartDate: '',
        endDate: formatDateStr(today),
        calcDelayInterest: true,
        lprLevel: '1y',
        lprAdjustType: 'bp',
        lprBpDirection: 'none',
        lprBpValue: 0,
        lprRatioSubtype: 'none',
        lprRatioValue: 0
      },
      repayments: [],
      result: null
    }
  },
  computed: {
    // 合并相同利率的连续时间段（还款节点之间）
    mergedSegments() {
      if (!this.result || !this.result.segments) return []

      const merged = []
      let current = null

      for (const segment of this.result.segments) {
        // 如果是还款节点，直接添加并重置当前合并段
        if (segment.isRepaymentNode) {
          if (current) {
            merged.push(current)
            current = null
          }
          merged.push(segment)
          continue
        }

        // 普通时间段，尝试合并
        if (!current) {
          // 开始新的合并段
          current = { ...segment }
        } else if (Math.abs(segment.rate - current.rate) < 0.0001 && segment.rateType === current.rateType) {
          // 利率相同，合并
          current.endDate = segment.endDate
          current.days += segment.days
          current.normalInterest += segment.normalInterest
          // 保留最新的累计迟延利息
          current.delayInterest = segment.delayInterest
          const rateTexts = [
            ...(current.delayRateText ? current.delayRateText.split('；') : []),
            ...(segment.delayRateText ? segment.delayRateText.split('；') : [])
          ].filter(Boolean)
          current.delayRateText = [...new Set(rateTexts)].join('；')
        } else {
          // 利率不同，保存当前段，开始新段
          merged.push(current)
          current = { ...segment }
        }
      }

      // 添加最后一段
      if (current) {
        merged.push(current)
      }

      return merged
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

    // 判断是否使用LPR时期（2019-08-20及之后）
    isLprPeriod(date) {
      return new Date(date) >= new Date(LPR_START_DATE)
    },

    // 应用自动分段模式下的利率调整方式
    applyAutoRateAdjustment(baseRate) {
      let adjustedRate = baseRate
      if (this.form.lprAdjustType === 'bp') {
        const bpVal = this.form.lprBpValue || 0
        if (this.form.lprBpDirection === 'add') {
          adjustedRate = baseRate + bpVal * 0.01
        } else if (this.form.lprBpDirection === 'subtract') {
          adjustedRate = baseRate - bpVal * 0.01
        }
      } else {
        if (this.form.lprRatioSubtype === '倍数') {
          const ratio = this.form.lprRatioValue || 1
          adjustedRate = baseRate * ratio
        } else if (this.form.lprRatioSubtype === '加计' || this.form.lprRatioSubtype === '上浮') {
          const pct = this.form.lprRatioValue || 0
          adjustedRate = baseRate * (1 + pct / 100)
        } else if (this.form.lprRatioSubtype === '下浮') {
          const pct = this.form.lprRatioValue || 0
          adjustedRate = baseRate * (1 - pct / 100)
        }
      }

      return adjustedRate
    },

    // 获取指定日期的LPR
    getLprRateForDate(date) {
      const compareDate = new Date(date)
      const level = this.form.lprLevel

      let baseRate = lprData[lprData.length - 1]['rate_' + level]
      for (let i = 0; i < lprData.length; i++) {
        const item = lprData[i]
        const itemDate = new Date(item.date)
        if (itemDate <= compareDate) {
          baseRate = item['rate_' + level]
          break
        }
      }

      return { rate: this.applyAutoRateAdjustment(baseRate), type: 'lpr' }
    },

    // 获取指定日期的基准利率
    getBenchmarkRateForDate(date, applyAdjustment = false) {
      const compareDate = new Date(date)
      const pickBenchmarkRate = (row) => {
        // 新利率体系优先取1y；旧利率体系回退到接近一年期档次
        if (row['1y'] !== undefined && row['1y'] !== null) return row['1y']
        if (row['6m_1y'] !== undefined && row['6m_1y'] !== null) return row['6m_1y']
        if (row['1y_3y'] !== undefined && row['1y_3y'] !== null) return row['1y_3y']
        if (row['1y_5y'] !== undefined && row['1y_5y'] !== null) return row['1y_5y']
        if (row['6m'] !== undefined && row['6m'] !== null) return row['6m']
        return 0
      }

      for (let i = 0; i < benchmarkData.length; i++) {
        const item = benchmarkData[i]
        const itemDate = new Date(item.date)
        if (itemDate <= compareDate) {
          const rate = pickBenchmarkRate(item)
          return { rate: applyAdjustment ? this.applyAutoRateAdjustment(rate) : rate, type: 'benchmark' }
        }
      }
      const rate = pickBenchmarkRate(benchmarkData[benchmarkData.length - 1])
      return { rate: applyAdjustment ? this.applyAutoRateAdjustment(rate) : rate, type: 'benchmark' }
    },

    // 按法规分段计算迟延履行利息：
    // 2014-08-01之前：同期贷款基准利率 × 2
    // 2014-08-01及之后：日万分之1.75
    calculateDelayInterestByRule(principal, periodStartDate, periodEndDate) {
      const ruleDate = '2014-08-01'
      const ruleDateObj = new Date(ruleDate)

      const periodStart = new Date(periodStartDate)
      const periodEnd = new Date(periodEndDate)
      if (periodEnd < periodStart) return { interest: 0, rateText: '' }

      let delayInterest = 0
      const rateNotes = []

      // 旧规区间：periodStartDate ~ min(periodEndDate, 2014-08-01)，结束日按区间右开
      if (periodStart < ruleDateObj) {
        const oldEndDate = periodEnd <= ruleDateObj ? periodEndDate : ruleDate
        const oldDays = Math.max(this.getDaysBetween(periodStartDate, oldEndDate), 0)
        if (oldDays > 0) {
          const oldRate = this.getBenchmarkRateForDate(periodStartDate).rate || 0
          delayInterest += principal * (oldRate / 100) * 2 * oldDays / 365
          rateNotes.push(`旧规：${oldRate.toFixed(2)}%×2`)
        }
      }

      // 新规区间：max(periodStartDate, 2014-08-01) ~ periodEndDate，结束日按区间右开
      if (periodEnd >= ruleDateObj) {
        const newStartDate = periodStart >= ruleDateObj ? periodStartDate : ruleDate
        const newDays = Math.max(this.getDaysBetween(newStartDate, periodEndDate), 0)
        if (newDays > 0) {
          delayInterest += principal * 0.000175 * newDays
          rateNotes.push('新规：日万分之1.75')
        }
      }

      return {
        interest: delayInterest,
        rateText: rateNotes.join('；')
      }
    },

    // 获取指定日期的适用利率
    getRateForDate(date) {
      if (this.form.rateSourceType === 'custom') {
        let rate = this.form.customRate || 0
        if (this.form.customRatePeriod === 'month') {
          // 统一口径：月利率先年化（×12）再折算日利率（÷365）
          rate = rate * 12 / 365
        } else if (this.form.customRatePeriod === 'year') {
          rate = rate / 365
        }
        return { rate: rate, type: 'custom', isDailyRate: true }
      }
      if (this.isLprPeriod(date)) {
        return this.getLprRateForDate(date)
      }
      return this.getBenchmarkRateForDate(date, true)
    },

    // 获取指定区间内的利率调整日期列表
    getRateChangeDates(startDate, endDate) {
      const dates = []
      const start = new Date(startDate)
      const end = new Date(endDate)

      // 分界点 2019-08-20
      const boundaryDate = new Date(LPR_START_DATE)
      if (start < boundaryDate && end >= boundaryDate) {
        dates.push(LPR_START_DATE)
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

      // 基准利率调整日期（2019-08-20前）
      if (start < boundaryDate) {
        const bmEnd = end < boundaryDate ? end : new Date('2019-08-19')
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
      // 确定实际计算起始日（取利息起算日和延迟利息起算日中较早的一个）
      let effectiveStartDate = startDate
      if (this.form.calcDelayInterest && this.form.delayInterestStartDate) {
        if (this.form.delayInterestStartDate < startDate) {
          effectiveStartDate = this.form.delayInterestStartDate
        }
      }

      // 获取所有分割点
      const allPoints = [effectiveStartDate, endDate]

      // 添加还款日期（从实际起算日开始）
      for (const repayment of this.repayments) {
        if (repayment.date && repayment.date > effectiveStartDate && repayment.date <= endDate) {
          allPoints.push(repayment.date)
        }
      }

      // 添加利率调整日期（从实际起算日开始）
      const rateChangeDates = this.getRateChangeDates(effectiveStartDate, endDate)
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

    // 处理文件导入
    handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      // 动态导入 xlsx 库
      import('xlsx').then(XLSX => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })

            // 读取第一个工作表
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            // 使用 raw: false 让 xlsx 自动格式化日期为字符串
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false })

            // 解析还款记录
            this.parseImportedData(jsonData)

            // 清空文件输入，允许再次导入同一文件
            this.$refs.fileInput.value = ''
          } catch (error) {
            this.$message.error('文件解析失败：' + error.message)
            this.$refs.fileInput.value = ''
          }
        }
        reader.readAsArrayBuffer(file)
      })
    },

    // 解析导入的数据
    parseImportedData(data) {
      if (!data || data.length < 2) {
        this.$message.warning('文件中没有有效的还款记录')
        return
      }

      // 查找表头行（支持多种列名格式）
      let dateColIndex = -1
      let amountColIndex = -1
      let headerRowIndex = -1

      for (let i = 0; i < Math.min(5, data.length); i++) {
        const row = data[i]
        if (!Array.isArray(row)) continue

        for (let j = 0; j < row.length; j++) {
          const cell = String(row[j] || '').trim()
          // 支持多种可能的列名
          if (cell.includes('日期') || cell.toLowerCase().includes('date')) {
            dateColIndex = j
            headerRowIndex = i
          }
          if (cell.includes('金额') || cell.toLowerCase().includes('amount') || cell.includes('还款')) {
            amountColIndex = j
            headerRowIndex = i
          }
        }

        if (dateColIndex !== -1 && amountColIndex !== -1) break
      }

      // 如果没找到表头，默认使用前两列
      if (dateColIndex === -1) dateColIndex = 0
      if (amountColIndex === -1) amountColIndex = 1
      if (headerRowIndex === -1) headerRowIndex = 0

      // 解析数据行
      const importedRepayments = []
      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i]
        if (!Array.isArray(row) || row.length === 0) continue

        const date = row[dateColIndex]
        const amount = row[amountColIndex]

        // 跳过空行
        if (!date && !amount) continue

        // 解析日期（支持多种格式）
        const parsedDate = this.parseImportedDate(date)

        // 解析金额（支持字符串中的数字）
        const parsedAmount = this.parseImportedAmount(amount)

        if (parsedDate && parsedAmount > 0) {
          importedRepayments.push({
            date: parsedDate,
            amount: parsedAmount
          })
        }
      }

      if (importedRepayments.length === 0) {
        this.$message.warning('未找到有效的还款记录，请检查文件格式')
        return
      }

      // 按日期排序
      importedRepayments.sort((a, b) => new Date(a.date) - new Date(b.date))

      // 添加到现有还款记录
      this.repayments.push(...importedRepayments)

      this.$message.success(`成功导入 ${importedRepayments.length} 条还款记录`)
    },

    // 解析导入的日期（支持多种格式）
    parseImportedDate(dateValue) {
      if (!dateValue) return null

      // 如果是日期对象（Excel序列号会被解析为Date）
      if (dateValue instanceof Date) {
        // 使用本地时间，避免时区偏移
        const year = dateValue.getFullYear()
        const month = String(dateValue.getMonth() + 1).padStart(2, '0')
        const day = String(dateValue.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 数字（Excel日期序列号）
      if (typeof dateValue === 'number') {
        // Excel日期序列号转换（1900年日期系统）
        // Excel 的日期从 1900-01-00 开始（实际上有bug，1900年被当作闰年）
        const excelEpoch = new Date(Date.UTC(1899, 11, 30))
        const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 字符串
      const dateStr = String(dateValue).trim()

      // 匹配 yyyy-MM-dd 或 yyyy/MM/dd 格式（支持多位或单数月和日）
      const match = dateStr.match(/(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/)
      if (match) {
        const year = match[1]
        const month = match[2].padStart(2, '0')
        const day = match[3].padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 匹配 MM/dd/yyyy 格式（美式日期）
      const usMatch = dateStr.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/)
      if (usMatch) {
        const month = usMatch[1].padStart(2, '0')
        const day = usMatch[2].padStart(2, '0')
        const year = usMatch[3]
        return `${year}-${month}-${day}`
      }

      // 尝试直接解析
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      return null
    },

    // 解析导入的金额
    parseImportedAmount(amountValue) {
      if (!amountValue) return 0

      if (typeof amountValue === 'number') {
        return parseFloat(amountValue.toFixed(2))
      }

      // 移除货币符号、逗号和空格，只保留数字和小数点
      const cleanStr = String(amountValue).replace(/[￥,$,，\s]/g, '')
      const amount = parseFloat(cleanStr)

      return isNaN(amount) ? 0 : parseFloat(amount.toFixed(2))
    },

    // 重置表单
    resetForm() {
      this.$refs.form.resetFields()
      this.form.customRatePeriod = 'day'
      this.form.lprAdjustType = 'bp'
      this.form.lprBpDirection = 'none'
      this.form.lprBpValue = 0
      this.form.lprRatioSubtype = 'none'
      this.form.lprRatioValue = 0
      this.repayments = []
      this.result = null
    },

    // 计算还款计划
    calculate() {
      this.$refs.form.validate((valid) => {
        if (!valid) return

        const principal = this.form.principal || 0
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
          // 只有时间段在利息起算日之后或等于利息起算日时才计算一般利息
          let normalInterest = 0
          if (period.startDate >= startDate) {
            normalInterest = rateInfo.isDailyRate
              ? currentPrincipal * (rateInfo.rate / 100) * days
              : currentPrincipal * (rateInfo.rate / 100) * days / 365
            accumulatedNormalInterest += normalInterest
            totalNormalInterest += normalInterest
          }

          // 计算迟延履行利息（按2014-08-01前后分段规则）
          let delayInterest = 0
          let delayRateText = ''
          if (this.form.calcDelayInterest && delayStartDate) {
            const periodStart = new Date(period.startDate)
            const periodEnd = new Date(period.endDate)
            const delayStart = new Date(delayStartDate)

            if (periodStart >= delayStart) {
              // 整段都在延迟履行期间
              const delayCalc = this.calculateDelayInterestByRule(currentPrincipal, period.startDate, period.endDate)
              delayInterest = delayCalc.interest
              delayRateText = delayCalc.rateText
            } else if (periodEnd >= delayStart) {
              // 部分在延迟履行期间（从迟延起算日开始计）
              const delayCalc = this.calculateDelayInterestByRule(currentPrincipal, delayStartDate, period.endDate)
              delayInterest = delayCalc.interest
              delayRateText = delayCalc.rateText
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
            delayRateText: this.form.calcDelayInterest ? delayRateText : '',
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
            totalNormalInterest: totalNormalInterest,
            totalDelayInterest: accumulatedDelayInterest,
            totalAmount: currentPrincipal + accumulatedNormalInterest + accumulatedDelayInterest
          },
          segments: segments
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

    // 导出结果（Excel格式）
    exportResult() {
      if (!this.result) return

      // 动态导入 xlsx 库
      import('xlsx').then(XLSX => {
        // 创建工作簿
        const wb = XLSX.utils.book_new()

        // ===== 汇总信息表 =====
        const summaryData = [
          ['债务本金', this.formatMoney(this.result.summary.principal) + ' 元'],
          ['一般利息合计', this.formatMoney(this.result.summary.totalNormalInterest) + ' 元'],
          ...(this.form.calcDelayInterest ? [['迟延履行利息合计', this.formatMoney(this.result.summary.totalDelayInterest) + ' 元']] : []),
          ['应付总额', this.formatMoney(this.result.summary.totalAmount) + ' 元']
        ]

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(wb, summaryWs, '汇总信息')

        // ===== 分段明细表 =====
        const detailHeaders = ['开始日期', '结束日期', '天数', '利率', '利率类型', '一般利息']
        if (this.form.calcDelayInterest) {
          detailHeaders.push('累计迟延履行利息（含利率）')
        }

        const detailData = [detailHeaders]

        for (const segment of this.mergedSegments) {
          if (segment.isRepaymentNode) {
            // 还款节点单独一行显示
            const info = segment.repaymentInfo
            detailData.push([
              `[中途还款] ${info.date}`,
              '',
              '',
              `还款：${this.formatMoney(info.amount)} 元`,
              '',
              `剩余本金：${this.formatMoney(info.remainingPrincipal)} 元`
            ])
          } else {
            // 普通时间段
            const row = [
              segment.startDate,
              segment.endDate,
              segment.days,
              segment.rate.toFixed(2) + '%',
              segment.rateType === 'lpr' ? 'LPR' : (segment.rateType === 'benchmark' ? '基准利率' : '自定义'),
              this.formatMoney(segment.normalInterest)
            ]
            if (this.form.calcDelayInterest) {
              row.push(segment.delayInterest > 0 ? `${this.formatMoney(segment.delayInterest)} (${segment.delayRateText || '-'})` : '-')
            }
            detailData.push(row)
          }
        }

        const detailWs = XLSX.utils.aoa_to_sheet(detailData)
        XLSX.utils.book_append_sheet(wb, detailWs, '分段明细')

        // 设置列宽
        detailWs['!cols'] = [
          { wch: 14 },
          { wch: 14 },
          { wch: 8 },
          { wch: 12 },
          { wch: 10 },
          { wch: 15 },
          ...(this.form.calcDelayInterest ? [{ wch: 18 }] : [])
        ]

        // 下载文件
        const fileName = `还款计划计算报告_${new Date().getTime()}.xlsx`
        XLSX.writeFile(wb, fileName)
      })
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
.col-delay { width: 20%; }

.delay-rate-text {
  margin-top: 4px;
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

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
