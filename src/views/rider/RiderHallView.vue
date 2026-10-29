<script setup lang="ts">
/**
 * 骑手接单大厅
 * 结构：骑手信息+接单开关 → 待接单列表 → 抢单
 * 数据从 stores/rider.ts 来，这里只调 action 和显示
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import type { Order } from '@/types'
import { useRiderStore } from '@/stores/rider'
import EmptyBox from '@/components/EmptyBox.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import PageTitle from '@/components/PageTitle.vue'
import { getOrderTypeText, PACKAGE_SIZE_TEXT } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const router = useRouter()
const riderStore = useRiderStore()

// 解构 state 和 getters 得用 storeToRefs，不然拿到的是普通值，store 变了页面不动
const { rider, statistics, hallList, status } = storeToRefs(riderStore)

// 加载遮罩就这个页面用，放这儿就行，不用进 store
const loading = ref(false)

// 不是骑手就提示一下，免得以为是程序坏了
const notRider = computed(() => rider.value === null)

// 进页面先拉数据
async function loadData() {
  loading.value = true
  try {
    await riderStore.loadAll()
  } finally {
    loading.value = false
  }
}

// 切接单状态，请求和回滚都在 store 里，这里只管提示
async function handleSwitchStatus(value: unknown) {
  try {
    await riderStore.changeStatus(Number(value))
    ElMessage.success(Number(value) === 1 ? '已开始接单' : '已切换为休息中')
  } catch (error) {
    ElMessage.error('切换失败，请稍后重试123：' + (error as Error).message)
  }
}

// 抢单
async function handleAccept(order: Order) {
  if (!rider.value) {
    ElMessage.warning('当前账号不是骑手，不能接单')
    return
  }
  if (status.value !== 1) {
    ElMessage.warning('你现在是休息状态，先打开“可接单”开关')
    return
  }

  await riderStore.accept(order)
  ElMessage.success('接单成功，记得按时送达')
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
            · 今日完成 {{ statistics.todayOrders }} 单 · 信用分 {{ statistics.creditScore }}
          </template>
        </p>
      </div>
      <div>
        <span class="text-muted">接单状态：</span>
        <!-- status 是 getter 只能读，所以用 :model-value，点完由 action 改 state -->
        <el-switch
          :model-value="status"
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
