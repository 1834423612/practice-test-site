<template>
    <div class="fixed inset-0 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <div class="p-6">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon icon="lucide:user" class="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900">
                        {{ isLogin ? 'Welcome Back' : 'Create Account' }}
                    </h2>
                    <p class="text-gray-600 mt-2">
                        {{ isLogin ? 'Sign in to sync your progress' : 'Join to save your progress in the cloud' }}
                    </p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <!-- Username field (only for registration) -->
                    <div v-if="!isLogin">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input v-model="form.username" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Choose a username" />
                    </div>

                    <!-- Email field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input v-model="form.email" type="email" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your email" />
                    </div>

                    <!-- Password field -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input v-model="form.password" type="password" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your password" />
                    </div>

                    <!-- Error message -->
                    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p class="text-red-700 text-sm">{{ error }}</p>
                    </div>

                    <!-- Submit button -->
                    <button type="submit" :disabled="authStore.isLoading"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center">
                        <Icon v-if="authStore.isLoading" icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                        {{ authStore.isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account') }}
                    </button>
                </form>

                <!-- Toggle between login/register -->
                <div class="mt-6 text-center">
                    <p class="text-gray-600 text-sm">
                        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
                        <button @click="isLogin = !isLogin" class="text-blue-600 hover:text-blue-700 font-medium ml-1">
                            {{ isLogin ? 'Sign up' : 'Sign in' }}
                        </button>
                    </p>
                </div>

                <!-- Close button -->
                <button @click="$emit('close')"
                    class="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                    <Icon icon="lucide:x" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const emit = defineEmits<{
    close: []
    success: [user: any]
}>()


const isLogin = ref(true)
const error = ref('')

const form = reactive({
    username: '',
    email: '',
    password: ''
})

const handleSubmit = async () => {
    error.value = ''

    try {
        let result;

        if (isLogin.value) {
            const credentials = {
                email: form.email,
                password: form.password
            }
            result = await authStore.login(credentials)
        } else {
            const credentials = {
                username: form.username,
                email: form.email,
                password: form.password
            }
            result = await authStore.register(credentials)
        }

        if (result.success) {
            emit('success', authStore.currentUser)
        } else {
            error.value = result.error || 'Authentication failed'
        }
    } catch (err) {
        error.value = 'An unexpected error occurred'
        console.error('Auth error:', err)
    }
}
</script>
