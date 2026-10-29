<script setup lang="ts">
/**
 * 管理端 - 店铺管理
 * 结构：类型筛选 → 店铺表格 → 新增/修改弹窗
 * 外卖和小卖部共用 shop 表，靠 shopType 分；停业不用删店，状态改成休息就行
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { saveShop, updateShop, getAdminShopList } from '@/api/admin'
import type { Shop, ShopType } from '@/types'
import EmptyBox from '@/components/EmptyBox.vue'
import PageTitle from '@/components/PageTitle.vue'
import { formatMoney } from '@/utils/format'

const shopList = ref<Shop[]>([])
const loading = ref(false)

// 0 全部，2 外卖，3 小卖部
const queryType = ref(0)

const dialogVisible = ref(false)
const editingId = ref(0) // 0 表示新增

// 弹窗表单
const shopForm = reactive({
  shopName: '',
  shopType: 2, // 2 外卖 3 小卖部
  phone: '',
  address: '',
  openTime: '08:00',
  closeTime: '21:00',
  minAmount: 0,
  deliveryFee: 0,
  notice: '',
  sort: 0,
  status: 1,
})

// 表格里显示哪些：选了类型就过滤一下
const showList = computed(() => {
  if (queryType.value === 0) {
    return shopList.value
  }
  return shopList.value.filter((shop) => shop.shopType === queryType.value)
})

// 管理端接口包含休息中的店铺，不传类型就是全部
async function loadData() {
  loading.value = true
  try {
    shopList.value = await getAdminShopList()
  } finally {
    loading.value = false
  }
}

// 打开新增弹窗
function openAddDialog() {
  editingId.value = 0
  shopForm.shopName = ''
  shopForm.shopType = 2
  shopForm.phone = ''
  shopForm.address = ''
  shopForm.openTime = '08:00'
  shopForm.closeTime = '21:00'
  shopForm.minAmount = 0
  shopForm.deliveryFee = 0
  shopForm.notice = ''
  shopForm.sort = 0
  shopForm.status = 1
  dialogVisible.value = true
}

// 打开修改弹窗，把这一行的值填进表单
function openEditDialog(shop: Shop) {
  editingId.value = shop.id
  shopForm.shopName = shop.shopName
  shopForm.shopType = shop.shopType
  shopForm.phone = shop.phone
  shopForm.address = shop.address
  shopForm.openTime = shop.openTime
  shopForm.closeTime = shop.closeTime
  shopForm.minAmount = shop.minAmount
  shopForm.deliveryFee = shop.deliveryFee
  shopForm.notice = shop.notice
  shopForm.sort = shop.sort
  shopForm.status = shop.status
  dialogVisible.value = true
}

// 保存：新增调 saveShop，修改调 updateShop
async function handleSave() {
  if (!shopForm.shopName) {
    ElMessage.warning('请填写店铺名称')
    return
  }
  if (!shopForm.address) {
    ElMessage.warning('请填写店铺位置')
    return
  }

  const shop: Shop = {
    id: editingId.value,
    shopName: shopForm.shopName,
    shopType: shopForm.shopType as ShopType,
    logo: '',
    phone: shopForm.phone,
    address: shopForm.address,
    openTime: shopForm.openTime,
    closeTime: shopForm.closeTime,
    minAmount: shopForm.minAmount,
    deliveryFee: shopForm.deliveryFee,
    notice: shopForm.notice,
    status: shopForm.status,
    sort: shopForm.sort,
  }

  if (editingId.value === 0) {
    await saveShop(shop)
    ElMessage.success('店铺已添加')
  } else {
    await updateShop(shop)
    ElMessage.success('店铺已修改')
  }

  dialogVisible.value = false
  await loadData()
}

// 营业 / 休息 切换
async function handleChangeStatus(shop: Shop) {
  const status = shop.status === 1 ? 0 : 1
  await updateShop({ ...shop, status })
  ElMessage.success(status === 1 ? '已开始营业' : '已设为休息')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="店铺管理" subtitle="外卖商家和小卖部都在这，停业把状态改成休息就行，不用删" />

    <div class="card">
      <div class="filter-bar">
        <el-radio-group v-model="queryType">
          <el-radio-button :value="0">全部</el-radio-button>
          <el-radio-button :value="2">校园外卖</el-radio-button>
          <el-radio-button :value="3">小卖部</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="openAddDialog">新增店铺</el-button>
      </div>

      <EmptyBox v-if="showList.length === 0" text="还没有店铺，先加一个吧" />

      <el-table v-else :data="showList" style="width: 100%">
        <el-table-column prop="shopName" label="店铺名称" width="170" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.shopType === 2 ? 'primary' : 'warning'">
              {{ row.shopType === 2 ? '校园外卖' : '小卖部' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="位置" width="170" />
        <el-table-column label="营业时间" width="120">
          <template #default="{ row }">{{ row.openTime }} - {{ row.closeTime }}</template>
        </el-table-column>
        <el-table-column label="起送 / 配送费" width="130">
          <template #default="{ row }">
            ￥{{ formatMoney(row.minAmount) }} / ￥{{ formatMoney(row.deliveryFee) }}
          </template>
        </el-table-column>
        <el-table-column prop="notice" label="公告" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '营业中' : '休息中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">修改</el-button>
            <el-button link type="primary" @click="handleChangeStatus(row)">
              {{ row.status === 1 ? '休息' : '营业' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增 / 修改弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId === 0 ? '新增店铺' : '修改店铺'"
      width="520px"
    >
      <el-form label-width="90px">
        <el-form-item label="店铺名称">
          <el-input v-model="shopForm.shopName" placeholder="例如 一食堂·兰州拉面" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="shopForm.shopType">
            <el-radio :value="2">校园外卖</el-radio>
            <el-radio :value="3">小卖部</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="shopForm.address" placeholder="例如 第一食堂一楼 08 号窗口" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="shopForm.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="shopForm.openTime" placeholder="08:00" style="width: 110px" />
          <span style="margin: 0 8px">-</span>
          <el-input v-model="shopForm.closeTime" placeholder="21:00" style="width: 110px" />
          <span class="text-muted" style="margin-left: 8px">格式 08:00</span>
        </el-form-item>
        <el-form-item label="起送价">
          <el-input-number v-model="shopForm.minAmount" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="配送费">
          <el-input-number v-model="shopForm.deliveryFee" :min="0" :precision="2" :step="0.5" />
        </el-form-item>
        <el-form-item label="公告">
          <el-input v-model="shopForm.notice" placeholder="例如 满 20 元免配送费" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="shopForm.sort" :min="0" />
          <span class="text-muted" style="margin-left: 8px">数字小的排前面</span>
        </el-form-item>
        <el-form-item label="营业中">
          <el-switch v-model="shopForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
