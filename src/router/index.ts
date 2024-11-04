import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PracticeSelection from '../views/PracticeSelection.vue'
import Practice from '../views/Practice.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/practice-selection/:practiceType',
            name: 'PracticeSelection',
            component: PracticeSelection,
            props: true
        },
        {
            path: '/practice/:practiceType',
            name: 'Practice',
            component: Practice,
            props: true
        }
    ]
})

export default router