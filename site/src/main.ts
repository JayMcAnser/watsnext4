
import { createApp } from 'vue'


import App from './pages/index.vue';
import './css/index.css';
import { router } from './routes/index'
import { store } from './store';
import VueSvgInlinePlugin from "vue-svg-inline-plugin";
const app = createApp(App)
import Rights from './lib/rights';

// @ts-ignore
app.use(router)
app.use(store);
app.use(VueSvgInlinePlugin)

let handleOutsideClick;
app.directive('click-outside', {
  beforeMount (el, binding, vnode) {
    let handleOutsideClick = (e) => {
      e.stopPropagation()
      const handler = binding.value
      let clickedOnExcludedEl = false
      // exclude.forEach(refName => {
      //   if (!clickedOnExcludedEl) {
      //     const excludedEl = binding.instance.$refs[refName]
      //     clickedOnExcludedEl = excludedEl.contains(e.target)
      //   }
      // })
      if (!el.contains(e.target)) { //} && !clickedOnExcludedEl) {
        let vm = binding.instance
        if (typeof handler !== 'function') {
          console.error(`[click-outside] handler is not a function`)
        } else {
          handler()
        }
      }
    }
    document.addEventListener('click', handleOutsideClick)
    document.addEventListener('dblclick', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
  },

  unmounted () {
    document.removeEventListener('click', handleOutsideClick)
    document.removeEventListener('dblclick', handleOutsideClick)
    document.removeEventListener('touchstart', handleOutsideClick)
  }
})

app.mount('#app')
console.log('store', store.getters['menu/active'])
export default app;
