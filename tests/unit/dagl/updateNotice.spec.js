import { isUpdateNoticeVisible, normalizeUpdateNotice } from '@/dagl/utils/updateNotice'

describe('normalizeUpdateNotice', () => {
  it('keeps configured title, date and list items', () => {
    const notice = normalizeUpdateNotice({
      title: '更新公告',
      date: '2026-06-06',
      items: ['新增首页公告', '优化利息计算']
    })

    expect(notice.title).toBe('更新公告')
    expect(notice.date).toBe('2026-06-06')
    expect(notice.items).toEqual(['新增首页公告', '优化利息计算'])
    expect(notice.visible).toBe(true)
  })

  it('splits multiline content into items', () => {
    const notice = normalizeUpdateNotice({
      content: '新增首页公告\n优化利息计算'
    })

    expect(notice.items).toEqual(['新增首页公告', '优化利息计算'])
    expect(notice.visible).toBe(true)
  })

  it('hides empty notices', () => {
    const notice = normalizeUpdateNotice({})

    expect(notice.visible).toBe(false)
    expect(notice.items).toEqual([])
  })

  it('hides notice after user closes it', () => {
    const notice = normalizeUpdateNotice({
      items: ['新增首页公告']
    })

    expect(isUpdateNoticeVisible(notice, false)).toBe(true)
    expect(isUpdateNoticeVisible(notice, true)).toBe(false)
  })
})
