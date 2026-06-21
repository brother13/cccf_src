import { shouldShowFrozenAccountFields } from '@/dagl/utils/propertyType'

describe('shouldShowFrozenAccountFields', () => {
  it('shows frozen account fields for account-like property types', () => {
    const types = ['工资卡', '公积金', '银行', '支付宝', '微信']

    types.forEach((type) => {
      expect(shouldShowFrozenAccountFields(type)).toBe(true)
    })
  })

  it('hides frozen account fields for non-account property types', () => {
    const types = ['房产', '股权', '车辆', '其他', '']

    types.forEach((type) => {
      expect(shouldShowFrozenAccountFields(type)).toBe(false)
    })
  })
})
