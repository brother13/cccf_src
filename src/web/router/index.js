import Router_setting from './setting'
import Router_dashboard from './dashboard'

// import Router_report from './report'
import Router_news from './news'
import Router_website from './website'
import Router_contact from './contact'
import Router_basedata from './basedata'

const webRouter = [
  Router_dashboard,
  Router_news,
  Router_contact,
  Router_basedata,
  Router_website,
  // Router_report,
  Router_setting
]

export default webRouter
