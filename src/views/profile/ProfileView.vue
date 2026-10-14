<script setup lang="ts">
/**
 * 个人中心
 * 两块内容：当前用户资料（代替登录信息）+ 收货地址管理。
 */
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteAddress,
  getAddressList,
  saveAddress,
  setDefaultAddress,
  updateAddress,
} from '@/api/address'
import type { Address } from '@/types'
import { useUserStore } from '@/stores/user'
import EmptyBox from '@/components/EmptyBox.vue'
import PageTitle from '@/components/PageTitle.vue'
import { USER_ROLE_TEXT } from '@/utils/dict'

const userStore = useUserStore()

const addressList = ref<Address[]>([])
const dialogVisible = ref(false)
const editingId = ref(0) // 0 表示新增地址，其他值表示正在修改哪一条

/** 地址表单 */
const addressForm = reactive({
  contactName: '',
  phone: '',
  building: '',
  room: '',
  detail: '',
  isDefault: 0,
})

/** 加载地址列表 */
async function loadAddressList() {
  addressList.value = await getAddressList(userStore.userId)
}

/** 打开“新增地址”弹窗 */
function openAddDialog() {
  editingId.value = 0
  addressForm.contactName = userStore.currentUser ? userStore.currentUser.realName : ''
  addressForm.phone = userStore.currentUser ? userStore.currentUser.phone : ''
  addressForm.building = ''
  addressForm.room = ''
  addressForm.detail = ''
  addressForm.isDefault = 0
  dialogVisible.value = true
}

/** 打开“修改地址”弹窗 */
function openEditDialog(address: Address) {
  editingId.value = address.id
  addressForm.contactName = address.contactName
  addressForm.phone = address.phone
  addressForm.building = address.building
  addressForm.room = address.room
  addressForm.detail = address.detail
  addressForm.isDefault = address.isDefault
  dialogVisible.value = true
}

/** 保存地址（新增或修改） */
async function handleSaveAddress() {
  if (!addressForm.contactName) {
    ElMessage.warning('请填写收货人')
    return
  }
  if (!addressForm.building) {
    ElMessage.warning('请填写宿舍楼')
    return
  }
  if (!addressForm.room) {
    ElMessage.warning('请填写房间号')
    return
  }

  const address: Address = {
    id: editingId.value,
    userId: userStore.userId,
    contactName: addressForm.contactName,
    phone: addressForm.phone,
    building: addressForm.building,
    room: addressForm.room,
    detail: addressForm.detail,
    isDefault: addressForm.isDefault,
  }

  if (editingId.value === 0) {
    await saveAddress(address)
    ElMessage.success('地址已添加')
  } else {
    await updateAddress(address)
    ElMessage.success('地址已修改')
  }
  dialogVisible.value = false
  await loadAddressList()
}

/** 设为默认地址 */
async function handleSetDefault(address: Address) {
  await setDefaultAddress(address.id, userStore.userId)
  ElMessage.success('已设为默认地址')
  await loadAddressList()
}

/** 删除地址 */
async function handleDelete(address: Address) {
  const confirmed = await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', { type: 'warning' })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) {
    return
  }
  await deleteAddress(address.id)
  ElMessage.success('地址已删除')
  await loadAddressList()
}

/** 保存用户资料 */
async function handleSaveUser() {
  if (!userStore.currentUser) {
    ElMessage.warning('请先登录')
    return
  }
  await userStore.saveCurrentUser(userStore.currentUser)
  ElMessage.success('资料已保存')
}

onMounted(loadAddressList)
</script>

<template>
  <div>
    <PageTitle title="个人中心" subtitle="这里显示的是登录账号的资料，改完点“保存资料”就写回 user 表" />

    <!-- 用户资料 -->
    <div class="card">
      <h3 class="block-title">我的资料</h3>
      <el-form v-if="userStore.currentUser" label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="userStore.currentUser.username" disabled style="width: 260px" />
        </el-form-item>
        <el-form-item label="身份">
          <el-tag>{{ USER_ROLE_TEXT[userStore.currentUser.role] }}</el-tag>
          <span class="text-muted" style="margin-left: 8px">身份由数据库里的 role 字段决定</span>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userStore.currentUser.realName" style="width: 260px" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userStore.currentUser.nickname" style="width: 260px" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userStore.currentUser.phone" style="width: 260px" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="userStore.currentUser.studentNo" style="width: 260px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSaveUser">保存资料</el-button>
        </el-form-item>
      </el-form>
      <el-empty v-else description="还没有登录" :image-size="60" />
    </div>

    <!-- 收货地址 -->
    <div class="card">
      <div class="flex-between" style="margin-bottom: 12px">
        <h3 class="block-title" style="margin: 0">收货地址</h3>
        <el-button type="primary" @click="openAddDialog">新增地址</el-button>
      </div>

      <EmptyBox v-if="addressList.length === 0" text="还没有收货地址，先添加一个吧" />

      <el-table v-else :data="addressList" style="width: 100%">
        <el-table-column prop="contactName" label="收货人" width="110" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="地址">
          <template #default="{ row }">{{ row.building }} {{ row.room }}</template>
        </el-table-column>
        <el-table-column prop="detail" label="补充说明" />
        <el-table-column label="默认" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault === 1" type="success" size="small">默认</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">修改</el-button>
            <el-button link type="primary" @click="handleSetDefault(row)">设为默认</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增 / 修改地址弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId === 0 ? '新增地址' : '修改地址'" width="460px">
      <el-form label-width="90px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.contactName" placeholder="例如：张小明" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.phone" placeholder="例如：13800000001" />
        </el-form-item>
        <el-form-item label="宿舍楼">
          <el-input v-model="addressForm.building" placeholder="例如：3号楼" />
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="addressForm.room" placeholder="例如：302" />
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input v-model="addressForm.detail" placeholder="例如：放门口鞋柜上" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.block-title {
  margin: 0 0 12px;
  font-size: 16px;
}
</style>
