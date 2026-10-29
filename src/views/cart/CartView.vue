<script setup lang="ts">
/**
 * 购物车 / 结算页
 * 结构：商品表格 → 地址和备注 → 提交订单
 * 一次只能结算一家店的商品，混店会提示先清理；只把 goodsId 和数量交给后端，订单号和金额都由后端来
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAddressList } from '@/api/address'
import { createOrder } from '@/api/order'
import { getShopById } from '@/api/store'
import type { Address, OrderCreateForm } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import EmptyBox from '@/components/EmptyBox.vue'
import PageTitle from '@/components/PageTitle.vue'
import { formatMoney } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const addressList = ref<Address[]>([])
const addressId = ref(0)
const remark = ref('')
const deliveryFee = ref(0) // 配送费从店铺信息里取

/** 购物车里的商品是不是都来自同一家店铺 */
const sameShop = computed(() => cartStore.cartList.every((item) => item.shopId === cartStore.shopId))
/** 实付金额 = 商品金额 + 配送费 */
const payAmount = computed(() => cartStore.totalAmount + deliveryFee.value)

/** 加载购物车、地址、店铺配送费 */
async function loadData() {
  await cartStore.loadCart()
  addressList.value = await getAddressList(userStore.userId)

  const defaultAddress = addressList.value.find((item) => item.isDefault === 1)
  if (defaultAddress) {
    addressId.value = defaultAddress.id
  }

  if (cartStore.shopId) {
    const shop = await getShopById(cartStore.shopId)
    deliveryFee.value = shop ? shop.deliveryFee : 0
  }
}

/** 改数量 */
async function handleQuantityChange(id: number, quantity: number | undefined) {
  if (!quantity) {
    return
  }
  await cartStore.changeQuantity(id, quantity)
}

/** 删除一件商品 */
async function handleRemove(id: number) {
  const confirmed = await ElMessageBox.confirm('确定要从购物车删除这件商品吗？', '提示', {
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) {
    return
  }
  await cartStore.remove(id)
  ElMessage.success('已删除')
}

/** 提交订单 */
async function handleSubmit() {
  if (cartStore.cartList.length === 0) {
    ElMessage.warning('购物车还是空的，先去点单吧')
    return
  }
  if (!sameShop.value) {
    ElMessage.warning('购物车里有不同店铺的商品，一次只能结算一家店铺，请先删掉其他店铺的商品')
    return
  }

  const address = addressList.value.find((item) => item.id === addressId.value)
  if (!address) {
    ElMessage.warning('请选择收货地址，没有地址可以去个人中心添加')
    return
  }

  const shopId = cartStore.shopId
  const shop = await getShopById(shopId)
  const minAmount = shop ? shop.minAmount : 0
  if (cartStore.totalAmount < minAmount) {
    ElMessage.warning(`还差 ￥${formatMoney(minAmount - cartStore.totalAmount)} 起送`)
    return
  }

  const orderForm: OrderCreateForm = {
    // 小卖部是 3，其他都按校园外卖 2 处理
    orderType: shop && shop.shopType === 3 ? 3 : 2,
    userId: userStore.userId,
    shopId,
    addressId: address.id,
    receiverName: address.contactName,
    receiverPhone: address.phone,
    receiverBuilding: address.building,
    receiverRoom: address.room,
    remark: remark.value,
    expectTime: '',
    tip: 0,
    deliveryFee: deliveryFee.value,
    // 只把商品 id 和数量传给后端，价格由后端查数据库算，更安全
    items: cartStore.cartList.map((item) => ({ goodsId: item.goodsId, quantity: item.quantity })),
  }

  const order = await createOrder(orderForm)
  await cartStore.clear()
  ElMessage.success('下单成功，等待骑手接单')
  router.push(`/order/${order.id}`)
}

onMounted(loadData)
</script>

<template>
  <div>
    <PageTitle title="购物车" subtitle="确认商品和数量后提交订单" />

    <EmptyBox v-if="cartStore.cartList.length === 0" text="购物车是空的">
      <el-button type="primary" @click="router.push('/shop')">去小卖部逛逛</el-button>
    </EmptyBox>

    <template v-else>
      <div class="card">
        <el-table :data="cartStore.cartList" style="width: 100%">
          <el-table-column prop="shopName" label="店铺" width="160" />
          <el-table-column prop="goodsName" label="商品" />
          <el-table-column label="单价" width="100">
            <template #default="{ row }">￥{{ formatMoney(row.price) }}</template>
          </el-table-column>
          <el-table-column label="数量" width="170">
            <template #default="{ row }">
              <el-input-number
                :model-value="row.quantity"
                :min="1"
                :max="99"
                size="small"
                @change="(value: number | undefined) => handleQuantityChange(row.id, value)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="110">
            <template #default="{ row }">
              <span class="price">￥{{ formatMoney(row.price * row.quantity) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template #default="{ row }">
              <el-button link type="danger" @click="handleRemove(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="card">
        <el-form label-width="90px">
          <el-form-item label="收货地址">
            <el-select v-model="addressId" placeholder="请选择收货地址" style="width: 320px">
              <el-option
                v-for="address in addressList"
                :key="address.id"
                :label="`${address.building} ${address.room}（${address.contactName}）`"
                :value="address.id"
              />
            </el-select>
            <el-button link type="primary" @click="router.push('/profile')">去添加地址</el-button>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="remark"
              type="textarea"
              :rows="2"
              maxlength="100"
              show-word-limit
              placeholder="例如：不要辣，送到 3 号楼门口"
              style="width: 420px"
            />
          </el-form-item>
        </el-form>

        <el-alert
          v-if="!sameShop"
          type="warning"
          :closable="false"
          title="购物车里有不同店铺的商品，一次只能结算一家店铺"
        />
      </div>

      <div class="card flex-between">
        <div>
          <span class="text-muted">商品金额 ￥{{ formatMoney(cartStore.totalAmount) }}</span>
          <span class="text-muted" style="margin: 0 8px">+</span>
          <span class="text-muted">配送费 ￥{{ formatMoney(deliveryFee) }}</span>
          <span class="text-muted" style="margin: 0 8px">=</span>
          <span class="price">￥{{ formatMoney(payAmount) }}</span>
        </div>
        <el-button type="primary" size="large" @click="handleSubmit">提交订单</el-button>
      </div>
    </template>
  </div>
</template>
