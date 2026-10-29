<script setup lang="ts">
/**
 * 管理端 - 商品管理
 * 结构：筛选栏 → 商品表格 → 新增/修改弹窗
 * 能按店铺和关键字查，能改价格库存、上下架、删除
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteGoods,
  getAdminGoodsList,
  getAdminShopList,
  saveGoods,
  updateGoods,
} from '@/api/admin'
import { getCategoryList } from '@/api/store'
import type { Goods, GoodsCategory, Shop } from '@/types'
import PageTitle from '@/components/PageTitle.vue'
import { formatMoney } from '@/utils/format'

const goodsList = ref<Goods[]>([])
const shopList = ref<Shop[]>([])
const categoryList = ref<GoodsCategory[]>([])
const loading = ref(false)

/** 查询条件 */
const query = reactive({
  shopId: 0, // 0 表示全部店铺
  keyword: '',
})

/** 管理端列表包含已下架商品，所以筛选放在前端做 */
const showGoods = computed(() => {
  const keyword = query.keyword.trim()
  return goodsList.value.filter((goods) => {
    const matchShop = query.shopId === 0 || goods.shopId === query.shopId
    const matchKeyword = !keyword || goods.goodsName.includes(keyword)
    return matchShop && matchKeyword
  })
})

const dialogVisible = ref(false)
const editingId = ref(0) // 0 表示新增，其他表示修改

/** 商品表单 */
const goodsForm = reactive({
  shopId: 0,
  categoryId: 0,
  goodsName: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  unit: '份',
  description: '',
  status: 1,
})

/** 加载店铺和商品（管理端接口包含下架/休息） */
async function loadData() {
  loading.value = true
  try {
    shopList.value = await getAdminShopList()
    goodsList.value = await getAdminGoodsList()
  } finally {
    loading.value = false
  }
}

/** 切店铺时重新加载该店分类 */
async function loadCategories(shopId: number) {
  categoryList.value = shopId ? await getCategoryList(shopId) : []
}

async function onShopChange() {
  await loadCategories(goodsForm.shopId)
  goodsForm.categoryId = categoryList.value[0]?.id ?? 0
}

/** 店铺名：商品列表里显示用 */
function getShopName(shopId: number): string {
  const shop = shopList.value.find((item) => item.id === shopId)
  return shop ? shop.shopName : '-'
}

/** 打开新增弹窗 */
async function openAddDialog() {
  editingId.value = 0
  goodsForm.shopId = shopList.value[0]?.id ?? 0
  goodsForm.goodsName = ''
  goodsForm.price = 0
  goodsForm.originalPrice = 0
  goodsForm.stock = 0
  goodsForm.unit = '份'
  goodsForm.description = ''
  goodsForm.status = 1
  await loadCategories(goodsForm.shopId)
  goodsForm.categoryId = categoryList.value[0]?.id ?? 0
  dialogVisible.value = true
}

/** 打开修改弹窗 */
async function openEditDialog(goods: Goods) {
  editingId.value = goods.id
  goodsForm.shopId = goods.shopId
  goodsForm.categoryId = goods.categoryId
  goodsForm.goodsName = goods.goodsName
  goodsForm.price = goods.price
  goodsForm.originalPrice = goods.originalPrice
  goodsForm.stock = goods.stock
  goodsForm.unit = goods.unit
  goodsForm.description = goods.description
  goodsForm.status = goods.status
  await loadCategories(goods.shopId)
  dialogVisible.value = true
}

/** 保存商品 */
async function handleSave() {
  if (!goodsForm.goodsName) {
    ElMessage.warning('请填写商品名称')
    return
  }
  if (goodsForm.price <= 0) {
    ElMessage.warning('价格要大于 0')
    return
  }
  if (!goodsForm.categoryId) {
    ElMessage.warning('该店铺还没有分类，请先在数据库里补一个分类')
    return
  }

  const goods: Goods = {
    id: editingId.value,
    shopId: goodsForm.shopId,
    categoryId: goodsForm.categoryId,
    goodsName: goodsForm.goodsName,
    image: '',
    price: goodsForm.price,
    originalPrice: goodsForm.originalPrice,
    stock: goodsForm.stock,
    sales: 0,
    unit: goodsForm.unit,
    description: goodsForm.description,
    status: goodsForm.status,
    sort: 0,
  }

  if (editingId.value === 0) {
    await saveGoods(goods)
    ElMessage.success('商品已添加')
  } else {
    await updateGoods(goods)
    ElMessage.success('商品已修改')
  }
  dialogVisible.value = false
  await loadData()
}

/** 上架 / 下架 */
async function handleChangeStatus(goods: Goods) {
  const newStatus = goods.status === 1 ? 0 : 1
  await updateGoods({ ...goods, status: newStatus })
  ElMessage.success(newStatus === 1 ? '已上架' : '已下架')
  await loadData()
}

/** 删除商品 */
async function handleDelete(goods: Goods) {
  const confirmed = await ElMessageBox.confirm(`确定要删除「${goods.goodsName}」吗？`, '提示', {
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) {
    return
  }
  await deleteGoods(goods.id)
  ElMessage.success('商品已删除')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="商品管理" subtitle="维护外卖和小卖部的商品" />

    <div class="card">
      <div class="filter-bar">
        <el-select v-model="query.shopId" style="width: 220px" @change="loadData">
          <el-option label="全部店铺" :value="0" />
          <el-option
            v-for="shop in shopList"
            :key="shop.id"
            :label="`${shop.shopName}（${shop.shopType === 2 ? '外卖' : '小卖部'}）`"
            :value="shop.id"
          />
        </el-select>
        <el-input v-model="query.keyword" placeholder="商品名称关键字" style="width: 220px" />
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="openAddDialog">新增商品</el-button>
      </div>

      <el-table :data="showGoods" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" />
        <el-table-column label="所属店铺" width="180">
          <template #default="{ row }">{{ getShopName(row.shopId) }}</template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">￥{{ formatMoney(row.price) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="sales" label="销量" width="80" />
        <el-table-column prop="unit" label="单位" width="70" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">修改</el-button>
            <el-button link type="primary" @click="handleChangeStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增 / 修改商品弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId === 0 ? '新增商品' : '修改商品'" width="480px">
      <el-form label-width="90px">
        <el-form-item label="所属店铺">
          <el-select v-model="goodsForm.shopId" style="width: 260px" @change="onShopChange">
            <el-option
              v-for="shop in shopList"
              :key="shop.id"
              :label="shop.shopName"
              :value="shop.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="goodsForm.categoryId" style="width: 260px" placeholder="请选择分类">
            <el-option
              v-for="category in categoryList"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="goodsForm.goodsName" />
        </el-form-item>
        <el-form-item label="现价">
          <el-input-number v-model="goodsForm.price" :min="0" :precision="2" :step="0.5" />
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="goodsForm.originalPrice" :min="0" :precision="2" :step="0.5" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="goodsForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="goodsForm.unit" style="width: 120px" placeholder="份 / 瓶 / 包" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="goodsForm.description" />
        </el-form-item>
        <el-form-item label="上架">
          <el-switch v-model="goodsForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
