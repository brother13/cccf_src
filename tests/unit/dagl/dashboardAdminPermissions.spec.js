import { shallowMount } from '@vue/test-utils'
import DashboardAdmin from '@/dagl/views/dashboard/admin/index.vue'
import { thqdList } from '@/dagl/api/thqd'
import { dkpList } from '@/dagl/api/dkp'
import caseapi from '@/courtcase/api'

jest.mock('@/dagl/api/common', () => ({
  cflist_total: jest.fn(() => Promise.resolve({ data: {}})),
  updateNotice: jest.fn(() => Promise.resolve({ data: {}})),
  zxklist: jest.fn(() => Promise.resolve({ data: {}})),
  xdlist: jest.fn(() => Promise.resolve({ data: {}})),
  xdztcount: jest.fn(() => Promise.resolve({ data: {}}))
}))

jest.mock('@/dagl/api/thqd', () => ({
  thqdList: jest.fn(() => Promise.resolve({ data: { total: 0 }}))
}))

jest.mock('@/dagl/api/dkp', () => ({
  dkpList: jest.fn(() => Promise.resolve({ data: { total: 0 }}))
}))

jest.mock('@/courtcase/api', () => ({
  plugins: {
    countCasenum: jest.fn(() => Promise.resolve({ new5day: 0, new10day: 0, akyh5day: 0 }))
  }
}))

function mountDashboard(roles) {
  return shallowMount(DashboardAdmin, {
    stubs: {
      'router-link': true
    },
    mocks: {
      $store: {
        state: {
          user: { roles }
        },
        getters: {
          name: 'tester'
        }
      },
      $router: {
        push: jest.fn()
      }
    }
  })
}

describe('dashboard admin execution fund reminders permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('hides execution fund reminders without their page permissions', () => {
    const wrapper = mountDashboard(['XZTZ'])

    expect(wrapper.text()).not.toContain('发还失败退回清单')
    expect(wrapper.text()).not.toContain('到账待开收据')
    expect(wrapper.text()).not.toContain('新到账的5天未发还')
    expect(wrapper.text()).not.toContain('新到账的10天未发还')
    expect(wrapper.text()).not.toContain('延缓5天内到期提醒')
    expect(thqdList).not.toHaveBeenCalled()
    expect(dkpList).not.toHaveBeenCalled()
    expect(caseapi.plugins.countCasenum).not.toHaveBeenCalled()
  })

  it('shows each reminder when the matching page permission exists', () => {
    const wrapper = mountDashboard([
      'XZTZ',
      'ZXTZ_REFUND_RETURN_LIST',
      'ZXTZ_RECEIPT_PENDING_LIST',
      'ZXTZ_UNRETURNED_REPORT'
    ])

    expect(wrapper.text()).toContain('发还失败退回清单')
    expect(wrapper.text()).toContain('到账待开收据')
    expect(wrapper.text()).toContain('新到账的5天未发还')
    expect(wrapper.text()).toContain('新到账的10天未发还')
    expect(wrapper.text()).toContain('延缓5天内到期提醒')
  })

  it('opens the unreturned report with the five-day reminder type', () => {
    const wrapper = mountDashboard(['ZXTZ_UNRETURNED_REPORT'])

    wrapper.vm.goToPage('new5day')

    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      path: '/zxktz/zxkreport',
      query: { type: 'new5day' }
    })
  })
})
