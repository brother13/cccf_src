/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_setting = {
  path: '/setting',
  component: Layout,
  title: '用户设置',
  redirect: '/setting/user-table',
  name: 'SettingTable',
  meta: {
    title: '用户设置',
    icon: 'el-icon-setting',
    roles: ['USER']
  },
  children: [
    {
      path: 'mmxg',
      component: () => import('@/dagl/views/setting/mmxg'),
      name: 'mmxgTable',
      meta: {
        title: '密码修改',
        icon: 'people1',
        roles: ['USER']
      }
    },

    {
      path: 'user-table',
      component: () => import('@/dagl/views/setting/user-table'),
      name: 'UserTable',
      meta: {
        title: '人员管理',
        icon: 'people1',
        roles: ['PEOPLE']
      }
    },
    {
      path: 'dept-table',
      component: () => import('@/dagl/views/setting/dept-table'),
      name: 'DeptTable',
      meta: {
        title: '部门管理',
        icon: 'tree',
        roles: ['DEPT']
      }
    }
  ]
}
export default Router_setting
