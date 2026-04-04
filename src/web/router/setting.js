/** 设置 相关菜单功能 **/

import Layout from '@/layout'

const Router_setting = {
  path: '/setting',
  component: Layout,
  title: '系统设置',
  redirect: '/setting/user-table',
  name: 'SettingTable',
  meta: {
    title: '系统设置',
    icon: 'list',
    roles: ['ADMINLOGIN']
  },
  children: [
    {
      path: 'mmxg',
      component: () => import('@/web/views/setting/mmxg'),
      name: 'UserTable',
      meta: {
        title: '密码修改',
        icon: 'people1',
        roles: ['USER']
      }
    },

    {
      path: 'user-table',
      component: () => import('@/web/views/setting/user-table'),
      name: 'UserTable',
      meta: {
        title: '人员管理',
        icon: 'people1',
        roles: ['USER']
      }
    },
    {
      path: 'dept-table',
      component: () => import('@/web/views/setting/dept-table'),
      name: 'DeptTable',
      meta: {
        title: '部门管理',
        icon: 'tree',
        roles: ['DEPT']
      }
    },
    {
      path: 'group-table',
      component: () => import('@/web/views/setting/group-table'),
      name: 'GroupTable',
      meta: {
        title: '权限管理',
        icon: 'peoples',
        roles: ['USERGROUP']
      }
    }

  ]
}
export default Router_setting
