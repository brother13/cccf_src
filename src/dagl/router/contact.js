/* jshint esversion:11 */
import Layout from '@/layout'

const Router_contact = {
  path: '/contact',
  component: Layout,
  title: '通讯录',
  redirect: '/contact/court-table',
  name: 'contact',
  meta: {
    title: '通讯录',
    icon: 'list'
  },
  children: [

    {
      path: 'court-table',
      component: () => import('@/web/views/setting/user-table'),
      name: 'CourtTable',
      meta: {
        title: '长寿区通讯录',
        icon: 'contact'
      }
    }
  ]
}
export default Router_contact
