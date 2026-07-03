import {
  createAccountFundListQuery,
  createAccountFundExportData,
  formatAccountFundAmount,
  getDefaultAccountFundDateRange,
  getDefaultNotaxPayoutTypeOptions,
  getAccountFundQueryConfig,
  normalizeNotaxPayoutTypeOptions
} from '@/dagl/utils/accountFundQuery'

const fs = require('fs')

const backendPath = '/Applications/MAMP/htdocs/cccf/app/cccf/model/Plugins.php'
const backendConfigPath = '/Applications/MAMP/htdocs/cccf/app/cccf/config.php'

describe('account fund query config', () => {
  it('uses a date range with dzdate for income queries against shoukuan data', () => {
    const config = getAccountFundQueryConfig('income')
    const query = createAccountFundListQuery('income', {
      dateRange: ['2026-06-15', '2026-06-21'],
      keyword: '执行款',
      page: 2,
      pagesize: 20
    })

    expect(config.title).toBe('进账查询')
    expect(config.apiName).toBe('queryList_sk')
    expect(query).toEqual({
      page: 2,
      pagesize: 20,
      keyword: '执行款',
      ignore_dwid: 1,
      datetype: 'dzdate',
      starttime: '2026-06-15',
      endtime: '2026-06-21'
    })
  })

  it('uses a date range with czdate for outcome queries against tuikuan data', () => {
    const config = getAccountFundQueryConfig('outcome')
    const query = createAccountFundListQuery('outcome', {
      dateRange: ['2026-06-15', '2026-06-21'],
      keyword: '退款',
      page: 1,
      pagesize: 10
    })

    expect(config.title).toBe('出账查询')
    expect(config.apiName).toBe('queryList_tk')
    expect(query).toEqual({
      page: 1,
      pagesize: 10,
      keyword: '退款',
      ignore_dwid: 1,
      datetype: 'czdate',
      starttime: '2026-06-15',
      endtime: '2026-06-21'
    })
  })

  it('defaults to the latest seven calendar days', () => {
    expect(getDefaultAccountFundDateRange(new Date('2026-06-21T12:00:00'))).toEqual([
      '2026-06-15',
      '2026-06-21'
    ])
  })

  it('keeps plugin api methods bound to the plugins object when searching', () => {
    const plugins = {
      ACTION: {
        queryList_sk: '/plugins/sklist'
      },
      queryList_sk() {
        return this.ACTION.queryList_sk
      }
    }
    const apiName = getAccountFundQueryConfig('income').apiName

    expect(plugins[apiName]()).toBe('/plugins/sklist')
  })

  it('shows applicant and respondent columns instead of party summary', () => {
    const incomeFields = getAccountFundQueryConfig('income').columns.map(column => column.field)
    const outcomeFields = getAccountFundQueryConfig('outcome').columns.map(column => column.field)

    expect(incomeFields).toEqual(expect.arrayContaining(['yg', 'bg']))
    expect(outcomeFields).toEqual(expect.arrayContaining(['yg', 'bg']))
    expect(incomeFields).not.toContain('dsr')
    expect(outcomeFields).not.toContain('dsr')
  })

  it('hides clerk from income and voucher number from outcome columns', () => {
    const incomeFields = getAccountFundQueryConfig('income').columns.map(column => column.field)
    const outcomeFields = getAccountFundQueryConfig('outcome').columns.map(column => column.field)

    expect(incomeFields).not.toContain('sjy')
    expect(incomeFields).not.toContain('cbbm')
    expect(outcomeFields).not.toContain('czdh')
  })

  it('shows account type, payee account name, and clerk note in outcome columns', () => {
    const outcomeColumns = getAccountFundQueryConfig('outcome').columns.map(column => ({
      field: column.field,
      label: column.label
    }))

    expect(outcomeColumns).toEqual([
      { field: 'czdate', label: '出账日期' },
      { field: 'djcode', label: '来源票据号码' },
      { field: 'ah', label: '案号' },
      { field: 'yg', label: '申请人' },
      { field: 'bg', label: '被执行人' },
      { field: 'skr', label: '实际收款人' },
      { field: 'ssdw', label: '诉讼地位' },
      { field: 'skr_gx', label: '账户类型' },
      { field: 'skr_accountname', label: '收款人户名' },
      { field: 'je', label: '出账金额' },
      { field: 'cbr', label: '承办人' },
      { field: 'note', label: '承办人说明' }
    ])
  })

  it('normalizes payout type options from backend config', () => {
    const options = normalizeNotaxPayoutTypeOptions({
      types: {
        execution_fee: {
          label: '执行费',
          keywords: ['执行费', '执费']
        },
        confiscation: {
          label: '罚没',
          keywords: ['罚没']
        }
      }
    })

    expect(options).toEqual([
      { value: 'execution_fee', label: '执行费' },
      { value: 'confiscation', label: '罚没' }
    ])
  })

  it('keeps default payout type options as a fallback', () => {
    expect(getDefaultNotaxPayoutTypeOptions()).toEqual([
      { value: 'execution_fee', label: '执行费' },
      { value: 'fine', label: '罚金' },
      { value: 'case_acceptance_fee', label: '案件受理费' },
      { value: 'preservation_fee', label: '保全费' },
      { value: 'recovery', label: '追缴' },
      { value: 'confiscation', label: '罚没' }
    ])
  })

  it('adds payout type query parameter for outcome queries', () => {
    const query = createAccountFundListQuery('outcome', {
      dateRange: ['2026-06-15', '2026-06-21'],
      keyword: '',
      page: 1,
      pagesize: 10,
      payout_type: 'recovery'
    })

    expect(query.payout_type).toBe('recovery')
  })

  it('adds payee type options and query parameter for outcome queries', () => {
    const config = getAccountFundQueryConfig('outcome')
    const query = createAccountFundListQuery('outcome', {
      dateRange: ['2026-06-15', '2026-06-21'],
      keyword: '',
      page: 1,
      pagesize: 10,
      payee_type: 'applicant'
    })

    expect(config.payeeTypeOptions).toEqual([
      { value: 'applicant', label: '申请执行人' },
      { value: 'respondent', label: '被执行人' },
      { value: 'other', label: '其他' }
    ])
    expect(query.payee_type).toBe('applicant')
  })

  it('formats comma-separated amount strings without truncating them', () => {
    expect(formatAccountFundAmount('1,234.56')).toBe('1,234.56')
    expect(formatAccountFundAmount('2,000')).toBe('2,000.00')
  })

  it('builds export headers and rows from visible columns', () => {
    const columns = getAccountFundQueryConfig('income').columns
    const exportData = createAccountFundExportData(columns, [{
      dzdate: '2026-06-10',
      djcode: 'ZXYJ001',
      ah: '（2026）辽0804执1号',
      yg: '张三',
      bg: '李四',
      jzje: '1,234.56',
      cbr: '王五'
    }])

    expect(exportData.header).toEqual([
      '序号',
      '到账日期',
      '进账票号',
      '案号',
      '申请人',
      '被执行人',
      '进账金额',
      '承办人'
    ])
    expect(exportData.data[0]).toEqual([
      1,
      '2026-06-10',
      'ZXYJ001',
      '（2026）辽0804执1号',
      '张三',
      '李四',
      1234.56,
      '王五'
    ])
  })

  it('uses comma-safe amount aggregation for income and outcome query totals', () => {
    const backendSource = fs.readFileSync(backendPath, 'utf8')
    const incomeQuery = backendSource.match(/protected function queryList_sk\(\$param = \[\]\)[\s\S]*?protected function queryList_tk\(\$param = \[\]\)/)[0]
    const outcomeQuery = backendSource.match(/protected function queryList_tk\(\$param = \[\]\)[\s\S]*?protected function applyPayeeTypeWhere/)[0]

    expect(incomeQuery).toContain('"SUM(CAST(REPLACE(IFNULL(jzje, \'0\'), \',\', \'\') AS DECIMAL(18,2)))" => "je"')
    expect(incomeQuery).not.toContain('sum(jzje)')
    expect(outcomeQuery).toContain('"SUM(CAST(REPLACE(IF(je=\'\' OR je IS NULL, \'0\', je), \',\', \'\') AS DECIMAL(18,2)))" => "je"')
    expect(outcomeQuery).not.toContain('sum(je)')
  })

  it('exposes notax payout type config from backend without duplicate recovery key', () => {
    const backendSource = fs.readFileSync(backendPath, 'utf8')
    const backendConfig = fs.readFileSync(backendConfigPath, 'utf8')

    expect(backendSource).toContain("case 'notaxPayoutTypes':")
    expect(backendSource).toContain('protected function notaxPayoutTypes()')
    expect(backendConfig).toContain("'recovery'=>[")
    expect(backendConfig).toContain("'confiscation'=>[")
    expect(backendConfig.match(/'recovery'=>\[/g)).toHaveLength(1)
  })
})
