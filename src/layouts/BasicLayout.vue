/**
 * 顾客端布局
 * 结构：顶部（logo + 菜单 + 登录态）→ 内容区 → 页脚
 * 右上角分两种：登录了显示昵称/身份/退出，没登录显示登录和注册；骑手工作台、管理端只对相应身份显示
 */
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { USER_ROLE_TEXT } from '@/utils/dict'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

/** 顶部导航菜单，index 用路由地址，el-menu 打开 router 模式就能自动跳转 */
const menus = computed(() => {
  const list = [
    { path: '/', label: '首页', icon: 'HomeFilled' },
    { path: '/express', label: '代取快递', icon: 'Box' },
    { path: '/food', label: '校园外卖', icon: 'Food' },
    { path: '/shop', label: '小卖部', icon: 'ShoppingCart' },
    { path: '/order', label: '我的订单', icon: 'Tickets' },
  ]
  // 只有骑手能看到这个入口
  if (userStore.isRider) {
    list.push({ path: '/rider', label: '骑手工作台', icon: 'Bicycle' })
  }
  return list
})

/** 当前菜单高亮：/food/1 这类子页面也要让 /food 高亮 */
const activeMenu = computed(() => {
  const matched = menus.value.find((menu) => menu.path !== '/' && route.path.startsWith(menu.path))
  return matched ? matched.path : route.path
})

/** 右上角显示的身份文字 */
const roleText = computed(() =>
  userStore.currentUser ? USER_ROLE_TEXT[userStore.currentUser.role] : '',
)

/** 退出登录：只清掉浏览器里的记录，不需要请求后端 */
async function handleLogout() {
  const confirmed = await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) {
    return
  }
  userStore.logout()
  cartStore.reset()
  ElMessage.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  // 已登录才需要查购物车，没登录就直接跳过
  if (userStore.isLogin) {
    cartStore.loadCart()
  }
})
</script>

<template>
  <div class="layout">
    <header class="layout-header">
      <div class="layout-header-inner">
        <div class="layout-logo" @click="router.push('/')">
          校园跑腿
          <span class="layout-logo-tip">代取快递 · 校园外卖 · 小卖部送货</span>
        </div>

        <el-menu :default-active="activeMenu" mode="horizontal" router class="layout-menu">
          <el-menu-item v-for="menu in menus" :key="menu.path" :index="menu.path">
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.label }}</span>
          </el-menu-item>
        </el-menu>

        <div class="layout-right">
          <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0">
            <el-button link @click="router.push('/cart')">
              <el-icon><ShoppingCart /></el-icon>
              购物车
            </el-button>
          </el-badge>

          <!-- 已登录 -->
          <template v-if="userStore.isLogin">
            <span class="layout-user">
              {{ userStore.displayName }}（{{ roleText }}）
            </span>
            <el-button link @click="router.push('/profile')">个人中心</el-button>
            <el-button v-if="userStore.isRider" link @click="router.push('/rider')">
              骑手工作台
            </el-button>
            <el-button v-if="userStore.isAdmin" link @click="router.push('/admin')">
              管理端
            </el-button>
            <el-button link type="danger" @click="handleLogout">退出登录</el-button>
          </template>

          <!-- 未登录 -->
          <template v-else>
            <el-button link @click="router.push('/login')">登录</el-button>
            <el-button type="primary" size="small" @click="router.push('/register')">
              注册
            </el-button>
          </template>
        </div>
      </div>
    </header>

    <main class="layout-main">
      <router-view />
    </main>

    <footer class="layout-footer">
      校园代跑腿示例项目 · 前端 Vue3 + Element Plus · 后端 SpringBoot + MySQL
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.layout-header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.layout-logo {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  white-space: nowrap;
}

.layout-logo-tip {
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: #909399;
}

.layout-menu {
  flex: 1;
  border-bottom: none;
}

.layout-right {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.layout-user {
  margin-left: 12px;
  margin-right: 8px;
  font-size: 13px;
  color: #606266;
}

.layout-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
}

.layout-footer {
  text-align: center;
  font-size: 12px;
  color: #909399;
  padding: 16px;
}
</style>
