/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_ywcl = {
  path: '/ywcl',
  component: Layout,
  title: '业务处理',
  redirect: '/ywcl/upload-excel',
  name: 'SettingTable',
  meta: {
    title: '业务处理',
    icon: 'el-icon-s-platform',
    roles: ['USER']
  },
  children: [

   {
      path: 'upload-excel',
      component: () => import('@/dagl/views/ywcl/upload-excel'),
      name: '批量导入',
      meta: {
        title: '批量导入',
        icon: 'el-icon-upload2',
        roles: ['USER']
      }
    },
    {
      path: 'xzjl',
      component: () => import('@/dagl/views/ywcl/xzjl'),
      name: '新增记录',
      meta: {
        title: '新增记录',
        icon: 'edit',
        roles: ['USER']
      }
    },
  ]
}
export default Router_ywcl
