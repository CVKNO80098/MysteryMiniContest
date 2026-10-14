<script setup lang="ts">
/**
 * 我的跑腿（骑手）
 * 显示自己接下的订单，点“标记已送达”把订单改成已完成。
 */
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrderList, updateOrderStatus } from '@/api/order'
import { getRiderInfo, getRiderStatistics } from '@/api/rider'
import type { Order, Rider, RiderStatistics } from '@/types'
import { useUserStore } from '@/stores/user'
import EmptyBox from '@/components/EmptyBox.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import PageTitle from '@/components/PageTitle.vue'
import { getOrderTypeText } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const userStore = useUserStore()

const rider = ref<Rider | null>(null)
const statistics = ref<RiderStatistics | null>(null)
const orderList = ref<Order[]>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  rider.value = await getRiderInfo(userStore.userId)

  if (rider.value) {
    statistics.value = await getRiderStatistics(rider.value.id)
    orderList.value = await getOrderList({ riderId: rider.value.id })
  } else {
    orderList.value = []
  }
  loading.value = false
}

/** 标记已送达：状态改成 3（已完成） */
async function handleFinish(order: Order) {
  await updateOrderStatus(order.id, 3, '骑手已送达')
  ElMessage.success('已标记送达')
  await loadData()
}

/** 开始配送：状态从待接单改成配送中（这里给骑手一个手动按钮，方便演示） */
async function handleStart(order: Order) {
  await updateOrderStatus(order.id, 2, '骑手已取件，开始配送')
  ElMessage.success('已开始配送')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="我的跑腿" subtitle="这里是自己接下的订单" />

    <el-alert
      v-if="!rider"
      type="warning"
      :closable="false"
      title="当前用户不是骑手"
      description="请退出后用骑手账号登录（演示账号 dali / 123456）。"
      style="margin-bottom: 16px"
    />

    <!-- 业绩统计 -->
    <div v-if="statistics" class="stat-row">
      <div class="card stat-item">
        <div class="stat-value">{{ statistics.todayOrderCount }}</div>
        <div class="text-muted">今日完成</div>
      </div>
      <div class="card stat-item">
        <div class="stat-value">{{ statistics.totalOrderCount }}</div>
        <div class="text-muted">累计完成</div>
      </div>
      <div class="card stat-item">
        <div class="stat-value">￥{{ formatMoney(statistics.todayAmount) }}</div>
        <div class="text-muted">今日订单金额</div>
      </div>
      <div class="card stat-item">
        <div class="stat-value">{{ statistics.creditScore }}</div>
        <div class="text-muted">信用分</div>
      </div>
    </div>

    <EmptyBox v-if="orderList.length === 0" text="还没有接过单，去接单大厅看看" />

    <div v-else class="order-list">
      <div v-for="order in orderList" :key="order.id" class="card">
        <div class="flex-between">
          <div>
            <el-tag size="small">{{ getOrderTypeText(order.orderType) }}</el-tag>
            <span class="place">{{ order.orderType === 1 ? order.stationName : order.shopName }}</span>
            <OrderStatusTag :status="order.status" />
          </div>
          <span class="price">￥{{ formatMoney(order.totalAmount) }}</span>
        </div>

        <p class="text-muted">
          订单号 {{ order.orderNo }} · 送到 {{ order.receiverBuilding }} {{ order.receiverRoom }}（{{
            order.receiverName
          }} {{ order.receiverPhone }}）
        </p>
        <p class="text-muted">
          接单时间：{{ formatTime(order.acceptTime) }} · 完成时间：{{ formatTime(order.finishTime) }}
        </p>

        <div class="flex-between">
          <span class="text-muted">备注：{{ order.remark || '无' }}</span>
          <div>
            <el-button v-if="order.status === 1" size="small" @click="handleStart(order)">
              开始配送
            </el-button>
            <el-button
              v-if="order.status === 2"
              size="small"
              type="primary"
              @click="handleFinish(order)"
            >
              标记已送达
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 6px;
}

.order-list {
  display: flex;
  flex-direction: column;
}

.place {
  margin: 0 8px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
