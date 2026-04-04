import Layout from '@/layout'

const Router_website = {
  path: '/website',
  component: Layout,
  title: '日志查看',
  redirect: '/website/website',
  name: 'website',
  meta: {
    title: '日志查看',
    icon: 'el-icon-notebook-2'
  },
  children: [
    {
      path: 'subject-table',
      component: () => import('@/dagl/views/website/subject-table'),
      name: '数据日志',
      meta: {
        title: '数据日志',
        icon: 'el-icon-notebook-1'
      }
    },
    {
      path: 'log-table',
      component: () => import('@/dagl/views/website/log-table'),
      name: '用户日志',
      meta: {
        title: '用户日志',
        icon: 'el-icon-notebook-1'
      }
    },



  ]
}
export default Router_website
