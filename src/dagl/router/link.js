/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const linkRouter = {
  path: '/link',
  component: Layout,
  name: '日志查看',
  meta: {
    title: '日志查看',
    icon: 'el-icon-notebook-1'
  },
  children: [
    {
      path: 'https://www.air.hbgrand.com:19000/p1upgrade/index',
      meta: { title: '操作记录', icon: 'el-icon-notebook-1' }
    },
    {
      path: 'https://www.air.hbgrand.com:19000/p1upgrade/index',
      meta: { title: '短信记录', icon: 'el-icon-notebook-2' }
    },
  ]
}
export default linkRouter
