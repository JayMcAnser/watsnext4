import { createApp } from 'vue'
import App from './pages/index.vue'
// import {debug} from './vendors/lib/logging'
import './css/index.css'
// @ts-ignore
import {dbInit} from './lib/store';
const app = createApp(App);

// @ts-ignore
import { store } from './store/index.js';
import { router } from './routes'
app.use(store);
app.use(router)
app.mount('#app')


// this will call dbInit when the login is done or the restore has been done
store.dispatch('auth/registerEvent', {name: 'dbInit', call: dbInit, action: 'login'})
store.dispatch('auth/restore')
