<script setup lang="ts">
/**
 * 订单详情页
 * 结构：订单信息 → 商品明细 → 金额明细 → 操作按钮
 * 待接单能取消，配送中能确认收货
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelOrder, getOrderDetail, updateOrderStatus } from '@/api/order'
import type { Order } from '@/types'
import { useUserStore } from '@/stores/user'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import PageTitle from '@/components/PageTitle.vue'
import { getOrderTypeText, PACKAGE_SIZE_TEXT } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const props = defineProps<{
  id: string 
}>()

const router = useRouter()
const userStore = useUserStore()
const order = ref<Order | null>(null)
const loading = ref(false)

/** 商品明细，没有就是空数组，模板里可以直接 v-for */
const items = computed(() => (order.value && order.value.items ? order.value.items : []))

async function loadOrder() {
  loading.value = true
  try {
    order.value = await getOrderDetail(Number(props.id))
  } finally {
    loading.value = false
  }
}

/** 取消订单 */
async function handleCancel() {
  if (!order.value) {
    return
  }
  const result = await ElMessageBox.prompt('请填写取消原因', '取消订单', {
    inputPlaceholder: '例如：不需要了',
  })
    .then((value) => value)
    .catch(() => null)

  if (!result) {
    return
  }
  await cancelOrder(
    order.value.id,
    result.value,
    userStore.userId,
    userStore.currentUser?.role ?? 1,
  )
  ElMessage.success('订单已取消')
  await loadOrder()
}

/** 确认收货：把订单状态改成 3（已完成） */
async function handleFinish() {
  if (!order.value) {
    return
  }
  await updateOrderStatus(
    order.value.id,
    3,
    '顾客确认收货',
    userStore.userId,
    userStore.currentUser?.role ?? 1,
  )
  ElMessage.success('已确认收货')
  await loadOrder()
}

onMounted(loadOrder)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="订单详情" :subtitle="order ? `订单号 ${order.orderNo}` : ''" />

    <template v-if="order">
      <!-- 订单信息 -->
      <div class="card">
        <div class="flex-between">
          <h3 class="block-title">
            {{ getOrderTypeText(order.orderType) }}
            <OrderStatusTag :status="order.status" />
          </h3>
          <el-button link type="primary" @click="router.back()">返回</el-button>
        </div>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="下单时间">
            {{ formatTime(order.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="期望送达">
            {{ formatTime(order.expectTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="收货人">
            {{ order.receiverName }} {{ order.receiverPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址">
            {{ order.receiverBuilding }} {{ order.receiverRoom }}
          </el-descriptions-item>

          <template v-if="order.orderType === 1">
            <el-descriptions-item label="取件点">
              {{ order.stationName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="取件码">
              {{ order.pickupCode }}
            </el-descriptions-item>
            <el-descriptions-item label="快递公司">
              {{ order.expressCompany }}
            </el-descriptions-item>
            <el-descriptions-item label="包裹">
              {{ PACKAGE_SIZE_TEXT[order.packageSize] || '-' }} / {{ order.packageWeight }} 千克
            </el-descriptions-item>
          </template>

          <template v-else>
            <el-descriptions-item label="店铺">
              {{ order.shopName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="接单骑手">
              {{ order.riderName || '还没有骑手接单' }}
            </el-descriptions-item>
          </template>

          <el-descriptions-item label="备注" :span="2">
            {{ order.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品明细：代取快递没有商品，就不显示这张表 -->
      <div v-if="items.length > 0" class="card">
        <h3 class="block-title">商品明细</h3>
        <el-table :data="items" style="width: 100%">
          <el-table-column prop="goodsName" label="商品" />
          <el-table-column label="单价" width="110">
            <template #default="{ row }">￥{{ formatMoney(row.price) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="90" />
          <el-table-column label="小计" width="110">
            <template #default="{ row }">
              <span class="price">￥{{ formatMoney(row.amount) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 金额明细 -->
      <div class="card">
        <h3 class="block-title">金额明细</h3>
        <div class="amount-line">
          <span>商品金额</span>
          <span>￥{{ formatMoney(order.goodsAmount) }}</span>
        </div>
        <div class="amount-line">
          <span>配送费 / 跑腿费</span>
          <span>￥{{ formatMoney(order.deliveryFee) }}</span>
        </div>
        <div class="amount-line">
          <span>小费</span>
          <span>￥{{ formatMoney(order.tip) }}</span>
        </div>
        <div class="amount-line amount-total">
          <span>合计</span>
          <span class="price">￥{{ formatMoney(order.totalAmount) }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="card flex-between">
        <span class="text-muted">
          骑手接单时间：{{ formatTime(order.acceptTime) }} · 完成时间：{{ formatTime(order.finishTime) }}
        </span>
        <div>
          <el-button v-if="order.status === 1" type="danger" plain @click="handleCancel">
            取消订单
          </el-button>
          <el-button v-if="order.status === 2" type="primary" @click="handleFinish">
            确认收货
          </el-button>
        </div>
      </div>
    </template>

    <el-empty v-else-if="!loading" description="没有找到这个订单" />
  </div>
</template>

<style scoped>
.block-title {
  margin: 0 0 12px;
  font-size: 16px;
}

.amount-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.amount-total {
  border-top: 1px solid #ebeef5;
  margin-top: 6px;
  padding-top: 10px;
  font-weight: bold;
}
</style>
