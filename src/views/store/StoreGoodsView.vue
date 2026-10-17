<script setup lang="ts">
/**
 * 店铺点单页（外卖 / 小卖部共用）
 * 结构：店铺信息 → 分类筛选 → 商品列表 → 底部购物车条
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCategoryList, getGoodsList, getShopById } from '@/api/store'
import type { Goods, GoodsCategory, Shop } from '@/types'
import { useCartStore } from '@/stores/cart'
import EmptyBox from '@/components/EmptyBox.vue'
import GoodsCard from '@/components/GoodsCard.vue'
import { formatMoney } from '@/utils/format'

const props = defineProps<{
  shopId: string // 路由参数是字符串，用的时候记得 Number() 转换
}>()

const router = useRouter()
const cartStore = useCartStore()

const shop = ref<Shop | null>(null)
const categoryList = ref<GoodsCategory[]>([])
const goodsList = ref<Goods[]>([])
const activeCategoryId = ref(0) // 0 表示“全部”
const loading = ref(false)

/** 页面上真正显示的商品：选了分类就过滤一下 */
const showGoodsList = computed(() => {
  if (activeCategoryId.value === 0) {
    return goodsList.value
  }
  return goodsList.value.filter((goods) => goods.categoryId === activeCategoryId.value)
})

/** 加载店铺信息、分类、商品 */
async function loadData() {
  loading.value = true
  const id = Number(props.shopId)
  shop.value = await getShopById(id)
  categoryList.value = await getCategoryList(id)
  goodsList.value = await getGoodsList({ shopId: id })
  loading.value = false
}

/** 加入购物车 */
async function handleAdd(goods: Goods) {
  await cartStore.add(goods.shopId, goods.id, 1)
  ElMessage.success(`已把「${goods.goodsName}」加入购物车`)
}

/** 去购物车结算 */
function goCart() {
  router.push('/cart')
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <!-- 店铺信息 -->
    <div v-if="shop" class="card flex-between">
      <div>
        <h2 class="shop-title">{{ shop.shopName }}</h2>
        <p class="text-muted">
          {{ shop.address }} · 营业 {{ shop.openTime }}-{{ shop.closeTime }} · 起送 ￥{{
            shop.minAmount
          }}
          · 配送费 ￥{{ shop.deliveryFee }}
        </p>
        <p class="text-muted">{{ shop.notice }}</p>
      </div>
      <el-button link type="primary" @click="router.back()">返回</el-button>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar">
      <el-radio-group v-model="activeCategoryId">
        <el-radio-button :value="0">全部</el-radio-button>
        <el-radio-button
          v-for="category in categoryList"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 商品列表 -->
    <EmptyBox v-if="showGoodsList.length === 0" text="这家店还没有上架商品" />
    <div v-else class="goods-list">
      <GoodsCard
        v-for="goods in showGoodsList"
        :key="goods.id"
        :goods="goods"
        @add="handleAdd"
      />
    </div>

    <!-- 底部购物车条 -->
    <div class="cart-bar">
      <div>
        已选 <span class="cart-count">{{ cartStore.totalCount }}</span> 件，合计
        <span class="price">￥{{ formatMoney(cartStore.totalAmount) }}</span>
      </div>
      <el-button type="primary" :disabled="cartStore.totalCount === 0" @click="goCart">
        去购物车结算
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.shop-title {
  margin: 0 0 6px;
  font-size: 18px;
}

.goods-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-bottom: 70px;
}

.cart-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 60px;
  padding: 0 24px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 0 auto;
}

.cart-count {
  color: #409eff;
  font-weight: bold;
}

@media (max-width: 768px) {
  .goods-list {
    grid-template-columns: 1fr;
  }
}
</style>
