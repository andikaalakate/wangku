import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    },
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/pages/login.vue'),
            meta: { requiresAuth: false, layout: 'BlankLayout' }
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/pages/index.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/transactions',
            name: 'transactions',
            component: () => import('@/pages/transactions.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/wishlist',
            name: 'wishlist',
            component: () => import('@/pages/wishlist.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('@/pages/profile.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/laporan',
            name: 'laporan',
            component: () => import('@/pages/laporan.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('@/pages/chat.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    if (authStore.loading) await authStore.initialize()

    const isAuthenticated = !!authStore.user

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if (to.path === '/login' && isAuthenticated) {
        next('/')
    } else {
        next()
    }
})

export default router
