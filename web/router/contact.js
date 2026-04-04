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
        title: '院内通讯录',
        icon: 'contact'
      }
    },
    {
      path: 'common-table',
      component: () => import('@/web/views/contact/common-table'),
      name: 'CommonTable',
      meta: {
        title: '常用通讯录',
        icon: 'contact'
      }
    },
    {
      path: 'lawyer-table',
      component: () => import('@/web/views/contact/lawyer-table'),
      name: 'LawyerTable',
      meta: {
        title: '律师通讯录',
        icon: 'lawyer'
      }
    },
    {
      path: 'other-table',
      component: () => import('@/web/views/contact/other-table'),
      name: 'OtherTable',
      meta: {
        title: '其它通讯录',
        icon: 'contact'
      }
    }

  ]
}
export default Router_contact
