/**
 * 首页公告接口
 */
import { USE_MOCK } from '@/config'
import type { Announcement } from '@/types'
import { mockAnnouncementList } from './mock'
import { http } from './request'

/** 查询公告或轮播图：type 传 1 查公告，传 2 查轮播图（只返回已发布的） */
export function getAnnouncementList(type: number) {
  if (USE_MOCK) {
    return Promise.resolve(
      mockAnnouncementList.filter((item) => item.type === type && item.status === 1),
    )
  }
  return http.get<Announcement[]>('/announcement/list', { type })
}

/** 管理端用：查全部公告（含已下架的），请求不带 type */
export function getAllAnnouncementList() {
  if (USE_MOCK) {
    return Promise.resolve([...mockAnnouncementList])
  }
  return http.get<Announcement[]>('/announcement/list')
}
