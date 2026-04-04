import Layout from '@/layout'

const Router_profile = {
  path: '/profile',
  component: Layout,
  title: '个人信息',
  redirect: '/profile/profile',
  name: 'profile',
  meta: {
    title: '个人信息',
    icon: 'list'
  },
  children: [

    {
      path: 'profile',
      component: () => import('@/web/views/profile/profile'),
      name: 'Profile',
      meta: {
        title: '个人信息',
        icon: 'profile'
      }
    },
    {
      path: 'myfav-table',
      component: () => import('@/web/views/profile/profile'),
      name: 'MyFavTable',
      meta: {
        title: '我的收藏',
        icon: 'fav'
      }
    },
    {
      path: 'follow-table',
      component: () => import('@/web/views/profile/profile'),
      name: 'MyFollowTable',
      meta: {
        title: '我的关注',
        icon: 'follow'
      }
    },
    {
      path: 'mycomment-table',
      component: () => import('@/web/views/profile/profile'),
      name: 'MyCommentTable',
      meta: {
        title: '我的评论',
        icon: 'message'
      }
    },
    {
      path: 'mymessage-table',
      component: () => import('@/web/views/profile/profile'),
      name: 'MyMessageTable',
      meta: {
        title: '我的消息',
        icon: 'email'
      }
    }

  ]
}
export default Router_profile
