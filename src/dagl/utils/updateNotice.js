export function normalizeUpdateNotice(data) {
  const notice = data || {}
  const items = Array.isArray(notice.items)
    ? notice.items
    : String(notice.content || '')
      .split('\n')

  const normalizedItems = items
    .map(item => String(item || '').trim())
    .filter(item => item)

  return {
    title: notice.title || '更新公告',
    date: notice.date || '',
    items: normalizedItems,
    visible: notice.enabled !== false && normalizedItems.length > 0
  }
}

export function isUpdateNoticeVisible(notice, closed) {
  return Boolean(notice && notice.visible && !closed)
}
