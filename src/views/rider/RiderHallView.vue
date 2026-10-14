<script setup lang="ts">
/**
 * 骑手接单大厅
 * 骑手在这里看到所有“待接单”的订单，点“抢单”就接下这一单。
 * 注意：骑手也是 user，用当前用户的 id 去查 rider 表里的记录。
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { acceptOrder, getOrderList } from '@/api/order'
import { getRiderInfo, getRiderStatistics, updateRiderStatus } from '@/api/rider'
import type { Order, Rider, RiderStatistics } from '@/types'
import { useUserStore } from '@/stores/user'
import EmptyBox from '@/components/EmptyBox.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import PageTitle from '@/components/PageTitle.vue'
import { getOrderTypeText, PACKAGE_SIZE_TEXT } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const rider = ref<Rider | null>(null)
const statistics = ref<RiderStatistics | null>(null)
const hallList = ref<Order[]>([])
const loading = ref(false)

/** 当前用户不是骑手时给出提示，避免学生以为是程序坏了 */
const notRider = computed(() => rider.value === null)

/** 加载骑手信息 + 待接单订单 + 业绩统计 */
async function loadData() {
  loading.value = true

  // 骑手记录用当前用户的 id 去查（data.sql 里李大力的 user_id 是 2）
  rider.value = await getRiderInfo(userStore.userId)

  if (rider.value) {
    statistics.value = await getRiderStatistics(rider.value.id)
  }

  hallList.value = await getOrderList({ status: 1 })
  loading.value = false
}

/** 切换“可接单 / 休息中” */
async function handleSwitchStatus(value: unknown) {
  if (!rider.value) {
    return
  }
  await updateRiderStatus(rider.value.id, Number(value))
  ElMessage.success(Number(value) === 1 ? '已开始接单' : '已切换为休息中')
}

/** 抢单 */
async function handleAccept(order: Order) {
  if (!rider.value) {
    return
  }
  if (rider.value.status !== 1) {
    ElMessage.warning('你现在是休息状态，先打开“可接单”开关')
    return
  }
  await acceptOrder(order.id, rider.value.id)
  ElMessage.success('接单成功，记得按时送达')
  await loadData()
  router.push('/rider/mine')
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="骑手接单大厅" subtitle="接单后请在“我的跑腿”里查看并送达" />

    <!-- 不是骑手时的提示 -->
    <el-alert
      v-if="notRider"
      type="warning"
      :closable="false"
      title="当前用户不是骑手"
      description="请退出后用骑手账号登录（演示账号 dali / 123456），再回到这个页面。"
      style="margin-bottom: 16px"
    />

    <!-- 骑手信息 -->
    <div v-if="rider" class="card flex-between">
      <div>
        <h3 class="block-title">{{ rider.realName }}（骑手）</h3>
        <p class="text-muted">
          学号 {{ rider.studentNo }} · 手机号 {{ rider.phone }} · 累计完成 {{ rider.totalOrders }} 单
          <template v-if="statistics">
            · 今日完成 {{ statistics.todayOrderCount }} 单 · 信用分 {{ statistics.creditScore }}
          </template>
        </p>
      </div>
      <div>
        <span class="text-muted">接单状态：</span>
        <el-switch
          :model-value="rider.status"
          :active-value="1"
          :inactive-value="0"
          active-text="可接单"
          inactive-text="休息中"
          @change="handleSwitchStatus"
        />
      </div>
    </div>

    <!-- 待接单列表 -->
    <h3 class="block-title">待接单（{{ hallList.length }} 单）</h3>
    <EmptyBox v-if="hallList.length === 0" text="暂时没有待接单的订单" />

    <div v-else class="hall-list">
      <div v-for="order in hallList" :key="order.id" class="card">
        <div class="flex-between">
          <div>
            <el-tag size="small">{{ getOrderTypeText(order.orderType) }}</el-tag>
            <span class="place">{{ order.orderType === 1 ? order.stationName : order.shopName }}</span>
            <OrderStatusTag :status="order.status" />
          </div>
          <span class="price">￥{{ formatMoney(order.totalAmount) }}</span>
        </div>

        <p class="text-muted">
          送到：{{ order.receiverBuilding }} {{ order.receiverRoom }}（{{ order.receiverName }}
          {{ order.receiverPhone }}）
        </p>

        <p v-if="order.orderType === 1" class="text-muted">
          取件码 {{ order.pickupCode }} · {{ order.expressCompany }} ·
          {{ PACKAGE_SIZE_TEXT[order.packageSize] }} · {{ order.packageWeight }} 千克
        </p>
        <p v-else class="text-muted">共 {{ order.items ? order.items.length : 0 }} 种商品</p>

        <p class="text-muted">
          备注：{{ order.remark || '无' }} · 期望送达：{{ formatTime(order.expectTime) }} · 下单：{{
            formatTime(order.createTime)
          }}
        </p>

        <div class="flex-between">
          <span class="text-muted">跑腿费 ￥{{ formatMoney(order.deliveryFee) }} + 小费 ￥{{ formatMoney(order.tip) }}</span>
          <el-button type="primary" @click="handleAccept(order)">抢单</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-title {
  margin: 0 0 8px;
  font-size: 16px;
}

.hall-list {
  display: flex;
  flex-direction: column;
}

.place {
  margin: 0 8px;
  font-weight: bold;
}
</style>
