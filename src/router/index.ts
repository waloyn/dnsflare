import * as VueRouter from 'vue-router'
import LoginComponent from '@/route/Login.vue'
import zoneRoutes from './zone'
import { useUserStore } from '@/store/user'


const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes: [{
        name: 'LoginPage',
        component: LoginComponent,
        path: '/',
    }, ...zoneRoutes],
})

router.beforeEach((to) => {
    const userStore = useUserStore()
    const loggedIn = Boolean(userStore.token || userStore.globalToken)

    if (to.name !== 'LoginPage' && !loggedIn) {
        return { name: 'LoginPage' }
    }
})

export default router
