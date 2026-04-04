/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_logs = {
  path: '/logs',
  component: Layout,
  title: '日志查看',
  redirect: '/logs/operlog',
  name: 'Logs',
  meta: {
    title: '日志查看',
    icon: 'el-icon-notebook-2',
    roles: ['USER']
  },
  children: [

    // {
    //   path: 'msglist',
    //   component: () => import('@/dagl/views/logs/operlog'),
    //   name: '短信日志',
    //   meta: {
    //     title: '短信日志',
    //     icon: 'el-icon-notebook-1',
    //     roles: ['USER']
    //   }
    // },
    {
      path: 'userlog',
      component: () => import('@/dagl/views/logs/userlog'),
      name: '平台日志',
      meta: {
        title: '平台日志',
        icon: 'el-icon-notebook-1',
        roles: ['USER']
      }
    }
  ]
}
export default Router_logs
