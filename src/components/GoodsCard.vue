<script setup lang="ts">
/**
 * 商品卡片：外卖点单页和小卖部点单页共用
 * 点击“加入购物车”时，把商品对象通过 add 事件抛给父组件处理
 * 我的审美不是很好，这里可以自行修改一下...
 */
import type { Goods } from '@/types'
import { formatMoney } from '@/utils/format'

defineProps<{
  goods: Goods
}>()

const emit = defineEmits<{
  (e: 'add', goods: Goods): void
}>()

/** 没有商品图片时，用商品名第一个字当占位图 */
function firstWord(name: string): string {
  return name.slice(0, 1)
}
</script>

<template>
  <div class="goods-card">
    <div class="goods-image">
      <img v-if="goods.image" :src="goods.image" :alt="goods.goodsName" />
      <span v-else>{{ firstWord(goods.goodsName) }}</span>
    </div>

    <div class="goods-info">
      <div class="goods-name">{{ goods.goodsName }}</div>
      <div class="goods-desc">{{ goods.description }}</div>
      <div class="goods-sales">已售 {{ goods.sales }} {{ goods.unit }}</div>

      <div class="goods-bottom">
        <div>
          <span class="goods-price">￥{{ formatMoney(goods.price) }}</span>
          <span class="goods-origin">￥{{ formatMoney(goods.originalPrice) }}</span>
        </div>
        <el-button type="primary" size="small" @click="emit('add', goods)">加入购物车</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.goods-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.goods-image {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 15px;
  color: #303133;
}

.goods-desc,
.goods-sales {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.goods-bottom {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  color: #f56c6c;
  font-weight: bold;
}

.goods-origin {
  margin-left: 6px;
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}
</style>
