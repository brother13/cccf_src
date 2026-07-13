import { postdata } from '@/api/common'

export function getPmjlList(data) {
  return postdata('/pmjl/getList', data)
}

export function getPmjlFilters() {
  return postdata('/pmjl/getFilters', {})
}
