<script setup lang="ts">
/**
 * 管理端 - 公告管理
 * 结构：类型筛选 → 公告表格 → 新增/修改弹窗
 * 首页只显示 type=1 且 status=1 的；轮播图（type=2）目前还没页面用，先留着
 */
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteAnnouncement, saveAnnouncement, updateAnnouncement } from '@/api/admin'
import { getAllAnnouncementList } from '@/api/announcement'
import type { Announcement } from '@/types'
import EmptyBox from '@/components/EmptyBox.vue'
import PageTitle from '@/components/PageTitle.vue'
import { formatTime } from '@/utils/format'

const noticeList = ref<Announcement[]>([])
const loading = ref(false)

// 0 全部，1 公告，2 轮播图
const queryType = ref(0)

const dialogVisible = ref(false)
const editingId = ref(0) // 0 表示新增

// 弹窗表单
const noticeForm = reactive({
  title: '',
  content: '',
  type: 1,
  sort: 0,
  status: 1,
})

// 选了类型就过滤一下
const showList = computed(() => {
  if (queryType.value === 0) {
    return noticeList.value
  }
  return noticeList.value.filter((item) => item.type === queryType.value)
})

// 查全部（含已下架的）
async function loadData() {
  loading.value = true
  noticeList.value = await getAllAnnouncementList()
  loading.value = false
}

// 打开新增弹窗
function openAddDialog() {
  editingId.value = 0
  noticeForm.title = ''
  noticeForm.content = ''
  noticeForm.type = 1
  noticeForm.sort = 0
  noticeForm.status = 1
  dialogVisible.value = true
}

// 打开修改弹窗
function openEditDialog(item: Announcement) {
  editingId.value = item.id
  noticeForm.title = item.title
  noticeForm.content = item.content
  noticeForm.type = item.type
  noticeForm.sort = item.sort
  noticeForm.status = item.status
  dialogVisible.value = true
}

// 保存
async function handleSave() {
  if (!noticeForm.title) {
    ElMessage.warning('请填写标题')
    return
  }

  const item: Announcement = {
    id: editingId.value,
    title: noticeForm.title,
    content: noticeForm.content,
    image: '', // 图片上传还没做，先传空串
    type: noticeForm.type,
    status: noticeForm.status,
    sort: noticeForm.sort,
  }

  if (editingId.value === 0) {
    await saveAnnouncement(item)
    ElMessage.success('公告已添加')
  } else {
    await updateAnnouncement(item)
    ElMessage.success('公告已修改')
  }

  dialogVisible.value = false
  await loadData()
}

// 发布 / 下架
async function handleChangeStatus(item: Announcement) {
  const status = item.status === 1 ? 0 : 1
  await updateAnnouncement({ ...item, status })
  ElMessage.success(status === 1 ? '已发布' : '已下架')
  await loadData()
}

// 删除
async function handleDelete(item: Announcement) {
  const confirmed = await ElMessageBox.confirm(`确定删除「${item.title}」吗？`, '提示', {
    type: 'warning',
  })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) {
    return
  }
  await deleteAnnouncement(item.id)
  ElMessage.success('已删除')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div v-loading="loading">
    <PageTitle title="公告管理" subtitle="首页显示的是「公告」且「已发布」的那几条，下架就不会出现在首页" />

    <div class="card">
      <div class="filter-bar">
        <el-radio-group v-model="queryType">
          <el-radio-button :value="0">全部</el-radio-button>
          <el-radio-button :value="1">公告</el-radio-button>
          <el-radio-button :value="2">轮播图</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="openAddDialog">新增公告</el-button>
      </div>

      <EmptyBox v-if="showList.length === 0" text="还没有公告，先加一条吧" />

      <el-table v-else :data="showList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 1 ? 'primary' : 'warning'">
              {{ row.type === 1 ? '公告' : '轮播图' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已发布' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="140">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">修改</el-button>
            <el-button link type="primary" @click="handleChangeStatus(row)">
              {{ row.status === 1 ? '下架' : '发布' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增 / 修改弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId === 0 ? '新增公告' : '修改公告'"
      width="520px"
    >
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="noticeForm.title" placeholder="例如 平台试运行公告" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="noticeForm.type">
            <el-radio :value="1">公告（显示在首页）</el-radio>
            <el-radio :value="2">轮播图</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="一句话说明"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="noticeForm.sort" :min="0" />
          <span class="text-muted" style="margin-left: 8px">数字小的排前面</span>
        </el-form-item>
        <el-form-item label="发布">
          <el-switch v-model="noticeForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
