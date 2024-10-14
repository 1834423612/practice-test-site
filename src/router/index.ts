import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../views/Home.vue'
import Practice from '../views/Practice.vue'

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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router