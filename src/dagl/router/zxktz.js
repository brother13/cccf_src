/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_zxktz = {
  path: '/zxktz',
  component: Layout,
  title: '执行款台账',
  redirect: '/zxktz/zxkreport',
  name: '执行款台账',
  meta: {
    title: '执行款台账',
    icon: 'el-icon-s-order',
    roles: ['XZTZ']
  },
  children: [
    {
      path: 'zxkreport',
      component: () => import('@/dagl/views/dgkreport/sklist_report'),
      name: 'dgkye-report',
      meta: {
        title: '执行款台账',
        icon: 'el-icon-s-order',
      }
    },

    {
      path: 'sklist',
      component: () => import('@/dagl/views/dgkreport/sklist'),
      name: 'dgkye-sklist',
      meta: {
        title: '收款明细表',
        icon: 'el-icon-s-order',
      }
    },
    {
      path: 'tklist',
      component: () => import('@/dagl/views/dgkreport/tklist'),
      name: 'dgke-tklist',
      meta: {
        title: '退款明细表',
        icon: 'el-icon-s-order',
      }
    },
    {
      path: 'thqdlist',
      component: () => import('@/dagl/views/dgkreport/thqdlist'),
      name: 'dgke-thqdlist',
      meta: {
        title: '退回清单',
        icon: 'el-icon-s-order',
      }
    },
    {
      path: 'dkplist',
      component: () => import('@/dagl/views/dgkreport/dkplist'),
      name: 'dgke-dkplist',
      meta: {
        title: '待开收据',
        icon: 'el-icon-s-order',
      }
    },

    // {
    //   path: 'akyh-table',
    //   component: () => import('@/dagl/views/zxktz/tz'),
    //   name: 'dgkye-akyh',
    //   meta: {
    //     title: '案款延缓',
    //     icon: 'el-icon-s-order',
    //   }
    // },



  ]
}
export default Router_zxktz
