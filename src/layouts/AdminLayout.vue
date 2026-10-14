/**
 * 后台管理布局：左侧菜单 + 右侧内容
 * 顾客端用的是 BasicLayout（顶部导航），两者不要混用
 */
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

// 左侧菜单：index 就是路由地址，el-menu 打开 router 模式后点菜单会自动跳转
const menus = [
  { path: '/admin', label: '数据概览' },
  { path: '/admin/goods', label: '商品管理' },
  { path: '/admin/orders', label: '订单管理' },
  { path: '/admin/users', label: '用户管理' },
]
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-aside">
      <div class="admin-logo">校园跑腿 · 管理端</div>
      <el-menu :default-active="route.path" router>
        <el-menu-item v-for="menu in menus" :key="menu.path" :index="menu.path">
          {{ menu.label }}
        </el-menu-item>
      </el-menu>
    </aside>

    <section class="admin-main">
      <header class="admin-header">
        <span>后台管理</span>
        <el-button link type="primary" @click="$router.push('/')">返回顾客端</el-button>
      </header>
      <div class="admin-body">
        <el-alert
          v-if="!userStore.isAdmin"
          type="warning"
          :closable="false"
          title="当前账号不是管理员"
          description="请退出后用管理员账号登录（演示账号 wanglaoshi / 123456）。这只是页面提示，后端没有做权限拦截。"
          style="margin-bottom: 16px"
        />
        <router-view />
      </div>
    </section>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-aside {
  width: 200px;
  background: #fff;
  border-right: 1px solid #ebeef5;
}

.admin-logo {
  height: 56px;
  line-height: 56px;
  text-align: center;
  font-weight: bold;
  color: #409eff;
  border-bottom: 1px solid #ebeef5;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.admin-header {
  height: 56px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-body {
  flex: 1;
  padding: 16px;
}
</style>
