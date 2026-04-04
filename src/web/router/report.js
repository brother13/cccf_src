import Layout from '@/layout'

const Router_report = {
  path: '/report',
  component: Layout,
  title: '数据统计',
  redirect: '/report/userdaily-table',
  name: 'Report',
  meta: {
    title: '数据统计',
    icon: 'list'
  },
  children: [

    {
      path: 'userdaily-table',
      component: () => import('@/web/views/report/userdaily'),
      name: 'UserDailyReport',
      meta: {
        title: '巡检汇总',
        icon: 'chart'
      }
    }

  ]
}
export default Router_report
