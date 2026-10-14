<script setup lang="ts">
/**
 * 注册页
 *
 * 把表单 POST 给后端（/api/user/register），后端往 user 表插一条记录（role 固定为 1 顾客）。
 * 注册成功不自动登录，回到登录页手动登录一次，流程更好理解。
 */
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

/** 注册表单 */
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  studentNo: '',
})

/** 检查表单，有问题就返回 false 并弹提示 */
function checkForm(): boolean {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return false
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    return false
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一样')
    return false
  }
  if (!form.realName.trim()) {
    ElMessage.warning('请输入真实姓名')
    return false
  }
  return true
}

/** 点注册按钮 */
async function handleRegister() {
  if (!checkForm()) {
    return
  }

  loading.value = true
  const user = await userStore.register({
    username: form.username,
    password: form.password,
    realName: form.realName,
    nickname: form.realName,
    phone: form.phone,
    studentNo: form.studentNo,
    avatar: '',
  })
  loading.value = false

  if (!user) {
    ElMessage.error('注册失败，用户名可能已经被占用了')
    return
  }

  ElMessage.success('注册成功，请用新账号登录')
  router.push('/login')
}
</script>

<template>
  <div class="register-page">
    <div class="register-box">
      <h1 class="register-title">注册新账号</h1>
      <p class="register-sub">注册后默认是“顾客”身份，用这个账号就能下单</p>

      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="登录时用，例如 xiaoming" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="再输一次" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" placeholder="例如 张小明" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="选填，方便骑手联系你" />
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="form.studentNo" placeholder="选填" />
        </el-form-item>
      </el-form>

      <el-button type="primary" class="register-button" :loading="loading" @click="handleRegister">
        注册
      </el-button>

      <div class="register-foot">
        <el-button link type="primary" @click="router.push('/login')">已经有账号？去登录</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.register-box {
  width: 440px;
  background: #fff;
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.register-title {
  margin: 0 0 6px;
  font-size: 20px;
  text-align: center;
  color: #409eff;
}

.register-sub {
  margin: 0 0 20px;
  text-align: center;
  font-size: 13px;
  color: #909399;
}

.register-button {
  width: 100%;
}

.register-foot {
  margin-top: 12px;
  text-align: center;
}
</style>
