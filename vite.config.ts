import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { qrcode } from "vite-plugin-qrcode";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [IconsResolver({ prefix: 'Icon' })] // 自动导入 Iconify 图标
    }),
    Components({
      resolvers: [IconsResolver()] // 自动注册 Iconify 图标组件
    }),
    Icons({}),
    qrcode()
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    open: true
  }
})
