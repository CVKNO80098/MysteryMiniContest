<script setup lang="ts">
/**
 * 代取快递下单页
 * 结构：表单（取件点、取件码、地址）→ 费用预览 → 提交订单
 * 跑腿费按包裹大小算：小件 2 元 / 中件 3 元 / 大件 4 元，再加小费。前端算的只用于显示，金额后端还得再算一遍
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAddressList } from '@/api/address'
import { getStationList } from '@/api/express'
import { createOrder } from '@/api/order'
import type { Address, ExpressStation, OrderCreateForm } from '@/types'
import { useUserStore } from '@/stores/user'
import PageTitle from '@/components/PageTitle.vue'
import { formatMoney } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()

const stationList = ref<ExpressStation[]>([])
const addressList = ref<Address[]>([])

/** 表单数据，字段名尽量和订单表对应，方便对照数据库 */
const form = reactive({
  stationId: 0,
  addressId: 0,
  pickupCode: '',
  expressCompany: '菜鸟驿站',
  packageSize: 1,
  packageWeight: 1,
  tip: 0,
  expectTime: '',
  remark: '',
})

/** 包裹大小对应的跑腿费 */
const PACKAGE_FEE: Record<number, number> = { 1: 2, 2: 3, 3: 4 }

/** 快递公司下拉选项 */
const companyOptions = ['菜鸟驿站', '京东快递', '邮政快递', '顺丰快递', '其他']

const deliveryFee = computed(() => PACKAGE_FEE[form.packageSize] || 2)
const totalAmount = computed(() => deliveryFee.value + Number(form.tip || 0))

/** 加载取件点和我的地址 */
async function loadData() {
  stationList.value = await getStationList()
  addressList.value = await getAddressList(userStore.userId)
}

/** 提交订单 */
async function handleSubmit() {
  // 手动检查必填项，比 el-form 的 rules 更好懂，出错时提示也更直白
  if (!form.stationId) {
    ElMessage.warning('请选择取件点')
    return
  }
  if (!form.pickupCode.trim()) {
    ElMessage.warning('请填写取件码')
    return
  }
  if (!form.addressId) {
    ElMessage.warning('请选择收货地址，没有地址可以去个人中心添加')
    return
  }

  const address = addressList.value.find((item) => item.id === form.addressId)
  if (!address) {
    ElMessage.error('地址不存在，请重新选择')
    return
  }

  const orderForm: OrderCreateForm = {
    orderType: 1, // 1 表示代取快递
    userId: userStore.userId,
    stationId: form.stationId,
    addressId: address.id,
    receiverName: address.contactName,
    receiverPhone: address.phone,
    receiverBuilding: address.building,
    receiverRoom: address.room,
    pickupCode: form.pickupCode,
    expressCompany: form.expressCompany,
    packageSize: form.packageSize,
    packageWeight: form.packageWeight,
    remark: form.remark,
    expectTime: form.expectTime,
    tip: Number(form.tip),
    deliveryFee: deliveryFee.value,
  }

  const order = await createOrder(orderForm)
  ElMessage.success('下单成功，等待骑手接单')
  router.push(`/order/${order.id}`)
}

onMounted(loadData)
</script>

<template>
  <div>
    <PageTitle title="代取快递" subtitle="填好取件码和收货地址，骑手帮你从驿站取回来" />

    <div class="card">
      <el-form label-width="110px">
        <el-form-item label="取件点">
          <el-select v-model="form.stationId" placeholder="请选择快递驿站" style="width: 320px">
            <el-option
              v-for="station in stationList"
              :key="station.id"
              :label="`${station.stationName}（${station.businessHours}）`"
              :value="station.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="快递公司">
          <el-select v-model="form.expressCompany" style="width: 320px">
            <el-option v-for="company in companyOptions" :key="company" :label="company" :value="company" />
          </el-select>
        </el-form-item>

        <el-form-item label="取件码">
          <el-input v-model="form.pickupCode" placeholder="例如 8-2-3021" style="width: 320px" />
        </el-form-item>

        <el-form-item label="包裹大小">
          <el-radio-group v-model="form.packageSize">
            <el-radio-button :value="1">小件（2 元）</el-radio-button>
            <el-radio-button :value="2">中件（3 元）</el-radio-button>
            <el-radio-button :value="3">大件（4 元）</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="包裹重量">
          <el-input-number v-model="form.packageWeight" :min="0.1" :step="0.5" :precision="1" />
          <span class="text-muted" style="margin-left: 8px">千克</span>
        </el-form-item>

        <el-form-item label="收货地址">
          <el-select v-model="form.addressId" placeholder="请选择宿舍地址" style="width: 320px">
            <el-option
              v-for="address in addressList"
              :key="address.id"
              :label="`${address.building} ${address.room}（${address.contactName}）`"
              :value="address.id"
            />
          </el-select>
          <el-button link type="primary" @click="router.push('/profile')">去添加地址</el-button>
        </el-form-item>

        <el-form-item label="期望送达">
          <el-date-picker
            v-model="form.expectTime"
            type="datetime"
            placeholder="不填表示尽快送达"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="小费">
          <el-input-number v-model="form.tip" :min="0" :step="0.5" :precision="1" />
          <span class="text-muted" style="margin-left: 8px">元，给小费更容易被接单</span>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
            placeholder="例如：中午 12 点前送到"
            style="width: 420px"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 费用预览 + 提交 -->
    <div class="card flex-between">
      <div>
        <span class="text-muted">跑腿费 ￥{{ formatMoney(deliveryFee) }}</span>
        <span class="text-muted" style="margin: 0 8px">+</span>
        <span class="text-muted">小费 ￥{{ formatMoney(form.tip) }}</span>
        <span class="text-muted" style="margin: 0 8px">=</span>
        <span class="price">￥{{ formatMoney(totalAmount) }}</span>
      </div>
      <el-button type="primary" size="large" @click="handleSubmit">提交订单</el-button>
    </div>
  </div>
</template>
