/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_cmmb = {
  path: '/cmbz',
  component: Layout,
  redirect: '/cmmb/cmk',
  name: 'SettingTable',
  children: [

    {
      path: 'cmk',
      component: () => import('@/dagl/views/cmmb/cmk'),
      name: '尺码库',
      meta: {
        title: '尺码库',
        icon: 'el-icon-setting',
        roles: ['USER']
      }
    }
    /*    {
       path: 'cmbz',
       component: () => import('@/dagl/views/cmmb/cmbz'),
       name: '尺码标准',
       meta: {
         title: '尺码标准',
         icon: 'el-icon-setting',
         roles: ['USER']
       }
     }, */

  ]
}
export default Router_cmmb
