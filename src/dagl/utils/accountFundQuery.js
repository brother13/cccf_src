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
    payoutTypeOptions: [
      { value: 'execution_fee', label: '执行费' },
      { value: 'fine', label: '罚金' },
      { value: 'case_acceptance_fee', label: '案件受理费' },
      { value: 'preservation_fee', label: '保全费' },
      { value: 'recovery', label: '追缴' }
    ],
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
