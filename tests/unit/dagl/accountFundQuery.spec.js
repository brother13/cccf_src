import {
  createAccountFundListQuery,
  getDefaultAccountFundDateRange,
  getAccountFundQueryConfig
} from '@/dagl/utils/accountFundQuery'

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
    expect(outcomeFields).not.toContain('czdh')
  })
})
