<template>
  <div>
    <div  class="hidden md:flex md:flex-shrink-0">
      <div class="w-64 flex-col">
<!--
        <panel-menu
            :model="items"
            :expandedKeys="expandedKeys"
        >

        </panel-menu>
        ll{{expandedKeys}}
-->
        <Accordion :active-index="panelActive">
          <AccordionTab
              v-for="tab in navigation" :key="tab.key"
              :header="tab.label">
            <Menu
                style="border: 0; width: 100%;"
                :model="tab.items">

            </Menu>
          </AccordionTab>
        </Accordion>



<!--
        <div class="menu-category">Art</div>
        <div >
          <Button label="active new" @click="active('art/new')"></Button>
          <Button label="active list" @click="active('artist/list')"></Button>
        </div>
        <div>active index: {{ panelActive }}</div>
-->
      <!--
        <sidebar-menu :menu="menu">

        </sidebar-menu>
        -->
        <!-- Sidebar component, swap this element with another sidebar if you like -->
        <!-- <div class="border-r border-gray-200 pt-5 pb-4 flex flex-col flex-grow overflow-y-auto">
          <div class="flex-shrink-0 px-4 flex items-center">
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg" alt="Workflow" />
          </div>
          <div class="flex-grow mt-5 flex flex-col">
            <nav class="flex-1 bg-white px-2 space-y-1">
              <div v-for="item in navigation" :key="item.name">
                <router-link v-if="itemVisible(item.key)" :to="item.to" :class="[itemActive(item.key) ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900', 'group rounded-md py-2 px-2 flex items-center text-sm font-medium']">
                  <component :is="item.icon" :class="[item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500', 'mr-3 flex-shrink-0 h-6 w-6']" aria-hidden="true" />
                  {{ item.name }}
                </router-link>
              </div>
            </nav>
          </div>
        </div>
        -->
      </div>
    </div>
  </div>
</template>

<script>


import {useStore} from "vuex";
import {debug} from '../vendors/lib/logging'
import {computed, ref, watch} from 'vue'


let nav = [
  {
    label: 'Home',
    key: 'home',
    items: [
      {label: 'About', key: 'about', to: '/about'}
    ]
  },
  {
    label: 'Art',
    key: 'art',
    items: [
      {label: 'List', icon: 'list', key: 'art/list', to: '/art'},
      {label: 'New', icon: 'icp-new', key: 'art/new', to: '/notyet'},
      {label: 'Royalties', icon: 'icp-new', key: 'art/royalties', to: '/notyet'},
    ]
  },
  {
    label: 'Artist',
    key: 'artist',
    items: [
      {label: 'List', icon: 'list', to: '/notyet'},
      {label: 'New',  icon:'new', class:'XXXXX', to: '/notyet'}
    ]
  }
]



export default {
  name: "menu-main",

  setup() {
    const store = useStore()
    const itemVisible = function(part) {
      let visible = store.getters['user/rightsView'](part);
     // debug(`menu[${part}] = ${visible}`)
      return visible
    }
    const panelActive = ref(1)
    // const activeRoot = computed(() => {
    //   debug('menu root changed')
    //   let root = store.getters['menu/active'][0];
    //   for (let index = 0; index < nav.length; index++) {
    //     if (root === nav[index].key) {
    //       return index
    //     }
    //   }
    //   return 0;
    // })
 //   const activeRoot = ref(0)
    const menuRootActive = computed(() => {
      return store.getters['menu/active'][0]
    })

    const navigation = ref(nav)
    const active = async (part) => {
      await store.dispatch('menu/activate', part);
//      debug(`set menu: ${root}`);
      // for (let partIndex = 0; partIndex < navigation.value.length; partIndex++) {
      //   for (let index = 0; index < navigation.value[partIndex].items.length; index++) {
      //     if (navigation.value[partIndex].items[index].key === part) {
      //       panelActive.value = partIndex
      //       debug(`found it ${panelActive.value}`)
      //
      //       navigation.value[partIndex].items[index].class = 'XXXXX'
      //       console.log(navigation.value)
      //     } else {
      //       delete navigation.value[partIndex].items[index].class
      //     }
      //   }
      // }
    }
    store.subscribe((mutation, state) => {

      let root = store.getters['menu/active'][0];
      debug(`changed menu, ${mutation.type}, root: ${root}`);
      let activeIndex = 0;
      console.log(nav)
      for (let index = 0; index < nav.length; index++) {
        console.log(root === nav[index].key, root, nav[index].key)
        if (root === nav[index].key) {
          activeIndex = index
          break
        }
      }
      panelActive.value = activeIndex
      debug(`activate: ${activeIndex}`)
    })
    return {
      navigation,
      active,
      // activeRoot,
      itemVisible,
      panelActive
    }
  }

}
</script>

<style  >
 .p-accordion-content > .p-menu {
   width: 100%;
   border: 0;
 }
 .p-menu .XXXXX .p-menuitem-link .p-menuitem-text {
   color: red !important;
 }

</style>
