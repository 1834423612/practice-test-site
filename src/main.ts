import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Swal from 'sweetalert2'
import { Icon } from '@iconify/vue'
import { createPinia } from "pinia"
import './assets/tailwind.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.config.globalProperties.$swal = Swal
app.component('Icon', Icon)
app.use(pinia)
app.mount('#app')
