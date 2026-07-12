import Yyyn from '@/dagl/views/tz/yyyn.vue'

jest.mock('@/dagl/api/data', () => ({
  DataList: jest.fn(),
  LabelList: jest.fn()
}))

jest.mock('@/dagl/api/common', () => ({
  postdata: jest.fn(),
  cflist: jest.fn(),
  cflistadd: jest.fn(),
  cflistdel: jest.fn(),
  cflistupdate: jest.fn(),
  cftype: jest.fn(),
  getajjbxx: jest.fn(),
  dxmsg: jest.fn(),
  uploadfile: jest.fn(),
  getuploadfile: jest.fn(),
  deluploadfile: jest.fn(),
  saveCflistusername: jest.fn()
}))

jest.mock('@/courtcase/api', () => ({}))

function canEdit(row, user, cflistFilterByUsername) {
  return Yyyn.methods.canEdit.call({
    cflistFilterByUsername,
    $store: {
      state: {
        user
      }
    }
  }, row)
}

describe('yyyn edit permission', () => {
  it('allows saving ledgers for any cbr when cflist is filtered by username', () => {
    expect(canEdit({
      cbr: '案件承办人'
    }, {
      name: '登录人',
      roles: []
    }, true)).toBe(true)
  })

  it('keeps cbr restriction when cflist is not filtered by username', () => {
    expect(canEdit({
      cbr: '案件承办人'
    }, {
      name: '登录人',
      roles: []
    }, false)).toBe(false)
  })
})
