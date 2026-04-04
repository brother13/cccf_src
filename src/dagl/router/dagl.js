/** 档案管理菜单功能 **/

import Layout from '@/layout'

const Router_dagl = {
  path: '/dagl',
  component: Layout,
  title: '档案查询',
  redirect: '/dagl/dagl-query',
  name: 'DaQuery1',
  meta: {
    title: '档案查询',
    icon: 'list'
  },
  children: [

    {
      path: 'dagl-query',
      component: () => import('@/dagl/views/dagl/dagl-table'),
      name: 'DaQuery',
      meta: {
        title: '诉讼档案',
        icon: 'search'
      }
    },
    {
      path: 'wjws-query',
      component: () => import('@/dagl/views/dagl/wswj-table'),
      name: 'WsQuery',
      meta: {
        title: '文书档案',
        icon: 'search'
      }
    }

  ]
}
export default Router_dagl
