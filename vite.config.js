import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createHtmlPlugin } from 'vite-plugin-html' // 导入 createHtmlPlugin

// https://vite.dev/config/
export default defineConfig({
  //reactivityTransform语法糖自动.value,  autoImport自动导入插件
  plugins: [vue({ reactivityTransform: true }), AutoImport({
    imports: [
      'vue', // 自动导入 Vue API，如 ref, reactive, computed 等
      'vue-router', // 自动导入 vue-router 中的函数
      // 可以自定义更多需要自动导入的库或函数
    ],
    dts: true, // 生成自动导入的类型声明文件 (optional)
  }), vueDevTools()
  /*,createHtmlPlugin({})*/],
  // tailwindcss()
  server: {
    port: 3333, // 可根据需要选择其他端口
    open: true, // 启动后自动打开浏览器
    hmr: true,

  },

    base: '/', // 或 '/music/' 根据你部署路径定
    // ...
  
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
