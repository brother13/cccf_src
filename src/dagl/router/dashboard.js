/** 工资系统 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_dashboard = {
  path: '/',
  component: Layout,
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      component: () => import('@/dagl/views/dashboard/index'),
      name: 'dashboard',
      meta: { title: '首页', icon: 'dashboard', affix: false }
    }
  ]
}
export default Router_dashboard
