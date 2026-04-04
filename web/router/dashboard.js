/** 工资系统 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_dashboard = {
  path: '/',
  component: Layout,
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      component: () => import('@/web/views/dashboard/index'),
      name: 'Dashboard',
      meta: { title: '首页test', icon: 'dashboard', affix: true }
    }
  ]
}
export default Router_dashboard
