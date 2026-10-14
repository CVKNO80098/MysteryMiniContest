<script setup lang="ts">
/**
 * 登录页
 *
 * 做了什么事：把用户名和密码 POST 给后端（/api/user/login），后端返回用户信息就算登录成功，
 * 然后存进 Pinia（同时写 localStorage），刷新页面不会丢。
 *
 * 本项目不做 JWT：后端不返回 token，前端也不带 token，请求拦截器里没有任何校验。
 */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

/** 登录表单 */
const form = reactive({
  username: '',
  password: '',
})

/** 演示账号：点一下自动填进表单，方便同学试三种身份 */
const demoAccounts = [
  { username: 'xiaoming', password: '123456', label: '张小明（顾客）' },
  { username: 'dali', password: '123456', label: '李大力（骑手）' },
  { username: 'wanglaoshi', password: '123456', label: '王老师（管理员）' },
]

/** 一键填入演示账号 */
function fillAccount(username: string, password: string) {
  form.username = username
  form.password = password
}

/** 点登录按钮 */
async function handleLogin() {
  if (!form.username.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  const user = await userStore.login(form.username, form.password)
  loading.value = false

  if (!user) {
    ElMessage.error('用户名或密码错误')
    return
  }

  ElMessage.success(`欢迎回来，${user.realName}`)

  // 之前想访问哪个页面，登录成功后回到那个页面；没有就回首页
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.push(redirect)
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h1 class="login-title">校园跑腿平台</h1>
      <p class="login-sub">代取快递 · 校园外卖 · 小卖部送货上门</p>

      <el-form label-width="70px">
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
      </el-form>

      <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
        登录
      </el-button>

      <div class="login-foot">
        <el-button link type="primary" @click="router.push('/register')">没有账号？去注册</el-button>
        <el-button link @click="router.push('/')">先随便看看</el-button>
      </div>

      <el-divider>演示账号（密码都是 123456）</el-divider>
      <div class="demo-list">
        <el-button
          v-for="account in demoAccounts"
          :key="account.username"
          size="small"
          @click="fillAccount(account.username, account.password)"
        >
          {{ account.label }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.login-box {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.login-title {
  margin: 0 0 6px;
  font-size: 22px;
  text-align: center;
  color: #409eff;
}

.login-sub {
  margin: 0 0 20px;
  text-align: center;
  font-size: 13px;
  color: #909399;
}

.login-button {
  width: 100%;
}

.login-foot {
  margin-top: 12px;
  text-align: center;
}

.demo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
</style>
