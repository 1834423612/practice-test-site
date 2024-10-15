<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <a href="/" class="flex">
              <img src="/avatar.png" alt="Avatar" class="w-8 h-8 rounded-md mx-auto" />
              <h1 class="text-2xl font-bold ml-2">Practice Test</h1>
              <Icon icon="lucide:book-open" class="ml-2 w-8 h-8" />
            </a>
          </div>
          <nav>
            <ul class="flex space-x-6">
              <li><a href="/"
                  class="hover:text-blue-200 hover:underline hover:underline-offset-1 transition duration-300">Home</a>
              </li>
              <li><a href="/about"
                  class="hover:text-blue-200 hover:underline hover:underline-offset-1 transition duration-300">About</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <main class="container mx-auto p-4 mt-8">
      <router-view></router-view>
    </main>
    <!-- <footer class="bg-gray-800 text-white py-4 mt-12">
      <div class="container mx-auto px-4 text-center">
        <p>&copy; All rights reserved.</p>
      </div>
    </footer> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Icon } from '@iconify/vue'

export default defineComponent({
  name: 'App',
  components: {
    Icon
  }
})
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
}

.router-link-active {
  @apply font-semibold text-blue-200;
}
</style>