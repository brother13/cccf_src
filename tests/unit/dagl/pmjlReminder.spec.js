import PmjlList from '@/dagl/views/pmjl/index.vue'

jest.mock('@/dagl/api/pmjl', () => ({
  getPmjlFilters: jest.fn(() => Promise.resolve({ data: {}})),
  getPmjlList: jest.fn(() => Promise.resolve({ data: { items: [], total: 0 }}))
}))

describe('auction ledger reminder filter', () => {
  it('initializes the second-auction overdue filter from the route', () => {
    const data = PmjlList.data.call({
      $route: {
        query: { reminder: 'secondAuctionOverdue' }
      }
    })

    expect(data.listQuery.secondAuctionOverdue).toBe(true)
  })

  it('reapplies the reminder filter when returning to a cached ledger page', () => {
    const context = {
      listQuery: {
        page: 4,
        keyword: '案件',
        status: '公告中',
        pmjd: '一拍',
        secondAuctionOverdue: false
      },
      getList: jest.fn()
    }

    PmjlList.watch['$route.query.reminder'].call(context, 'secondAuctionOverdue')

    expect(context.listQuery).toEqual({
      page: 1,
      keyword: '',
      status: '',
      pmjd: '',
      secondAuctionOverdue: true
    })
    expect(context.getList).toHaveBeenCalledTimes(1)
  })

  it('clears the reminder filter when a regular filter changes', () => {
    const context = {
      listQuery: {
        page: 3,
        secondAuctionOverdue: true
      },
      getList: jest.fn()
    }

    PmjlList.methods.handleFilter.call(context)

    expect(context.listQuery.page).toBe(1)
    expect(context.listQuery.secondAuctionOverdue).toBe(false)
    expect(context.getList).toHaveBeenCalledTimes(1)
  })
})
