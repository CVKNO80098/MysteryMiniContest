<script setup lang="ts">
/**
 * 管理端 - 订单管理
 * 结构：状态和类型筛选 → 订单表格（可以跳到详情）
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList } from '@/api/order'
import type { Order, OrderStatus, OrderType } from '@/types'
import EmptyBox from '@/components/EmptyBox.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import PageTitle from '@/components/PageTitle.vue'
import { getOrderTypeText } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const router = useRouter()

const statusTabs = [
  { label: '全部', value: '' },
  { label: '待接单', value: 1 },
  { label: '配送中', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
]

const typeTabs = [
  { label: '全部类型', value: '' },
  { label: '代取快递', value: 1 },
  { label: '校园外卖', value: 2 },
  { label: '小卖部', value: 3 },
]

const activeStatus = ref<string | number>('')
const activeType = ref<string | number>('')
const orderList = ref<Order[]>([])
const loading = ref(false)

/** 加载订单列表 */
async function loadOrderList() {
  loading.value = true
  const status = activeStatus.value === '' ? '' : (Number(activeStatus.value) as OrderStatus)
  const orderType = activeType.value === '' ? '' : (Number(activeType.value) as OrderType)
  orderList.value = await getOrderList({ status, orderType })
  loading.value = false
}

/** 订单地点：快递显示驿站，其他显示店铺 */
function getPlaceText(order: Order): string {
  return order.orderType === 1 ? order.stationName || '-' : order.shopName || '-'
}

onMounted(loadOrderList)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="订单管理" subtitle="平台上的所有订单" />

    <div class="card">
      <div class="filter-bar">
        <el-radio-group v-model="activeStatus" @change="loadOrderList">
          <el-radio-button v-for="tab in statusTabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </el-radio-button>
        </el-radio-group>

        <el-radio-group v-model="activeType" @change="loadOrderList">
          <el-radio-button v-for="tab in typeTabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <EmptyBox v-if="orderList.length === 0" text="没有符合条件的订单" />

      <el-table v-else :data="orderList" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ getOrderTypeText(row.orderType) }}</template>
        </el-table-column>
        <el-table-column label="店铺 / 驿站" width="180">
          <template #default="{ row }">{{ getPlaceText(row) }}</template>
        </el-table-column>
        <el-table-column label="收货地址" width="150">
          <template #default="{ row }">{{ row.receiverBuilding }} {{ row.receiverRoom }}</template>
        </el-table-column>
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            <span class="price">￥{{ formatMoney(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <OrderStatusTag :status="row.status" />
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="150">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/order/${row.id}`)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
