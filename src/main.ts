import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Swal from 'sweetalert2'
import { Icon } from '@iconify/vue'
import './assets/tailwind.css'


const app = createApp(App)
app.use(router)
app.config.globalProperties.$swal = Swal
app.component('Icon', Icon)
app.mount('#app')
