import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import Home from '../views/Home.vue'
import Practice from '../views/Practice.vue'
import About from '@/views/About.vue'

// Global state to track if user is in practice mode
let isPracticeActive = false
let practiceGuardCallback: (() => void) | null = null
let isNavigatingAway = false

// Function to set practice mode state
export function setPracticeMode(active: boolean, guardCallback?: () => void) {
    isPracticeActive = active
    practiceGuardCallback = guardCallback || null
    
    if (active) {
        // Push current state to history to prevent back navigation
        if (typeof window !== 'undefined') {
            history.pushState(null, '', window.location.pathname)
        }
    }
}

// Function to allow navigation (call this before programmatic navigation)
export function allowNavigation() {
    isNavigatingAway = true
    setTimeout(() => {
        isNavigatingAway = false
    }, 100)
}

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
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
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Navigation guard to prevent leaving practice mode
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    // If user is in practice mode and trying to navigate away from practice
    if (isPracticeActive && from.path === '/practice' && to.path !== '/practice' && !isNavigatingAway) {
        // Show confirmation modal through callback
        if (practiceGuardCallback) {
            practiceGuardCallback()
        }
        // Prevent navigation
        next(false)
        return
    }
    
    // Allow navigation
    next()
})

// Enhanced browser navigation protection
if (typeof window !== 'undefined') {
    // Handle browser back/forward buttons with better prevention
    const handlePopState = (event: PopStateEvent) => {
        if (isPracticeActive && !isNavigatingAway) {
            // Prevent the navigation by pushing the current state back
            event.preventDefault()
            history.pushState(null, '', window.location.pathname)
            
            // Show the modal
            if (practiceGuardCallback) {
                practiceGuardCallback()
            }
        }
    }
    
    // Handle page refresh/close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (isPracticeActive && !isNavigatingAway) {
            event.preventDefault()
            const message = 'You have an active practice session. Are you sure you want to leave?'
            event.returnValue = message
            return message
        }
    }
    
    // Handle visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
        if (isPracticeActive && document.hidden) {
            // Optional: You can add logic here if needed when user switches tabs
        }
    }
    
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
}

export default router