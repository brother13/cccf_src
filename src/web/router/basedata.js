/* jshint esversion:11 */
import Layout from '@/layout'

const Router_basedata = {
  path: '/basedata',
  component: Layout,
  title: '基础资料',
  redirect: '/basedata/jobauth',
  name: 'basedata',
  meta: {
    title: '基础资料',
    icon: 'list'
  },
  children: [

    {
      path: 'jobauth',
      component: () => import('@/web/views/basedata/jobauth-table'),
      name: 'JobAuthTable',
      meta: {
        title: '编制管理',
        icon: 'jobauth'
      }
    },
    {
      path: 'jobpost',
      component: () => import('@/web/views/basedata/jobpost-table'),
      name: 'JobPostTable',
      meta: {
        title: '岗位管理',
        icon: 'jobpost'
      }
    },
    {
      path: 'joblevel',
      component: () => import('@/web/views/basedata/joblevel-table'),
      name: 'JobLevelTable',
      meta: {
        title: '领导职务',
        icon: 'star'
      }
    },
    {
      path: 'zzmm',
      component: () => import('@/web/views/basedata/zzmm-table'),
      name: 'zzmmTable',
      meta: {
        title: '政治面貌',
        icon: 'star'
      }
    },
    {
      path: 'cardtype',
      component: () => import('@/web/views/basedata/cardtype-table'),
      name: 'CardTypeTable',
      meta: {
        title: '证件类型',
        icon: 'cardtype'
      }
    },
    {
      path: 'gender',
      component: () => import('@/web/views/basedata/gender-table'),
      name: 'GenderTable',
      meta: {
        title: '性别',
        icon: 'gender'
      }
    },
    {
      path: 'lawfirm',
      component: () => import('@/web/views/basedata/lawfirm-table'),
      name: 'LawFirmTable',
      meta: {
        title: '律所管理',
        icon: 'lawfirm'
      }
    },
    {
      path: 'company',
      component: () => import('@/web/views/basedata/othercompany-table'),
      name: 'CompanyTable',
      meta: {
        title: '其它单位',
        icon: 'company'
      }
    }

  ]
}
export default Router_basedata
