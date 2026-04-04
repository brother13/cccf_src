/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_xdgl = {
  path: '/xdgl',
  component: Layout,
  title: '续冻反馈提醒',
  redirect: '/xdgl/xdlb',
  name: '续冻反馈提醒',
  meta: {
    title: '续冻反馈提醒',
    icon: 'el-icon-s-order',
    roles: ['XDFKTX']
  },
  children: [
    {
      path: 'xdlb',
      component: () => import('@/dagl/views/xdgl/xdlb'),
      name: '续冻列表',
      meta: {
        title: '续冻列表',
        icon: 'el-icon-bell',
        roles: ['XDFKTX']
      }
    },
    {
      path: 'rpa',
      component: () => import('@/dagl/views/xdgl/rpa'),
      name: 'RPA日志',
      meta: {
        title: 'RPA日志',
        icon: 'el-icon-notebook-1',
        roles: ['XDFKTX']
      }
    }

  ]
}
export default Router_xdgl
