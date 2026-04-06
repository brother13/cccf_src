/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_tz = {
  path: '/tz',
  component: Layout,
  title: '财产查封台账',
  redirect: '/tz/txcl',
  name: '财产查封台账',
  meta: {
    title: '财产查封台账',
    icon: 'el-icon-lock',
    roles: ['CCCF']
  },
  children: [

    {
      path: 'xzjl',
      component: () => import('@/dagl/views/ywcl/xzjl'),
      hidden: true,
      name: '新增列表',
      meta: {
        title: '新增列表',
        icon: 'edit',
        roles: ['USER']
      }
    },

    {
      path: 'txcl',
      component: () => import('@/dagl/views/tz/yyyn'),
      name: '台账列表',
      meta: {
        title: '台账列表',
        icon: 'el-icon-tickets',
        roles: ['USER']
      }
    },
    {
      path: 'yzyn',
      component: () => import('@/dagl/views/tz/yyyn'),
      name: '1周以内到期',
      meta: {
        title: '1周以内到期',
        icon: 'el-icon-time',
        roles: ['USER']
      }
    },
    {
      path: 'yyyn',
      component: () => import('@/dagl/views/tz/yyyn'),
      name: '1月以内到期',
      meta: {
        title: '1月以内到期',
        icon: 'el-icon-date',
        roles: ['USER']
      }
    },
    {
      path: 'yyyn2',
      component: () => import('@/dagl/views/tz/yyyn'),
      name: '2月以内到期',
      meta: {
        title: '2月以内到期',
        icon: 'el-icon-date',
        roles: ['USER']
      }
    },
    {
      path: 'upload-excel',
      component: () => import('@/dagl/views/ywcl/upload-excel'),
      name: '批量导入',
      meta: {
        title: '批量导入',
        icon: 'el-icon-upload',
        roles: ['USER']
      }
    }

  ]
}
export default Router_tz
