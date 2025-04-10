import './main.css';
// 应用入口文件,负责创建 Vue 实例并挂载到 DOM 上
import './style.css'
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 导入路由配置
import 'vue3-audio-player/dist/style.css'
import { createPinia } from 'pinia';//状态管理
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

//提示插件
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'  // 引入样式


// 创建 Vue 应用并使用 Vue Router
const app = createApp(App);
app.use(router);
app.use(ElementPlus) // 安装 Element Plus
app.use(Toast, {
  // 可选配置
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  transition: 'Vue-Toastification__fade',
  position: 'top-right',
});
app.use(createPinia());
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.mount('#app'); // 挂载 Vue 应用到 id="app" 的元素