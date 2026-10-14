<script setup lang="ts">
/**
 * 订单状态标签：把数字状态显示成带颜色的中文
 * <OrderStatusTag :status="order.status" />
 */
import type { OrderStatus } from '@/types'
import { getOrderStatusColor, getOrderStatusText } from '@/utils/dict'

defineProps<{
  status: OrderStatus
}>()
</script>

<template>
  <el-tag :type="getOrderStatusColor(status)" effect="light">
    {{ getOrderStatusText(status) }}
  </el-tag>
</template>
