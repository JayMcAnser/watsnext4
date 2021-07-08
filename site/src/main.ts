
import { createApp } from 'vue'
import App from './pages/index.vue';
const app = createApp(App)
import PrimeVue from 'primevue/config';

import 'primeflex/primeflex.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';


app.use(PrimeVue)

import Button from "primevue/button";
import TabMenu from "primevue/tabmenu";
import InputText from 'primevue/inputtext'
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import PanelMenu from "primevue/panelmenu";
import Listbox from "primevue/listbox";
import Menu from "primevue/menu";

// import VueSidebarMenu from 'vue-sidebar-menu';

app.component('Button', Button)
app.component('TabMenu', TabMenu )
app.component('InputText', InputText)
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('Listbox', Listbox)
app.component('PanelMenu', PanelMenu);
app.component('Menu', Menu)
// app.component('VueSidebarMenu', VueSidebarMenu)

import { router } from './routes/index'
import 'primeflex/primeflex.css';

import './css/index.css';
import './css/test.css';

import { store } from './store';
import VueSvgInlinePlugin from "vue-svg-inline-plugin";


  // smaller footprint see: https://github.com/oruga-ui/oruga

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
