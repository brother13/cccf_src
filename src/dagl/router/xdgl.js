/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_xdgl = {
  path: '/xdgl',
  component: Layout,
  title: 'RPA自动化执行',
  redirect: '/xdgl/xdlb',
  name: 'RPA自动化执行',
  meta: {
    title: 'RPA自动化执行',
    icon: 'el-icon-cpu',
    roles: ['XDFKTX']
  },
  children: [
    {
      path: 'xdlb',
      component: () => import('@/dagl/views/xdgl/xdlb'),
      name: '自动化续冻列表',
      meta: {
        title: '自动化续冻列表',
        icon: 'el-icon-document',
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
