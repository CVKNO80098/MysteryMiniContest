<script setup lang="ts">
/**
 * 空数据提示：列表没数据时统一显示它，不要每个页面各写一套
 */
withDefaults(
  defineProps<{
    text?: string
  }>(),
  { text: '暂时没有数据' },
)
</script>

<template>
  <el-empty :description="text" />
</template>
