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
      { field: 'cbbm', label: '承办部门', width: 140 },
      { field: 'cbr', label: '承办人', width: 120 }
    ]
  },
  outcome: {
    title: '出账查询',
    apiName: 'queryList_tk',
    dateField: 'czdate',
    amountField: 'je',
    amountLabel: '出账金额',
    columns: [
      { field: 'czdate', label: '出账日期', width: 120 },
      { field: 'djcode', label: '来源票据号码', width: 140 },
      { field: 'ah', label: '案号', width: 220 },
      { field: 'yg', label: '申请人', width: 220 },
      { field: 'bg', label: '被执行人', width: 220 },
      { field: 'skr', label: '实际收款人', width: 180 },
      { field: 'je', label: '出账金额', align: 'right', width: 120 },
      { field: 'cbr', label: '承办人', width: 120 }
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

export function createAccountFundListQuery(type, query) {
  const config = getAccountFundQueryConfig(type)
  const dateRange = query.dateRange || []

  return {
    page: query.page || 1,
    pagesize: query.pagesize || 10,
    keyword: query.keyword,
    ignore_dwid: 1,
    datetype: config.dateField,
    starttime: dateRange[0] || '',
    endtime: dateRange[1] || ''
  }
}
