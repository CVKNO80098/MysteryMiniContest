<script setup lang="ts">
/**
 * 页面小标题：每个页面顶部都用它，保持风格统一
 */
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="page-title">
    <h2>{{ title }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 16px;
}

.page-title h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #303133;
}

.page-title p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
</style>
