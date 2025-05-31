import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../views/Home.vue'
import Practice from '../views/Practice.vue'
import About from '@/views/About.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Practice
    },
    {
        path: '/practice',
        name: 'Practice',
        component: Practice
    },
    {
        path: '/about',
        name: 'About',
        component: About
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        // 如果有保存的位置则返回保存的位置，否则返回顶部
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

export default router