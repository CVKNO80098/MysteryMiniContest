<script setup lang="ts">
/**
 * 管理端 - 用户管理
 * 结构：用户表格 → 启用/禁用
 */
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserStatus } from '@/api/admin'
import { getUserList } from '@/api/user'
import type { User } from '@/types'
import PageTitle from '@/components/PageTitle.vue'
import { getUserRoleText } from '@/utils/dict'
import { formatMoney, formatTime } from '@/utils/format'

const userList = ref<User[]>([])
const loading = ref(false)

async function loadUserList() {
  loading.value = true
  try {
    userList.value = await getUserList()
  } finally {
    loading.value = false
  }
}

/** 切换启用 / 禁用 */
async function handleChangeStatus(user: User) {
  const newStatus = user.status === 1 ? 0 : 1
  await updateUserStatus(user.id, newStatus)
  ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
  await loadUserList()
}

onMounted(loadUserList)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="用户管理" subtitle="顾客、骑手、管理员都在 user 表里，用 role 区分" />

    <div class="card">
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="realName" label="姓名" width="110" />
        <el-table-column label="身份" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getUserRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column label="余额" width="100">
          <template #default="{ row }">￥{{ formatMoney(row.balance) }}</template>
        </el-table-column>
        <el-table-column label="注册时间" width="150">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link :type="row.status === 1 ? 'danger' : 'primary'" @click="handleChangeStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
