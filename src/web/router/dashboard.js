/** 工资系统 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_dashboard = {
  path: '/',
  component: Layout,
  redirect: '/dashboard2',
  children: [
    {
      path: 'dashboard2',
      component: () => import('@/web/views/dashboard/index'),
      name: 'Dashboard2',
      meta: { title: '首页', icon: 'dashboard', affix: true }
    }
  ]
}
export default Router_dashboard
