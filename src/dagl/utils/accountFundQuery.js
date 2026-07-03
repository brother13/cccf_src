const CONFIG_MAP = {
  income: {
    title: '进账查询',
    apiName: 'queryList_sk',
    dateField: 'dzdate',
    amountField: 'jzje',
    amountLabel: '进账金额',
    columns: [
      { field: 'dzdate', label: '到账日期', width: 120 },
      { field: 'djcode', label: '进账票号', width: 140 },
      { field: 'ah', label: '案号', width: 220 },
      { field: 'yg', label: '申请人', width: 220 },
      { field: 'bg', label: '被执行人', width: 220 },
      { field: 'jzje', label: '进账金额', align: 'right', width: 120 },
      { field: 'cbr', label: '承办人', width: 120 }
    ]
  },
  outcome: {
    title: '出账查询',
    apiName: 'queryList_tk',
    dateField: 'czdate',
    amountField: 'je',
    amountLabel: '出账金额',
    payeeTypeOptions: [
      { value: 'applicant', label: '申请执行人' },
      { value: 'respondent', label: '被执行人' },
      { value: 'other', label: '其他' }
    ],
    columns: [
      { field: 'czdate', label: '出账日期', width: 120 },
      { field: 'djcode', label: '来源票据号码', width: 140 },
      { field: 'ah', label: '案号', width: 220 },
      { field: 'yg', label: '申请人', width: 220 },
      { field: 'bg', label: '被执行人', width: 220 },
      { field: 'skr', label: '实际收款人', width: 180 },
      { field: 'ssdw', label: '诉讼地位', width: 120 },
      { field: 'skr_gx', label: '账户类型', width: 120 },
      { field: 'skr_accountname', label: '收款人户名', width: 200 },
      { field: 'je', label: '出账金额', align: 'right', width: 120 },
      { field: 'cbr', label: '承办人', width: 120 },
      { field: 'note', label: '承办人说明', width: 200 }
    ]
  }
}

export function getAccountFundQueryConfig(type) {
  return CONFIG_MAP[type] || CONFIG_MAP.income
}

export function getDefaultNotaxPayoutTypeOptions() {
  return [
    { value: 'execution_fee', label: '执行费' },
    { value: 'fine', label: '罚金' },
    { value: 'case_acceptance_fee', label: '案件受理费' },
    { value: 'preservation_fee', label: '保全费' },
    { value: 'recovery', label: '追缴' },
    { value: 'confiscation', label: '罚没' }
  ]
}

export function normalizeNotaxPayoutTypeOptions(config) {
  const types = config && config.types ? config.types : {}
  const options = Object.keys(types)
    .map(key => ({
      value: key,
      label: types[key].label || key
    }))
    .filter(option => option.value && option.label)

  return options.length ? options : getDefaultNotaxPayoutTypeOptions()
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDefaultAccountFundDateRange(now = new Date()) {
  const endDate = new Date(now)
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 6)

  return [
    formatDate(startDate),
    formatDate(endDate)
  ]
}

export function formatAccountFundAmount(value) {
  const num = parseFloat(String(value).replace(/,/g, ''))
  if (isNaN(num)) {
    return '0.00'
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatExportValue(column, row, index) {
  if (column.field === '_index') {
    return index + 1
  }

  const value = row[column.field]
  if (column.align === 'right') {
    const num = parseFloat(String(value || '').replace(/,/g, ''))
    return isNaN(num) ? '' : num
  }

  return value || ''
}

export function createAccountFundExportData(columns, rows) {
  const exportColumns = [
    { field: '_index', label: '序号' },
    ...columns
  ]

  return {
    header: exportColumns.map(column => column.label),
    data: rows.map((row, index) =>
      exportColumns.map(column => formatExportValue(column, row, index))
    )
  }
}

export function createAccountFundListQuery(type, query) {
  const config = getAccountFundQueryConfig(type)
  const dateRange = query.dateRange || []

  const listQuery = {
    page: query.page || 1,
    pagesize: query.pagesize || 10,
    keyword: query.keyword,
    ignore_dwid: 1,
    datetype: config.dateField,
    starttime: dateRange[0] || '',
    endtime: dateRange[1] || ''
  }

  if (type === 'outcome' && query.payout_type) {
    listQuery.payout_type = query.payout_type
  }
  if (type === 'outcome' && query.payee_type) {
    listQuery.payee_type = query.payee_type
  }

  return listQuery
}
