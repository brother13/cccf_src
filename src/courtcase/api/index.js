import util from './util'

import api_user from './user'


import api_basedata from './basedata'
import api_casesk from './casesk'
import api_casetk from './casetk'

import api_template from './template'
import api_log from './log'

import api_store from './store'

import api_userconfig from './userconfig'

import api_report from './report'
import api_caseinterface from './caseinterface'

import api_plugins from './plugins'

import api_tz from './tz'

const webapi = {
  util: util,
  user: api_user,
  base: api_basedata,
  casesk: api_casesk,
  template: api_template,
  log: api_log,
  store: api_store,
  userconfig: api_userconfig,
  casetk: api_casetk,
  report: api_report,
  interface: api_caseinterface,
  plugins: api_plugins,
  tz:api_tz

}

export default webapi
