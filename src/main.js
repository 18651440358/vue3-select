import { createApp } from 'vue'
import App from './App.vue'

// 注册字体
import '@/assets/font/HarmonyOS_Sans_SC/font.css'
import '@/assets/font/UIcons/font.css'

import router from './router'

// store 
import store from './store'

createApp(App).use(router).use(store).mount('#app')
