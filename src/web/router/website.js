import Layout from '@/layout'

const Router_website = {
  path: '/website',
  component: Layout,
  title: '网站设置',
  redirect: '/website/website',
  name: 'website',
  meta: {
    title: '网站设置',
    icon: 'list'
  },
  children: [

    {
      path: 'config',
      component: () => import('@/web/views/website/website'),
      name: 'SiteConfig',
      meta: {
        title: '网站设置',
        icon: 'settings'
      }
    },
    {
      path: 'subject-table',
      component: () => import('@/web/views/website/subject-table'),
      name: 'SubjectTable',
      meta: {
        title: '主题专栏',
        icon: 'tree-table'
      }
    },
    {
      path: 'apptype-table',
      component: () => import('@/web/views/website/apptype-table'),
      name: 'ApptypeTable',
      meta: {
        title: '应用分类',
        icon: 'tree-table'
      }
    },
    {
      path: 'app-table',
      component: () => import('@/web/views/website/app-table'),
      name: 'AppTable',
      meta: {
        title: '应用管理',
        icon: 'app'
      }
    },

    {
      path: 'link-table',
      component: () => import('@/web/views/website/link-table'),
      name: 'LinkTable',
      meta: {
        title: '常用网站',
        icon: 'links'
      }
    },
    {
      path: 'downlog-table',
      component: () => import('@/web/views/website/downlog-table'),
      name: 'DownLogTable',
      meta: {
        title: '下载日志',
        icon: 'log'
      }
    },

    {
      path: 'weblog-table',
      component: () => import('@/web/views/website/log-table'),
      name: 'WebLogTable',
      meta: {
        title: '日志管理',
        icon: 'log'
      }
    },
    {
      path: 'dataflesh-table',
      component: () => import('@/web/views/website/website'),
      name: 'DataFleshTable',
      meta: {
        title: '数据刷新',
        icon: 'reflesh'
      }
    }

  ]
}
export default Router_website
