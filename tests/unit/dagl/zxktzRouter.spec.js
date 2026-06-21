jest.mock('@/layout', () => ({}))

const RouterZxktz = require('@/dagl/router/zxktz').default

describe('Router_zxktz permissions', () => {
  it('keeps visible execution fund submenus independently permissioned', () => {
    const roleByPath = {
      zxkreport: 'ZXTZ_UNRETURNED_REPORT',
      sk_tk_summary: 'ZXTZ_SUMMARY_REPORT',
      income_query: 'ZXTZ_INCOME_QUERY',
      outcome_query: 'ZXTZ_OUTCOME_QUERY',
      thqdlist: 'ZXTZ_REFUND_RETURN_LIST',
      dkplist: 'ZXTZ_RECEIPT_PENDING_LIST'
    }

    const visibleRoutes = RouterZxktz.children.filter(route => !route.hidden)
    expect(visibleRoutes.map(route => route.path)).toEqual([
      'zxkreport',
      'sk_tk_summary',
      'income_query',
      'outcome_query',
      'thqdlist',
      'dkplist'
    ])

    visibleRoutes
      .forEach(route => {
        expect(route.meta.roles).toEqual([roleByPath[route.path]])
      })
  })
})
