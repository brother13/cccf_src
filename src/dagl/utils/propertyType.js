const FROZEN_ACCOUNT_TYPES = ['工资卡', '公积金', '银行', '支付宝', '微信']

export function shouldShowFrozenAccountFields(type) {
  const value = type || ''
  return FROZEN_ACCOUNT_TYPES.some((item) => value.indexOf(item) !== -1)
}
