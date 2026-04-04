/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_pz = {
  path: '/pz',
  component: Layout,
  title: '凭证接口导入',
  redirect: '/pz/upload-excel',
  name: 'SettingTable',
  meta: {
    title: '凭证接口导入',
    icon: 'el-icon-c-scale-to-original',
    roles: ['PZ']
  },
  children: [

    {
      path: 'upload-excel',
      component: () => import('@/dagl/views/pz/upload-excel'),
      name: '凭证接口导入',
      meta: {
        title: '凭证接口导入',
        icon: 'el-icon-c-scale-to-original',
        roles: ['USER']
      }
    }
  ]
}
export default Router_pz
