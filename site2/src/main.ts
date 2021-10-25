import { createApp } from 'vue'
import App from './pages/index.vue'
import './css/index.css'

const app = createApp(App);

import { store } from './store/index.js';
import { router } from './routes'
app.use(store);
app.use(router)
app.mount('#app')

store.dispatch('auth/restore')
