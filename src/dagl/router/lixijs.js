/** 利息计算 相关菜单功能 **/

import Layout from '@/layout'

const Router_lixijs = {
  path: '/lixijs',
  component: Layout,
  title: '常用计算器',
  redirect: '/lixijs/calculator',
  name: 'Lixijs',
  meta: {
    title: '常用计算器',
    icon: 'el-icon-s-marketing',
    roles: ['USER']
  },
  children: [
    {
      path: 'execution-fee',
      component: () => import('@/dagl/views/lixijs/execution-fee'),
      name: 'LixijsExecutionFee',
      meta: {
        title: '执行费计算',
        icon: 'el-icon-s-finance'
      }
    },
    {
      path: 'repayment',
      component: () => import('@/dagl/views/lixijs/repayment'),
      name: 'LixijsRepayment',
      meta: {
        title: '还款计算表',
        icon: 'el-icon-s-order'
      }
    },
    {
      path: 'calculator',
      component: () => import('@/dagl/views/lixijs/calculator'),
      name: 'LixijsCalculator',
      meta: {
        title: '利息计算器',
        icon: 'el-icon-s-data'
      }
    }
    // {
    //   path: 'history',
    //   component: () => import('@/dagl/views/lixijs/history'),
    //   name: 'LixijsHistory',
    //   meta: {
    //     title: '计算历史',
    //     icon: 'el-icon-time'
    //   }
    // }
  ]
}
export default Router_lixijs
