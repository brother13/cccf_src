/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  redirect: '/table/dynamic-table',
  name: '日报数据',
  meta: {
    title: '日报数据',
    icon: 'table'
  },
  children: [
    {
      path: 'dynamic-table',
      component: () => import('@/dagl/views/table/dynamic-table/index'),
      name: '日报数据',
      meta: { title: '日报数据' }
    },

  ]
}
export default tableRouter
