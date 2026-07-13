/** 拍卖台账 */

import Layout from '@/layout'

const Router_pmjl = {
  path: '/pmjl',
  component: Layout,
  alwaysShow: true,
  redirect: '/pmjl/list',
  name: '拍卖台账',
  meta: {
    title: '拍卖台账',
    icon: 'el-icon-s-order',
    roles: ['PMTZ']
  },
  children: [
    {
      path: 'list',
      component: () => import('@/dagl/views/pmjl/index'),
      name: '拍卖台账列表',
      meta: {
        title: '台账列表',
        icon: 'el-icon-tickets',
        roles: ['PMTZ']
      }
    }
  ]
}

export default Router_pmjl
