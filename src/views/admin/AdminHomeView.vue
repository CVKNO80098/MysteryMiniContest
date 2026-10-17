<script setup lang="ts">
/**
 * 管理端 - 数据概览
 * 结构：六个统计卡片 → 常用操作按钮
 * 数据来自 GET /api/admin/statistics，后端几条 count / sum 就够
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getStatistics } from '@/api/admin'
import type { Statistics } from '@/types'
import PageTitle from '@/components/PageTitle.vue'
import { formatMoney } from '@/utils/format'

const router = useRouter()
const statistics = ref<Statistics | null>(null)
const loading = ref(false)

/** 页面上的统计卡片，key 就是 Statistics 里的字段名 */
const cards: { label: string; key: keyof Statistics; money?: boolean }[] = [
  { label: '今日订单数', key: 'todayOrderCount' },
  { label: '今日成交金额', key: 'todayAmount', money: true },
  { label: '待接单', key: 'waitAcceptCount' },
  { label: '已完成', key: 'finishCount' },
  { label: '用户总数', key: 'userCount' },
  { label: '骑手总数', key: 'riderCount' },
]

/** 取某个统计项的值，金额加个 ￥ 前缀 */
function getValue(key: keyof Statistics, money?: boolean): string {
  if (!statistics.value) {
    return '-'
  }
  const value = statistics.value[key]
  return money ? `￥${formatMoney(Number(value))}` : String(value)
}

onMounted(async () => {
  loading.value = true
  statistics.value = await getStatistics()
  loading.value = false
})
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="数据概览" subtitle="今天平台跑得怎么样" />

    <div class="card-row">
      <div v-for="card in cards" :key="card.key" class="card stat-item">
        <div class="stat-value">{{ getValue(card.key, card.money) }}</div>
        <div class="text-muted">{{ card.label }}</div>
      </div>
    </div>

    <div class="card">
      <h3 class="block-title">常用操作</h3>
      <el-button type="primary" @click="router.push('/admin/goods')">商品管理</el-button>
      <el-button @click="router.push('/admin/orders')">订单管理</el-button>
      <el-button @click="router.push('/admin/users')">用户管理</el-button>
    </div>
  </div>
</template>

<style scoped>
.card-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 6px;
}

.block-title {
  margin: 0 0 12px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .card-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
