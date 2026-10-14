<script setup lang="ts">
/**
 * 首页：欢迎语 + 三大业务入口 + 平台公告
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAnnouncementList } from '@/api/announcement'
import type { Announcement } from '@/types'
import { useUserStore } from '@/stores/user'
import { USER_ROLE_TEXT } from '@/utils/dict'

const router = useRouter()
const userStore = useUserStore()

/** 公告列表 */
const noticeList = ref<Announcement[]>([])

/** 三大业务入口，点击跳到对应页面 */
const entries = [
  {
    title: '代取快递',
    desc: '菜鸟驿站、京东、邮政都能代取，送到宿舍门口',
    path: '/express',
    icon: 'Box',
    color: '#409eff',
  },
  {
    title: '校园外卖',
    desc: '食堂窗口在线点单，骑手送到宿舍楼下',
    path: '/food',
    icon: 'Food',
    color: '#67c23a',
  },
  {
    title: '小卖部送货',
    desc: '零食饮料日用百货，下单后送到宿舍',
    path: '/shop',
    icon: 'ShoppingCart',
    color: '#e6a23c',
  },
]

onMounted(async () => {
  noticeList.value = await getAnnouncementList(1)
})
</script>

<template>
  <div>
    <!-- 欢迎卡片 -->
    <div class="card flex-between">
      <div>
        <h2 class="welcome-title">
          你好，{{ userStore.currentUser ? userStore.currentUser.realName : '同学' }}
        </h2>
        <p class="text-muted">
          当前身份：{{ userStore.currentUser ? USER_ROLE_TEXT[userStore.currentUser.role] : '未登录' }}
          · 未登录时点右上角登录（演示账号 xiaoming / 123456，密码统一 123456）
        </p>
      </div>
      <el-button type="primary" @click="router.push('/order')">查看我的订单</el-button>
    </div>

    <!-- 三大业务入口 -->
    <div class="entry-list">
      <div
        v-for="entry in entries"
        :key="entry.path"
        class="entry-card"
        @click="router.push(entry.path)"
      >
        <el-icon :size="32" :color="entry.color"><component :is="entry.icon" /></el-icon>
        <div class="entry-title">{{ entry.title }}</div>
        <div class="entry-desc">{{ entry.desc }}</div>
      </div>
    </div>

    <!-- 平台公告 -->
    <div class="card">
      <h3 class="block-title">平台公告</h3>
      <el-empty v-if="noticeList.length === 0" description="暂无公告" :image-size="60" />
      <ul v-else class="notice-list">
        <li v-for="notice in noticeList" :key="notice.id">
          <span class="notice-title">{{ notice.title }}</span>
          <span class="text-muted">{{ notice.content }}</span>
        </li>
      </ul>
    </div>

    <!-- 使用说明 -->
    <div class="card">
      <h3 class="block-title">怎么用</h3>
      <p class="text-muted">1. 选业务类型（快递 / 外卖 / 小卖部）</p>
      <p class="text-muted">2. 填好取件点或选好商品，确认收货地址</p>
      <p class="text-muted">3. 提交订单后，骑手在“骑手工作台”接单并送达</p>
    </div>
  </div>
</template>

<style scoped>
.welcome-title {
  margin: 0 0 6px;
  font-size: 20px;
}

.entry-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.entry-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.entry-card:hover {
  transform: translateY(-3px);
}

.entry-title {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0 6px;
}

.entry-desc {
  font-size: 13px;
  color: #909399;
}

.block-title {
  margin: 0 0 12px;
  font-size: 16px;
}

.notice-list {
  margin: 0;
  padding-left: 18px;
}

.notice-list li {
  margin-bottom: 8px;
}

.notice-title {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .entry-list {
    grid-template-columns: 1fr;
  }
}
</style>
