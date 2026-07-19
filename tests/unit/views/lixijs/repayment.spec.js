jest.mock('@/dagl/api/lpr', () => ({
  getLprList: jest.fn()
}))

import repayment from '@/dagl/views/lixijs/repayment.vue'

function createContext(formOverrides = {}) {
  const methods = repayment.methods
  const ctx = {
    form: {
      rateSourceType: 'auto',
      lprLevel: '1y',
      lprAdjustType: 'ratio',
      lprBpDirection: 'none',
      lprBpValue: 0,
      lprRatioSubtype: '倍数',
      lprRatioValue: 4,
      ...formOverrides
    }
  }

  Object.keys(methods).forEach((name) => {
    ctx[name] = methods[name].bind(ctx)
  })

  return ctx
}

describe('还款计算表利率调整', () => {
  it('自动分段的基准利率段也应用倍数调整', () => {
    const ctx = createContext()

    const rateInfo = ctx.getRateForDate('2013-12-23')

    expect(rateInfo.type).toBe('benchmark')
    expect(rateInfo.rate).toBeCloseTo(24)
  })
})
