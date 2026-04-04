/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_excel = {
  path: '/excel',
  component: Layout,
  title: '业务处理',
  redirect: '/excel/export-excel',
  name: 'SettingTable',
  meta: {
    title: '业务处理',
    icon: 'el-icon-bell',
    roles: ['USER']
  },
  children: [

    {
      path: 'txcl',
      component: () => import('@/dagl/views/excel/txcl'),
      name: '提醒处理',
      meta: {
        title: '提醒处理',
        icon: 'el-icon-bell',
        roles: ['USER']
      }
    },
   {
      path: 'upload-excel',
      component: () => import('@/dagl/views/excel/upload-excel'),
      name: '批量导入',
      meta: {
        title: '批量导入',
        icon: 'el-icon-upload2',
        roles: ['USER']
      }
    },
    {
      path: 'xzjl',
      component: () => import('@/dagl/views/excel/xzjl'),
      name: '新增记录',
      meta: {
        title: '新增记录',
        icon: 'edit',
        roles: ['USER']
      }
    },
  ]
}
export default Router_excel
