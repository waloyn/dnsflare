import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import i18n from './locales'
// Element Plus components are auto-resolved by unplugin-vue-components; only
// the imperative API (ElMessage) and the v-loading directive need explicit
// setup here.
import { ElLoading } from 'element-plus'
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/theme-chalk/src/dark/css-vars.scss'
import 'normalize.css/normalize.css'
import './styles/global.scss'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(ElLoading)
app.use(router)
app.use(i18n)
import './utils/icon'

app.mount('#app')

export default app
