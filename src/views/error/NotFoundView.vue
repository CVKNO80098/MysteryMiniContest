<script setup lang="ts">
/**
 * 404 页面：路由没匹配到时显示
 */
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <el-result icon="warning" title="404" sub-title="页面不存在，可能是地址写错了">
      <template #extra>
        <el-button type="primary" @click="router.push('/')">回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.not-found {
  padding-top: 60px;
}
</style>
