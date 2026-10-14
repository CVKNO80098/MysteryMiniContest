<script setup lang="ts">
/**
 * 店铺列表页
 * 校园外卖（shopType=2）和小卖部（shopType=3）共用这个页面，靠 shopType 区分文字和接口参数。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getShopList } from '@/api/store'
import type { Shop, ShopType } from '@/types'
import PageTitle from '@/components/PageTitle.vue'
import EmptyBox from '@/components/EmptyBox.vue'

const props = defineProps<{
  shopType: number
}>()

const router = useRouter()
const shopList = ref<Shop[]>([])
const loading = ref(false)

/** 页面文字：外卖和小卖部不一样，其他逻辑完全一样 */
const pageInfo = computed(() => {
  if (props.shopType === 2) {
    return { title: '校园外卖', subtitle: '食堂窗口在线点单，骑手送到你手上' }
  }
  return { title: '小卖部送货上门', subtitle: '零食饮料日用百货，下单后送到宿舍' }
})

/** 加载店铺列表 */
async function loadShopList() {
  loading.value = true
  shopList.value = await getShopList(props.shopType as ShopType)
  loading.value = false
}

/** 点店铺进入商品页：外卖走 /food/:shopId，小卖部走 /shop/:shopId */
function goShopGoods(shop: Shop) {
  const routeName = shop.shopType === 2 ? 'foodGoods' : 'shopGoods'
  router.push({ name: routeName, params: { shopId: shop.id } })
}

onMounted(loadShopList)

// 外卖和小卖部共用组件，路由切换时组件会被复用，所以要监听 shopType 变化重新加载
watch(
  () => props.shopType,
  () => {
    loadShopList()
  },
)
</script>

<template>
  <div v-loading="loading">
    <PageTitle :title="pageInfo.title" :subtitle="pageInfo.subtitle" />

    <EmptyBox v-if="shopList.length === 0" text="还没有营业的店铺" />

    <div v-else class="shop-list">
      <div v-for="shop in shopList" :key="shop.id" class="shop-card" @click="goShopGoods(shop)">
        <div class="shop-logo">{{ shop.shopName.slice(0, 1) }}</div>
        <div class="shop-info">
          <div class="shop-name">
            {{ shop.shopName }}
            <el-tag v-if="shop.status === 1" type="success" size="small">营业中</el-tag>
            <el-tag v-else type="info" size="small">休息中</el-tag>
          </div>
          <div class="text-muted">
            营业时间 {{ shop.openTime }} - {{ shop.closeTime }} · 起送 ￥{{ shop.minAmount }} · 配送费
            ￥{{ shop.deliveryFee }}
          </div>
          <div class="text-muted">{{ shop.notice }}</div>
        </div>
        <el-button type="primary" plain>去点单</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shop-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.shop-logo {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 16px;
  margin-bottom: 6px;
}
</style>
