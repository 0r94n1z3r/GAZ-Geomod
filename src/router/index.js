import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/Home.vue'
import Auth from '@/views/Auth.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/auth',
            name: 'auth',
            component: Auth
        },
        {
            path: '/constructor',
            name: 'constructor',
        },

        // CDN
        {
            path: '/docs/report.docx',
        },
    ]
})

export default router
