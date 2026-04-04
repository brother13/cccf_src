import Layout from '@/layout'

const Router_news = {
  path: '/news',
  component: Layout,
  title: '内容管理',
  redirect: '/news/news-table',
  name: 'News',
  meta: {
    title: '内容管理',
    icon: 'list'
  },
  children: [

    {
      path: 'news-table',
      component: () => import('@/web/views/news/news'),
      name: 'NewsTable',
      meta: {
        title: '信息发布',
        icon: 'news'
      }
    },
    {
      path: 'deptnews-table',
      component: () => import('@/web/views/news/deptnews'),
      name: 'DeptNewsTable',
      meta: {
        title: '部门专栏',
        icon: 'news'
      }
    },
    {
      path: 'subjectNews-table',
      component: () => import('@/web/views/news/subjectnews'),
      name: 'SubjectNewsTable',
      meta: {
        title: '主题专栏',
        icon: 'news'
      }
    },
    {
      path: 'notice-table',
      component: () => import('@/web/views/news/notice'),
      name: 'NoticeTable',
      meta: {
        title: '重要通知',
        icon: 'notice'
      }
    },

    {
      path: 'catelog-table',
      component: () => import('@/web/views/news/catelog-table'),
      name: 'catelogTable',
      meta: {
        title: '分类管理',
        icon: 'tree'
      }
    },
    {
      path: 'report-table',
      component: () => import('@/web/views/news/report-table'),
      name: 'ReportTable',
      meta: {
        title: '审判动态',
        icon: 'chart'
      }
    },
    {
      path: 'trash-table',
      component: () => import('@/web/views/news/trash'),
      name: 'trashTable',
      meta: {
        title: '回收站',
        icon: 'trash'
      }
    }

  ]
}
export default Router_news
