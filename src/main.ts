import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import i18n from './locales'
import ElementPlus from 'element-plus'
import './styles/global.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/src/dark/css-vars.scss'
import 'normalize.css/normalize.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(i18n)
import './utils/icon'

// const app = new Vue({
//     el: '#app',
//     router,
//     store,
//     components: { App },
//     template: '<App/>',
// })

app.mount('#app')

export default app
