import { shallowMount } from '@vue/test-utils'
import SklistReport from '@/dagl/views/dgkreport/sklist_report.vue'
import caseapi from '@/courtcase/api'

jest.mock('@/courtcase/api', () => ({
  plugins: {
    queryList_sk_direct: jest.fn(() => Promise.resolve({
      total: { num: 0, je: 0, ye: 0 },
      items: []
    }))
  },
  util: {
    number_format: jest.fn((num) => String(num))
  }
}))

function mountReport(type) {
  return shallowMount(SklistReport, {
    directives: {
      waves: {},
      loading: {}
    },
    stubs: {
      Pagination: true,
      LoadingProgress: true,
      'el-input': true,
      'el-select': true,
      'el-option': true,
      'el-button': true,
      'el-table': true,
      'el-table-column': true,
      'el-tag': true
    },
    mocks: {
      $route: {
        query: { type }
      },
      $message: {
        error: jest.fn()
      }
    }
  })
}

describe('unreturned report reminder filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('passes the five-day reminder type to the direct ledger query', () => {
    mountReport('new5day')

    expect(caseapi.plugins.queryList_sk_direct).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'new5day' })
    )
  })
})
