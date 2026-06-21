/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_zxktz = {
  path: '/zxktz',
  component: Layout,
  title: '执行款相关',
  redirect: '/zxktz/zxkreport',
  name: '执行款相关',
  meta: {
    title: '执行款相关',
    icon: 'el-icon-money',
    roles: ['XZTZ']
  },
  children: [
    {
      path: 'zxkreport',
      component: () => import('@/dagl/views/dgkreport/sklist_report'),
      name: 'dgkye-report',
      meta: {
        title: '未发还台账',
        icon: 'el-icon-s-data',
        roles: ['ZXTZ_UNRETURNED_REPORT']
      }
    },
    {
      path: 'sk_tk_summary',
      component: () => import('@/dagl/views/dgkreport/sk_tk_summary'),
      name: 'dgke-sk-tk-summary',
      meta: {
        title: '执行款台账汇总表',
        icon: 'el-icon-s-data',
        roles: ['ZXTZ_SUMMARY_REPORT']
      }
    },
    {
      path: 'income_query',
      component: () => import('@/dagl/views/dgkreport/account-fund-query'),
      name: 'dgke-income-query',
      meta: {
        title: '进账查询',
        icon: 'el-icon-s-order',
        roles: ['ZXTZ_INCOME_QUERY'],
        queryType: 'income'
      }
    },
    {
      path: 'outcome_query',
      component: () => import('@/dagl/views/dgkreport/account-fund-query'),
      name: 'dgke-outcome-query',
      meta: {
        title: '出账查询',
        icon: 'el-icon-s-order',
        roles: ['ZXTZ_OUTCOME_QUERY'],
        queryType: 'outcome'
      }
    },

    // {
    //   path: 'sklist',
    //   component: () => import('@/dagl/views/dgkreport/sklist'),
    //   name: 'dgkye-sklist',
    //   meta: {
    //     title: '收款明细表',
    //     icon: 'el-icon-s-order'
    //   }
    // },
    // {
    //   path: 'tklist',
    //   component: () => import('@/dagl/views/dgkreport/tklist'),
    //   name: 'dgke-tklist',
    //   meta: {
    //     title: '退款明细表',
    //     icon: 'el-icon-s-order'
    //   }
    // },
    {
      path: 'thqdlist',
      component: () => import('@/dagl/views/dgkreport/thqdlist'),
      name: 'dgke-thqdlist',
      meta: {
        title: '案款发还退回清单',
        icon: 'el-icon-refresh-left',
        roles: ['ZXTZ_REFUND_RETURN_LIST']
      }
    },
    {
      path: 'dkplist',
      component: () => import('@/dagl/views/dgkreport/dkplist'),
      name: 'dgke-dkplist',
      meta: {
        title: '案款到账待开收据',
        icon: 'el-icon-printer',
        roles: ['ZXTZ_RECEIPT_PENDING_LIST']
      }
    }

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
