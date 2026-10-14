/**
 * 程序入口
 * 顺序很重要：先注册 Pinia（状态管理）、Router（路由）、Element Plus（界面组件），最后挂载 App。
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 把 Element Plus 的图标全部注册成全局组件，模板里可以直接写 <el-icon><Box /></el-icon>
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

app.use(createPinia())
app.use(router)
// locale 设置成中文，分页、日期等组件才会显示中文
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
