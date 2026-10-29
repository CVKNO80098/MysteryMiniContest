<script setup lang="ts">
/**
 * 我的订单页
 * 结构：状态筛选 → 订单卡片（待接单的可以取消）
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelOrder, getOrderList } from '@/api/order'
import type { Order, OrderStatus } from '@/types'
import { useUserStore } from '@/stores/user'
import EmptyBox from '@/components/EmptyBox.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import PageTitle from '@/components/PageTitle.vue'
import { getOrderTypeText } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

/** 状态筛选按钮：value 为空字符串表示“全部” */
const statusTabs = [
  { label: '全部', value: '' },
  { label: '待接单', value: 1 },
  { label: '配送中', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
]

const activeStatus = ref<string | number>('')
const orderList = ref<Order[]>([])
const loading = ref(false)

/** 加载订单列表 */
async function loadOrderList() {
  loading.value = true
  try {
    const status = activeStatus.value === '' ? '' : (Number(activeStatus.value) as OrderStatus)
    orderList.value = await getOrderList({ userId: userStore.userId, status })
  } finally {
    loading.value = false
  }
}

/** 订单显示的地点：外卖小卖部显示店铺名，快递显示驿站名 */
function getPlaceText(order: Order): string {
  if (order.orderType === 1) {
    return order.stationName || '快递驿站'
  }
  return order.shopName || '店铺'
}

/** 取消订单 */
async function handleCancel(order: Order) {
  const result = await ElMessageBox.prompt('请填写取消原因', '取消订单', {
    inputPlaceholder: '例如：不需要了',
  })
    .then((value) => value)
    .catch(() => null)

  if (!result) {
    return
  }
  await cancelOrder(
    order.id,
    result.value,
    userStore.userId,
    userStore.currentUser?.role ?? 1,
  )
  ElMessage.success('订单已取消')
  await loadOrderList()
}

onMounted(loadOrderList)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="我的订单" subtitle="快递、外卖、小卖部的订单都在这里" />

    <div class="filter-bar">
      <el-radio-group v-model="activeStatus" @change="loadOrderList">
        <el-radio-button v-for="tab in statusTabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <EmptyBox v-if="orderList.length === 0" text="还没有订单，去首页看看吧" />

    <div v-else class="order-list">
      <div v-for="order in orderList" :key="order.id" class="card order-card">
        <div class="flex-between">
          <div>
            <el-tag size="small">{{ getOrderTypeText(order.orderType) }}</el-tag>
            <span class="order-place">{{ getPlaceText(order) }}</span>
            <OrderStatusTag :status="order.status" />
          </div>
          <span class="text-muted">{{ formatTime(order.createTime) }}</span>
        </div>

        <p class="text-muted">
          订单号：{{ order.orderNo }} · 收货：{{ order.receiverBuilding }} {{ order.receiverRoom }}
          <template v-if="order.orderType === 1">
            · 取件码：{{ order.pickupCode }} · 驿站：{{ order.stationName }}
          </template>
        </p>

        <div class="flex-between">
          <span>
            合计 <span class="price">￥{{ formatMoney(order.totalAmount) }}</span>
          </span>
          <div class="order-buttons">
            <el-button size="small" @click="router.push(`/order/${order.id}`)">查看详情</el-button>
            <el-button
              v-if="order.status === 1"
              size="small"
              type="danger"
              plain
              @click="handleCancel(order)"
            >
              取消订单
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
}

.order-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-place {
  margin: 0 8px;
  font-weight: bold;
}

.order-buttons {
  display: flex;
  gap: 8px;
}
</style>
