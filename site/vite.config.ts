import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig( ({mode}) => {
  console.log('MODE', mode)
  return {
    plugins: [vue()],
    cacheDir: undefined,
  }
})
